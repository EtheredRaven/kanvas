const { hexStringToInt } = require("./utils.js");

module.exports = async function (Server) {
  const BLOCKS_PROCESSING_INTERVAL = 1000;
  Server.volumeInToken = 0; // Init the token volume

  let updatePixelsAmount = async function (accId, newAmount) {
    await Server.db.run(
      "REPLACE INTO accounts VALUES (?, (SELECT token_balance FROM accounts WHERE id = ?), ?, (SELECT gods FROM accounts WHERE id = ?))",
      [accId, accId, newAmount, accId]
    );
    Server.io.to(accId).emit("update_pixels_amount", {
      address: accId,
      amount: newAmount,
    });
    Server.infoLogging("Pixel amount updated", accId, newAmount);
  };

  let processEvent = async function (event, txId) {
    if (
      event.source != Server.kanvasContractAddress &&
      event.source != Server.kanvasGodsContractAddress
    )
      return;

    let contract =
      event.source == Server.kanvasContractAddress
        ? Server.kanvasContract
        : Server.kanvasGodsContract;
    const eventDecoded = await contract.decodeEvent(event);
    await Server.db.run("INSERT OR IGNORE INTO processed_events VALUES (?) ", [
      txId,
    ]);
    Server.infoLogging("New transaction to process", txId, eventDecoded.name);
    let eventArgs = eventDecoded.args;

    if (event.source == Server.kanvasGodsContractAddress) {
      if (eventDecoded.name == "collections.transfer_event") {
        let updateGodsList = async function (accId) {
          const newGodsList =
            await Server.kanvasGodsContract.functions.tokens_of({
              owner: accId,
            });
          const godsListString = newGodsList.result.token_id.join(",");
          await Server.db.run("UPDATE accounts SET gods = ? WHERE id = ?", [
            godsListString,
            accId,
          ]);
        };

        await updateGodsList(eventArgs.from);
        await updateGodsList(eventArgs.to);

        Server.infoLogging("God transferred", eventArgs.from, eventArgs.to);
      }
    } else if (event.source == Server.kanvasContractAddress) {
      // Token transfer case
      if (eventDecoded.name == "kanvascontract.transfer_event") {
        let updateTokenBalance = async function (accId, newBalance) {
          await Server.db.run(
            "REPLACE INTO accounts VALUES (?, ?, (SELECT pixels_balance FROM accounts WHERE id = ?), (SELECT gods FROM accounts WHERE id = ?))",
            [accId, newBalance, accId, accId]
          );
          Server.io.to(accId).emit("update_token_balance", {
            address: accId,
            balance: newBalance / 1e8,
          });
          Server.infoLogging("Balance updated", accId, newBalance);

          // If the user has more pixels than tokens, then his pixels are unvisible
          const res = await Server.db.get(
            "SELECT pixels_balance FROM accounts WHERE id = ?",
            [accId]
          );
          const pixelsUnvisibility =
            res.pixels_balance * 1e8 > newBalance ? 1 : 0;
          await Server.db.run(
            "UPDATE pixels SET unvisible = ? WHERE owner = ?",
            [pixelsUnvisibility, accId]
          );

          Server.infoLogging(
            "Pixels visibility updated",
            accId,
            pixelsUnvisibility
          );
        };

        // Update both balances
        await updateTokenBalance(
          eventArgs.from,
          Number(eventArgs.from_balance)
        );
        await updateTokenBalance(eventArgs.to, Number(eventArgs.to_balance));
      } else if (eventDecoded.name == "kanvascontract.pixel_placed_event") {
        // Pixel placed case
        await Server.db.run(
          "REPLACE INTO pixels VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            eventArgs.pixel_placed.posX,
            eventArgs.pixel_placed.posY,
            eventArgs.pixel_placed.owner,
            eventArgs.pixel_placed.red,
            eventArgs.pixel_placed.green,
            eventArgs.pixel_placed.blue,
            eventArgs.pixel_placed.alpha,
            eventArgs.pixel_placed.metadata,
            txId,
            0,
          ]
        );

        Server.infoLogging(
          "New pixel placed",
          eventArgs.pixel_placed.posX,
          eventArgs.pixel_placed.posY,
          eventArgs.pixel_placed.owner
        );

        // Update pixels amount in the server db (to avoid calling the blockchain each time a socket or the server needs it)
        await updatePixelsAmount(
          eventArgs.pixel_placed.owner,
          Number(eventArgs.owner_pixel_count)
        );
        eventArgs.previous_owner.length &&
          (await updatePixelsAmount(
            eventArgs.previous_owner,
            Number(eventArgs.previous_owner_pixel_count)
          ));

        // Emit it to all the sockets so that it is added to their client canvases
        Server.io.emit("pixel_placed", eventArgs.pixel_placed);
      } else if (eventDecoded.name == "kanvascontract.pixel_erased_event") {
        let sqlArgs = [eventArgs.posX, eventArgs.posY, eventArgs.from];
        await Server.db.run(
          "DELETE FROM pixels WHERE posX = ? AND posY = ? AND owner = ?",
          sqlArgs
        );
        Server.infoLogging("Pixel erased", ...sqlArgs);

        await updatePixelsAmount(
          eventArgs.from,
          Number(eventArgs.owner_new_pixel_count)
        );

        Server.io.emit("pixel_erased", {
          posX: eventArgs.posX,
          posY: eventArgs.posY,
        });
      }
    }
  };

  let processOperation = async function (operation) {
    if (operation?.call_contract?.contract_id != Server.koindxPeripheryAddress)
      return;

    let decodedOps = await Server.koindxPeripheryContract.decodeOperation(
      operation
    );

    const path = decodedOps?.args?.path;
    if (!path) return;

    const isTokenIn = path[0] == Server.kanvasContractAddress;
    const isTokenOut = path[path.length - 1] == Server.kanvasContractAddress;
    if (decodedOps.name == "swap_tokens_out") {
      if (isTokenIn)
        Server.volumeInToken += Number(decodedOps.args.amountInMax);
      else if (isTokenOut)
        Server.volumeInToken += Number(decodedOps.args.amountOut);
    } else if (decodedOps.name == "swap_tokens_in") {
      if (isTokenIn) Server.volumeInToken += Number(decodedOps.args.amountIn);
      else if (isTokenOut)
        Server.volumeInToken += Number(decodedOps.args.amountOutMin);
    }
  };

  Server.processBlocks = async function (blocksToProcess) {
    // Process the block in the right order
    for (let i = blocksToProcess.length - 1; i >= 0; i--) {
      let block = blocksToProcess[i];

      // Process the events
      let transactionReceipts = block.receipt.transaction_receipts;
      let receiptId = block.receipt.id;
      if (transactionReceipts) {
        for (let j = 0; j < transactionReceipts.length; j++) {
          let txReceipt = transactionReceipts[j];
          let events = txReceipt.events;
          if (events) {
            for (let k = 0; k < events.length; k++) {
              // Process each event
              let event = events[k];
              await processEvent(event, receiptId);
            }
          }
        }
      }

      // Process the transactions and operations
      let blockTransactions = block.block.transactions;
      if (blockTransactions) {
        for (let j = 0; j < blockTransactions.length; j++) {
          let transaction = blockTransactions[j];
          let txOperations = transaction.operations;
          for (let k = 0; k < txOperations.length; k++) {
            let txOperation = txOperations[k];
            await processOperation(txOperation);
          }
        }
      }

      Server.infoLogging("Processed block", block.block_height, block.block_id);
    }
  };

  // Check for events in the new blocks and process them
  let lastBlockHeight = Number(
    (await Server.client.blockStore.getHighestBlock()).topology.height
  );
  setInterval(async () => {
    if (Server.TEST_ENV) return true;
    try {
      let newBlock = (await Server.client.blockStore.getHighestBlock())
        .topology;
      let newBlockHeight = Number(newBlock.height);
      let blocksToProcess = [];

      // Construct all the missed blocks in this interval to process
      if (newBlockHeight >= lastBlockHeight) {
        let currentBlockHeight = newBlockHeight;
        let currentBlockId = newBlock.id;

        while (currentBlockHeight >= lastBlockHeight) {
          const { block_items } =
            await Server.client.blockStore.getBlocksByHeight(
              currentBlockId,
              currentBlockHeight,
              1
            );

          blocksToProcess.push(block_items[0]);
          currentBlockId = block_items[0].block.header.previous;
          currentBlockHeight--;
        }

        lastBlockHeight = newBlockHeight + 1;
      }

      // Process the blocks
      await Server.processBlocks(blocksToProcess);
    } catch (err) {
      Server.errorLogging("Error while retrieving last block", err);
    }
  }, BLOCKS_PROCESSING_INTERVAL);
};

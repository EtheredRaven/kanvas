module.exports = async function (Server) {
  const TOTAL_NUMBER_OF_EVENTS = 7200; // The events to take on the contract to init the db (passed events)
  const MAX_EVENTS_PER_CALL = 200;
  const CALL_NUMBER = Math.ceil(TOTAL_NUMBER_OF_EVENTS / MAX_EVENTS_PER_CALL);

  // Get the last transactions on the kanvas contract to init the pixels data in db if the server was closed
  let initPixelMap = async function () {
    for (let i = 0; i < CALL_NUMBER; i++) {
      let accountHistory = (
        await Server.client.accountHistory.getAccountHistory({
          address: Server.kanvasContractAddress,
          limit: MAX_EVENTS_PER_CALL,
          seq_num: 1 + i * MAX_EVENTS_PER_CALL,
          ascending: true,
        })
      ).values;

      Server.infoLogging(
        "Contract transactions history updated (" +
          (i + 1) +
          "/" +
          CALL_NUMBER +
          ")"
      );

      if (accountHistory) {
        for (let k = 0; k < accountHistory.length; k++) {
          let transaction = accountHistory[k];

          let txId = transaction.trx.transaction.id;

          let events = transaction.trx.receipt.events;
          if (events) {
            for (let i = 0; i < events.length; i++) {
              // Process each event
              let event = events[i];
              await processEvent(event, txId);
            }
          }
          Server.infoLogging(
            "Initializing pixel map : " +
              Math.floor(
                (Number(transaction.seq_num) / TOTAL_NUMBER_OF_EVENTS) *
                  100 *
                  100
              ) /
                100 +
              "%"
          );
        }
      }
    }
  };

  const BLOCKS_PROCESSING_INTERVAL = 1000;
  Server.volumeInToken = 0; // Init the token volume

  let processEvent = async function (event, txId) {
    if (event.source != Server.kanvasContractAddress) return;

    const eventDecoded = await Server.kanvasContract.decodeEvent(event);
    /*const res = await Server.db.get(
      "SELECT COUNT(id) AS n FROM processed_events WHERE id=(?)",
      [txId]
    );
    let txIsProcessed = res.n;*/

    //if (!txIsProcessed) {
    // Register transaction as processed
    await Server.db.run("INSERT OR IGNORE INTO processed_events VALUES (?) ", [
      txId,
    ]);
    Server.infoLogging("New transaction to process", txId, eventDecoded.name);

    // Process transaction
    let eventArgs = eventDecoded.args;

    // Token transfer case
    if (eventDecoded.name == "kanvascontract.transfer_event") {
      let updateTokenBalance = async function (accId, newBalance) {
        await Server.db.run(
          "REPLACE INTO accounts VALUES (?, ?, (SELECT pixels_balance FROM accounts WHERE id = ?)) ",
          [accId, newBalance, accId]
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
        await Server.db.run("UPDATE pixels SET unvisible = ? WHERE owner = ?", [
          pixelsUnvisibility,
          accId,
        ]); // TODO : To upgrade to take into account the real difference

        Server.infoLogging(
          "Pixels visibility updated",
          accId,
          pixelsUnvisibility
        );
      };

      // Update both balances
      await updateTokenBalance(eventArgs.from, Number(eventArgs.from_balance));
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
      let updatePixelsAmount = async function (accId, newAmount) {
        await Server.db.run(
          "REPLACE INTO accounts VALUES (?, (SELECT token_balance FROM accounts WHERE id = ?), ?)",
          [accId, accId, newAmount]
        );
        Server.io.to(accId).emit("update_pixels_amount", {
          address: accId,
          amount: newAmount,
        });
        Server.infoLogging("Pixel amount updated", accId, newAmount);
      };
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
    }
    //}
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

  // Check for events in the new blocks and process them
  let lastBlockHeight = Number(
    (await Server.client.blockStore.getHighestBlock()).topology.height
  );
  setInterval(async () => {
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

        Server.infoLogging(
          "Processed block",
          block.block_height,
          block.block_id
        );
      }
    } catch (err) {
      Server.errorLogging("Error while retrieving last block", err);
    }
  }, BLOCKS_PROCESSING_INTERVAL);

  // Uncomment to init from blockchain state, don't forget to modify the TOTAL_NUMBER_OF_EVENTS
  //await initPixelMap();

  // Old processing function
  /*void (async () => {
    for await (const block of Server.client.blockStore.getBlocks()) {
      let transactionReceipts = block.receipt.transaction_receipts;
      let receiptId = block.receipt.id;
      if (transactionReceipts) {
        for (let j = 0; j < transactionReceipts.length; j++) {
          let txReceipt = transactionReceipts[j];
          let events = txReceipt.events;
          if (events) {
            for (let i = 0; i < events.length; i++) {
              // Process each event
              let event = events[i];
              await processEvent(event, receiptId);
            }
          }
        }
      }
      Server.infoLogging("Processed block", block.block_height, block.block_id);
    }
  })();*/

  /*let block = await Server.client.blockStore.getBlocksByHeight(
    "0x12208bc173edc126acee50f34f3a962a5dc46f6d18842b2629604e4f33b0a9afde8d",
    8186122,
    1
  );
*/

  /*let block = await Server.client.blockStore.getBlocksById([
    "0x12201a4b7c004ce7c9fe4836951599dc290cd430efe68f134f36df2c5318d8adf5e7",
  ]);
  block = block.block_items[0];*/

  /*let transactionReceipts = block.receipt.transaction_receipts;
  let receiptId = block.receipt.id;
  if (transactionReceipts) {
    for (let j = 0; j < transactionReceipts.length; j++) {
      let txReceipt = transactionReceipts[j];
      let events = txReceipt.events;
      if (events) {
        for (let i = 0; i < events.length; i++) {
          // Process each event
          let event = events[i];
          await processEvent(event, receiptId);
        }
      }
    }
  }*/
};

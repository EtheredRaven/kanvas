module.exports = async function (Server) {
  const INIT_EVENTS = 10; // The events to take on the contract to init the db (passed events)

  // Get the last transactions on the kanvas contract to init the pixels data in db
  let initPixelMap = async function () {
    let accountHistory = (
      await Server.client.accountHistory.getAccountHistory({
        address: Server.kanvasContractAddress,
        limit: INIT_EVENTS,
      })
    ).values;

    //Server.infoLogging("Contract transactions history updated");

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
      }
    }
  };

  let processEvent = async function (event, txId) {
    if (event.source != Server.kanvasContractAddress) return;

    const eventDecoded = await Server.kanvasContract.decodeEvent(event);
    const res = await Server.db.get(
      "SELECT COUNT(id) AS n FROM processed_events WHERE id=(?)",
      [txId]
    );
    let txIsProcessed = res.n;

    // If tx is not already processed in server db
    if (!txIsProcessed) {
      // Register transaction as processed
      await Server.db.run("INSERT INTO processed_events VALUES (?) ", [txId]);
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
          await Server.db.run(
            "UPDATE pixels SET unvisible = ? WHERE owner = ?",
            [pixelsUnvisibility, accId]
          ); // TODO : To upgrade to take into account the real difference

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
    }
  };

  await initPixelMap();

  // Check for events in the new blocks

  void (async () => {
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
  })();

  /*const block = await Server.client.blockStore.getBlocksById([
    "0x122089b7c74d89f66ef84516052edf016bacaeef0798544ebd4f2ebc10b3bc177a70",
  ]);
  console.log(block.block_items[0].block.transactions[0].operations);
  console.log(block.block_items[0].receipt.transaction_receipts[0].events);*/
};

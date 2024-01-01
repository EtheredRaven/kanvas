module.exports = function (Server) {
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

  // Init the gods
  let initGodsInDb = async function () {
    const MAX_GOD_ID = 15; // Starts with 1
    const godsListIntegers = [-1];
    for (let i = 1; i <= MAX_GOD_ID; i++) {
      godsListIntegers.push(i);
    }

    // Convert into the char representation of the integer.
    const godsListHex = [-1];
    for (let i = 1; i <= MAX_GOD_ID; i++) {
      const number = godsListIntegers[i];
      const numberString = number.toString();
      godsListHex.push(
        "0x" +
          Array.from(numberString)
            .map((char) => {
              return char.charCodeAt(0).toString(16);
            })
            .join("")
      );
    }

    for (let i = 1; i < godsListIntegers.length; i++) {
      let godIdInt = godsListIntegers[i];
      if (godIdInt == -1) continue;

      const godIdHex = godsListHex[godIdInt];
      let res = await Server.kanvasGodsContract.functions.owner_of({
        token_id: godIdHex,
      });

      let godOwnerAddress = res.result.value;
      // If there are already gods for this address, append the new god
      let gods = await Server.db.get(
        "SELECT gods FROM accounts WHERE id = ?",
        godOwnerAddress
      );
      if (gods && gods.gods && gods.gods != "") {
        gods = gods.gods;
        if (gods.includes(godIdInt)) continue;
        gods = gods + "," + godIdInt;
      } else {
        gods = godIdInt;
      }

      await Server.db.run("UPDATE accounts SET gods = ? WHERE id = ?", [
        gods,
        godOwnerAddress,
      ]);
    }
  };

  //initGodsInDb();

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

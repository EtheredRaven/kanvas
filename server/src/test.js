module.exports = function (Server) {
  let testing = async function () {
    Server.TEST_ENV = true;
    let blocksToProcess = (
      await Server.client.blockStore.getBlocksById([
        "0x12201a4b7c004ce7c9fe4836951599dc290cd430efe68f134f36df2c5318d8adf5e7",
        "0x1220ca087def362c170e4a3b67b5c9df84559c8ccacef133d67789fc1f071c153ad0",
      ])
    ).block_items;

    Server.processBlocks(blocksToProcess);
  };
  //testing();
};

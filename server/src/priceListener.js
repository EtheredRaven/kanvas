const axios = require("axios");

module.exports = async function (Server) {
  const PRICE_LISTENER_INTERVAL_IN_MS = 5 * 60000;
  const KOIN_PRICE_URL =
    "https://api.coingecko.com/api/v3/simple/price?ids=koinos&vs_currencies=usd";

  Server.priceHistory = await Server.db.all(
    "SELECT timestamp, kan_price_in_koin, koin_price_in_dollars FROM price_history"
  );

  setInterval(async () => {
    // Get KOIN price in USD
    let koinPriceInUSD;
    try {
      let resKoinPrice = await axios({
        url: KOIN_PRICE_URL,
        method: "get",
      });

      koinPriceInUSD = resKoinPrice?.data?.koinos?.usd;
      if (!koinPriceInUSD) {
        Server.errorLogging("KOIN price is not available");
        return;
      }
    } catch (err) {
      Server.errorLogging("Retrieving KOIN price", err);
    }

    // Get KAN price in KOIN
    let KANPriceInKoin;
    try {
      const kanKoinReserves = (
        await Server.koindxPeripheryContract.functions.get_reserves({})
      ).result;
      KANPriceInKoin =
        Number(kanKoinReserves.reserveB) / Number(kanKoinReserves.reserveA);
    } catch (err) {
      Server.errorLogging("Retrieving KAN price", err);
    }

    // Insert row in db
    let currentTimestamp =
      (Math.floor(Date.now() / PRICE_LISTENER_INTERVAL_IN_MS) *
        PRICE_LISTENER_INTERVAL_IN_MS) /
      1000;
    try {
      let newPrice = {
        timestamp: currentTimestamp,
        kan_price_in_koin: KANPriceInKoin,
        koin_price_in_dollars: koinPriceInUSD,
      };
      await Server.db.run(
        "INSERT OR IGNORE INTO price_history (timestamp, kan_price_in_koin, koin_price_in_dollars) VALUES (?, ?, ?) ",
        [
          newPrice.timestamp,
          newPrice.kan_price_in_koin,
          newPrice.koin_price_in_dollars,
        ]
      );
      Server.priceHistory.push(newPrice);
      Server.io.sockets.emit("new_price", newPrice);
      Server.infoLogging(
        "New price inserted",
        currentTimestamp,
        KANPriceInKoin,
        koinPriceInUSD
      );
    } catch (err) {
      Server.errorLogging("Inserting new price", err);
    }
  }, PRICE_LISTENER_INTERVAL_IN_MS);
};

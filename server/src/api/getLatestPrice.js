module.exports = function (Server) {
  return async () => {
    try {
      const lastestPrice = await Server.db.all(
        "SELECT * FROM price_history ORDER BY timestamp DESC LIMIT 1"
      );
      Server.infoLogging("Latest price sent");
      return lastestPrice[0];
    } catch (err) {
      Server.errorLogging("Error while fetching latest price", err);
      return { error: err };
    }
  };
};

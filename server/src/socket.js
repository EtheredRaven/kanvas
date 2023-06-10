module.exports = function (Server) {
  Server.io.engine.on("connection_error", (err) => {
    Server.errorLogging(err);
  });

  Server.io.on("connection", async function (socket) {
    Server.initSocketLogging(socket);
    Server.infoLogging(socket, "New connection to Websocket");

    socket.emit("pixel_map_data", {
      pixels: Server.pixels,
      canvas_dimensions: Server.canvasDimensions,
    });

    socket.on("disconnect", function (reason) {
      Server.disconnect(socket, reason);
    });

    socket.on("subscribe_wallet_update", async (accounts) => {
      socket.accounts = accounts;
      socket.join(accounts.map((account) => account.address));
      Server.infoLogging(socket, "New wallets connected", accounts);
    });

    Server.disconnect = function (socket, reason) {
      Server.infoLogging(socket, "Disconnected from Websocket", reason);
      socket.leave(socket.accounts);
    };
  });
};

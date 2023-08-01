module.exports = function (Server) {
  Server.io.engine.on("connection_error", (err) => {
    Server.errorLogging(err);
  });

  Server.io.on("connection", async function (socket) {
    Server.initSocketLogging(socket);
    Server.infoLogging(socket, "New connection to Websocket");
    socket.accounts = [];

    socket.emit("pixel_map_data", {
      pixels: Server.pixels,
      canvas_dimensions: Server.canvasDimensions,
    });

    socket.on("disconnect", function (reason) {
      Server.disconnect(socket, reason);
    });

    socket.on("subscribe_wallet_update", async (accountAddress) => {
      const MAX_ACCOUNTS_PER_SOCKET = 50;
      if (
        socket.accounts.indexOf(accountAddress) < 0 &&
        socket.accounts.length < MAX_ACCOUNTS_PER_SOCKET
      ) {
        socket.accounts.push(accountAddress);
        socket.join(accountAddress);
        Server.infoLogging(socket, "New wallet connected", accountAddress);
      }
    });

    Server.disconnect = function (socket, reason) {
      Server.infoLogging(socket, "Disconnected from Websocket", reason);
      socket.leave(socket.accounts);
    };
  });
};

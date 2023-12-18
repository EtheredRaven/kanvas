module.exports = function (Server) {
  Server.io.engine.on("connection_error", (err) => {
    Server.errorLogging(err);
  });

  Server.io.on("connection", async function (socket) {
    Server.initSocketLogging(socket);
    Server.infoLogging(socket, "New connection to Websocket");
    socket.accounts = [];

    socket.on("get_pixel_map_data", () => {
      // Send the data in chunks one by one
      for (let i = 0; i < Server.pixels.length; i++) {
        // Make the loop non-blocking
        setTimeout(() => {
          socket.emit("got_pixel_map_data", {
            chunkIndex: i,
            maxChunkIndex: Server.pixels.length - 1,
            pixels: Server.pixels[i],
            canvas_dimensions: Server.canvasDimensions,
          });
        }, 0);
      }
    });

    socket.on("get_price_history", () => {
      socket.emit("got_price_history", Server.priceHistory);
    });

    socket.on("get_leaderboard_data", () => {
      socket.emit("got_leaderboard_data", Server.leaderboardData);
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

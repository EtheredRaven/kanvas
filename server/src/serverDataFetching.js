module.exports = async function (Server) {
  const dimensionsResult =
    await Server.kanvasContract.functions.canvas_dimensions({});
  Server.canvasDimensions = dimensionsResult.result;

  // Update the pixels map in memory to give it to new sockets connecting (to reduce db calls if a lot of new sockets connecting)
  const PIXELS_MAP_UPDATE_FREQUENCY_IN_SECONDS = 10;
  let updatePixelsMapFunction = async () => {
    Server.pixels = await Server.db.all(
      "SELECT * FROM pixels WHERE unvisible != 1"
    );
    Server.infoLogging("Updated pixels map");
  };
  updatePixelsMapFunction();
  Server.updatePixelsMapInterval = setInterval(
    updatePixelsMapFunction,
    PIXELS_MAP_UPDATE_FREQUENCY_IN_SECONDS * 1000
  );

  // Update the leaderboard data in memory
  const LEADERBOARD_UPDATE_FREQUENCY_IN_SECONDS = 60;
  let updateLeaderboardFunction = async () => {
    Server.leaderboardData = await Server.db.all(
      "SELECT * FROM accounts ORDER BY pixels_balance DESC"
    );
    Server.infoLogging("Updated leaderboard data");
  };
  updateLeaderboardFunction();
  Server.updateLeaderboardInterval = setInterval(
    updateLeaderboardFunction,
    LEADERBOARD_UPDATE_FREQUENCY_IN_SECONDS * 1000
  );
};

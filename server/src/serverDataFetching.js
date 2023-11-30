module.exports = async function (Server) {
  const dimensionsResult =
    await Server.kanvasContract.functions.canvas_dimensions({});
  Server.canvasDimensions = dimensionsResult.result;

  // Update the pixels map in memory to give it to new sockets connecting (to reduce db calls if a lot of new sockets connecting)
  const PIXELS_MAP_UPDATE_FREQUENCY_IN_SECONDS = 30;
  let updatePixelsMapFunction = async () => {
    Server.pixels = await Server.db.all(
      "SELECT * FROM pixels WHERE unvisible != 1 ORDER BY posX ASC, posY ASC"
    );
    /*let pixelsData = [];
    for (let i = 0; i < 1000; i++) {
      for (let j = 0; j < 1000; j++) {
        pixelsData.push({
          posX: i,
          posY: j,
          red: Math.round(Math.random() * 255),
          green: Math.round(Math.random() * 255),
          blue: Math.round(Math.random() * 255),
          owner: "1Q9H3Rjz5RPPuonX1CQoQ62rQAepJ287of",
        });
      }
    }
    Server.pixels = pixelsData;*/
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

const { Signer } = require("koilib");
const spaceStrikerSecret = require("./spaceStrikerSecret");

module.exports = function (Server) {
  // Init checking function for winner
  Server.currentBestHighscore = null;
  const timeWithoutHighscoreBeatenToReset = 24 * 60 * 60 * 1000;

  Server.spaceStrikerSigner = Signer.fromWif(
    process.env.SPACE_STRIKER_PRIV_KEY
  );
  Server.infoLogging(
    "Space Striker",
    "Init Space Striker wallet and signer",
    Server.spaceStrikerSigner.getAddress()
  );
  Server.spaceStrikerKoinContract = Server.initKoinContractWithSigner(
    Server.spaceStrikerSigner
  );
  Server.spaceStrikerKanvasContract = Server.initKanvasContractWithSigner(
    Server.spaceStrikerSigner
  ).functions;
  Server.kctContract = Server.initKanvasContractWithSigner(
    Server.spaceStrikerSigner,
    Server.koincrewtokenContractAddress
  ).functions;

  let resetSpaceStriker = async () => {
    Server.currentBestHighscore = null;
    let leaderboard = await ret.getLeaderboard();
    Server.infoLogging("Space Striker", "Tries to reset the game");
    if (!leaderboard.length) return;

    let winner = leaderboard[0];
    let reqParams = [Date.now(), winner.Address, winner.Highscore || 0];
    await Server.db.run(
      "INSERT INTO space_striker_winners (timestamp, address, highscore) VALUES(?, ?, ?)",
      reqParams
    );
    await Server.db.run("DELETE FROM space_striker");
    Server.infoLogging(
      "Space Striker",
      "24 hours without new winner, reset highscore",
      ...reqParams
    );

    let addressToSendKoinTo = winner.Address;

    try {
      if (addressToSendKoinTo.match(/^([a-zA-Z0-9]+)\.koin$/)) {
        addressToSendKoinTo = (
          await Server.kapNameServiceContract.get_name({
            name: addressToSendKoinTo,
          })
        )?.result?.owner;
      }

      // Send KOIN
      let koinTx = await Server.spaceStrikerKoinContract.transfer(
        {
          from: Server.spaceStrikerSigner.getAddress(),
          to: addressToSendKoinTo,
          value: 100000000,
        },
        {
          rcLimit: "100000000",
        }
      );
      await koinTx.transaction.wait();
      Server.infoLogging(
        "Space Striker",
        "Sent 1 KOIN to " + addressToSendKoinTo
      );
    } catch (err) {
      Server.errorLogging("Space Striker", "Error while sending the KOIN", err);
    }

    try {
      // Send KAN
      let kanTx = await Server.spaceStrikerKanvasContract.transfer(
        {
          from: Server.spaceStrikerSigner.getAddress(),
          to: addressToSendKoinTo,
          value: 1000000000,
        },
        {
          rcLimit: "100000000",
        }
      );
      await kanTx.transaction.wait();
      Server.infoLogging(
        "Space Striker",
        "Sent 10 KAN to " + addressToSendKoinTo
      );
    } catch (err) {
      Server.errorLogging("Space Striker", "Error while sending the KAN", err);
    }

    try {
      // Send KCT
      let kctTx = await Server.kctContract.transfer(
        {
          from: Server.spaceStrikerSigner.getAddress(),
          to: addressToSendKoinTo,
          value: 5000000000,
        },
        {
          rcLimit: "100000000",
        }
      );
      await kctTx.transaction.wait();
      Server.infoLogging(
        "Space Striker",
        "Sent 50 KCT to " + addressToSendKoinTo
      );
    } catch (err) {
      Server.errorLogging("Space Striker", "Error while sending the KCT", err);
    }
  };

  let initLeaderboard = async function () {
    // Init the leaderboard reset
    let leaderboard = await ret.getLeaderboard();
    if (leaderboard.length) {
      let leaderTimestamp = leaderboard[0].Date;
      let timeDiff = Math.max(
        0,
        timeWithoutHighscoreBeatenToReset -
          (Date.now() - Number(leaderTimestamp))
      );

      Server.infoLogging(
        "Space Striker",
        "Reset timer started with ",
        new Date(timeDiff).toUTCString()
      );
      Server.resetSpaceStrikerTimeout = setTimeout(resetSpaceStriker, timeDiff);

      let bestHighscoreRow = await ret.getBestHighscore();
      if (bestHighscoreRow) {
        Server.currentBestHighscore = bestHighscoreRow;
        Server.infoLogging(
          "Space Striker",
          "Best highscore init at ",
          ...Object.values(Server.currentBestHighscore)
        );
      }
    }
  };

  // Other way to work : one winner each week
  /*let getWeekNumberSinceUNIX = function (timestamp) {
    return Math.floor(
      (timestamp + 1000 * 3600 * 24 * 3) / (1000 * 3600 * 24 * 7)
    );
  };
  let currentWeek = getWeekNumberSinceUNIX(Date.now());
  setInterval(async () => {
    Server.infoLogging("Space Striker", "Tries if it is a new week");
    let newCurrentWeek = getWeekNumberSinceUNIX(Date.now());
    if (currentWeek != newCurrentWeek) {
      currentWeek = newCurrentWeek;
      
    }
  }, 1000 * 600);*/

  let ret = {};

  ret.associateLogin = async (req) => {
    if (!req.query.address) return;
    try {
      let reqParams = [req.query.address, req.ip, 0, 0, Date.now(), Date.now()];
      await Server.db.run(
        "INSERT OR IGNORE INTO space_striker (address, ip, highscore, highscore_tries, last_connexion_timestamp, highscore_timestamp) VALUES(?, ?, ?, ?, ?, ?)",
        reqParams
      );
      await Server.db.run(
        "UPDATE OR IGNORE space_striker SET last_connexion_timestamp=? WHERE address=? AND ip=?",
        [Date.now(), req.query.address, req.ip]
      );
      Server.infoLogging("Space Striker", "New login associated", ...reqParams);
      return { status: 200 };
    } catch (err) {
      Server.errorLogging(
        "Space Striker",
        "Error while associating new login",
        err
      );
      return { error: err };
    }
  };

  // DEPRECATED
  ret.getLogin = async (req) => {
    /*try {
      let reqParams = [req.ip];
      let reqRes = await Server.db.all(
        "SELECT * FROM space_striker WHERE ip=?",
        reqParams
      );
      Server.infoLogging("Space Striker", "Get login", ...reqParams);

      if (!reqRes.length) return { error: "No login for this ip" };
      let latestLogin = reqRes[0];
      for (let i = 0; i < reqRes.length; i++) {
        if (
          reqRes[i].last_connexion_timestamp >=
          latestLogin.last_connexion_timestamp
        )
          latestLogin = reqRes[i];
      }
      return latestLogin;
    } catch (err) {
      Server.errorLogging("Space Striker", "Error while getting login", err);
      return { error: err };
    }*/
    return { address: 0 };
  };

  ret.getHighscore = async (req) => {
    if (!req.query.address) return;
    try {
      let reqRes;
      let sendReq = async () => {
        let reqParams = [req.query.address];
        reqRes = await Server.db.all(
          "SELECT address, MAX(highscore) AS highscore, highscore_tries, highscore_timestamp FROM space_striker WHERE address=? GROUP BY address",
          reqParams
        );
        Server.infoLogging("Space Striker", "Get highscore", ...reqParams);
      };
      await sendReq();

      if (!reqRes.length) {
        await ret.associateLogin(req);
        await sendReq();
      }
      return { highscore: reqRes[0].highscore };
    } catch (err) {
      Server.errorLogging(
        "Space Striker",
        "Error while retrieving highscore",
        err
      );
      return { error: err };
    }
  };

  ret.saveHighscore = async (req) => {
    if (!req.query.highscore) return { error: "No highscore provided" };
    try {
      let serverHash = spaceStrikerSecret(req);
      if (serverHash != req.query.hash) {
        throw "Hash is wrong";
      }
      let reqParams = [
        req.query.highscore,
        Date.now(),
        req.query.address,
        req.ip,
      ];

      let currentHighscore = await ret.getHighscore(req);
      if (currentHighscore.highscore == undefined) {
        await ret.associateLogin(req);
        currentHighscore = await ret.getHighscore(req);
      }

      if (currentHighscore.highscore >= req.query.highscore)
        return {
          error:
            "This highscore is not higher than the current highscore or you dit not register",
        };

      await Server.db.run(
        "UPDATE space_striker SET highscore=?, highscore_timestamp=? WHERE address=? AND ip=?",
        reqParams
      );

      if (
        !Server.currentBestHighscore ||
        Server.currentBestHighscore.highscore <= req.query.highscore
      ) {
        Server.currentBestHighscore = await ret.getBestHighscore();
        Server.resetSpaceStrikerTimeout &&
          clearTimeout(Server.resetSpaceStrikerTimeout);
        Server.resetSpaceStrikerTimeout = setTimeout(
          resetSpaceStriker,
          timeWithoutHighscoreBeatenToReset
        );

        Server.infoLogging(
          "Space Striker",
          "Old record beaten",
          Server.currentBestHighscore?.highscore,
          ...Object.values(Server.currentBestHighscore)
        );
      }

      Server.infoLogging("Space Striker", "Save highscore", ...reqParams);
      return { status: 200 };
    } catch (err) {
      Server.errorLogging("Space Striker", "Error while saving highscore", err);
      return { error: err };
    }
  };

  ret.getLeaderboard = async (req) => {
    try {
      let reqRes = await Server.db.all(
        "SELECT address, MAX(highscore) AS highscore, highscore_tries, highscore_timestamp FROM space_striker GROUP BY address ORDER BY highscore DESC, highscore_timestamp DESC"
      );
      Server.infoLogging("Space Striker", "Get leaderboard");
      return reqRes
        .filter((el) => el.highscore)
        .map((el, index) => {
          return {
            "#": index + 1,
            Address: el.address,
            Highscore: el.highscore,
            Date: el.highscore_timestamp,
          };
        });
    } catch (err) {
      Server.errorLogging(
        "Space Striker",
        "Error while retrieving leaderboard",
        err
      );
      return { error: err };
    }
  };

  ret.getLastWeekWinner = async (req) => {
    try {
      let reqRes = await Server.db.all(
        "SELECT * FROM space_striker_winners ORDER BY timestamp DESC LIMIT 1"
      );
      Server.infoLogging("Space Striker", "Get last week winner");
      if (!reqRes.length) return { error: "No last week winner" };
      return reqRes[0];
    } catch (err) {
      Server.errorLogging(
        "Space Striker",
        "Error while getting last week winner",
        err
      );
      return { error: err };
    }
  };

  ret.getBestHighscore = async () => {
    let bestHighscoreRow = await Server.db.all(
      "SELECT address, MAX(highscore) AS highscore, highscore_tries FROM space_striker GROUP BY address ORDER BY highscore DESC, highscore_timestamp DESC LIMIT 1"
    );
    if (!bestHighscoreRow.length) return;
    return bestHighscoreRow[0];
  };

  initLeaderboard();

  return ret;
};

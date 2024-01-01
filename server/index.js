(async () => {
  const fs = require("fs");
  const path = require("path");

  // SERVER
  Server = {};

  var express = require("express");
  Server.app = express();

  // HTTP
  var httpServer = require("http").Server(Server.app);

  Server.io = require("socket.io")(httpServer, {
    pingTimeout: 30000,
    pingInterval: 30000,
  });
  Server.httpListeningPort = process.env.HTTP_PORT || 80;
  httpServer.listen(Server.httpListeningPort);
  console.log("Http server runnning on port " + Server.httpListeningPort);

  // HTTPS
  try {
    var httpsServer = require("https").Server(
      {
        key: fs.readFileSync("cert/privkey.pem"),
        cert: fs.readFileSync("cert/fullchain.pem"),
      },
      Server.app
    );

    Server.httpsListeningPort = process.env.HTTPS_PORT || 443;
    httpsServer.listen(Server.httpsListeningPort);
    console.log("Https server runnning on port " + Server.httpsListeningPort);
    Server.io.attach(httpsServer);

    // HTTP TO HTTPS REDIRECTION
    Server.app.all("*", (req, res, next) => {
      if (req.secure) return next();
      res.redirect("https://" + req.hostname + req.url);
    });
  } catch (e) {
    e;
  }

  // LOGGING
  require("./src/logging")(Server);

  // DATABASE
  const DbWrapper = require("./db/db_wrapper");
  const DbModel = require("./db/db_model");
  Server.db = new DbWrapper("db/data.db", Server);
  await new DbModel(Server.db).loadModels();

  // Requirements
  require("./src/contracts")(Server);

  // PATHS DEFINITIONS
  Server.app.use("/", express.static(__dirname + "/../client/public/homepage"));
  Server.app.get("/", function (req, res) {
    res.sendFile(__dirname + "/../client/public/homepage/index.html");
  });

  Server.app.use("/app/", express.static(__dirname + "/../client/dist"));
  Server.app.get("/app/*", function (req, res) {
    res.sendFile(path.resolve(__dirname + "/../client/dist/index.html"));
  });

  Server.app.use(
    "/docs/",
    express.static(__dirname + "/../client/docs/.vitepress/dist")
  );
  Server.app.get("/docs/", function (req, res) {
    res.sendFile(__dirname + "/../client/docs/.vitepress/dist/index.html");
  });

  Server.app.use(
    "/paper_wallet/",
    express.static(__dirname + "/../client/public/paper_wallet")
  );
  Server.app.get("/paper_wallet/*", function (req, res) {
    res.sendFile(
      path.resolve(__dirname + "/../client/public/paper_wallet/index.html")
    );
  });

  // SPACE STRIKER GAME
  Server.app.use(
    "/space_striker/",
    express.static(__dirname + "/../client/public/space_striker")
  );
  Server.app.get("/", function (req, res) {
    res.sendFile(__dirname + "/../client/public/space_striker/index.html");
  });
  const spaceStrikerApi = require("./src/api/spaceStriker")(Server);
  Server.app.get("/api/associate_login/", async function (req, res) {
    return res.send(await spaceStrikerApi.associateLogin(req));
  });
  Server.app.get("/api/get_login/", async function (req, res) {
    return res.send(await spaceStrikerApi.getLogin(req));
  });
  Server.app.get("/api/get_highscore/", async function (req, res) {
    return res.send(await spaceStrikerApi.getHighscore(req));
  });
  Server.app.get("/api/save_highscore/", async function (req, res) {
    return res.send(await spaceStrikerApi.saveHighscore(req));
  });
  Server.app.get("/api/get_leaderboard/", async function (req, res) {
    return res.send(await spaceStrikerApi.getLeaderboard(req));
  });
  Server.app.get("/api/get_last_week_winner/", async function (req, res) {
    return res.send(await spaceStrikerApi.getLastWeekWinner(req));
  });
  require("./src/api/supply.js")(Server);

  // Price API
  const getLatestPrice = require("./src/api/getLatestPrice")(Server);
  Server.app.get("/api/get_latest_price/", async function (req, res) {
    return res.send(await getLatestPrice());
  });

  // Kanvas Gods metadata NFT API
  require("./src/api/kanvasGodsMetadata.js")(Server);

  // Pixel map image API
  require("./src/api/createPixelMapImage")(Server);

  require("./src/serverDataFetching")(Server);
  require("./src/socket")(Server);
  require("./src/blockchainEventsListener")(Server);
  require("./src/priceListener")(Server);
  require("./src/init")(Server); // Only use to reset the db state from the blockchain
  require("./src/test")(Server); // Only use to test some stuff
})();

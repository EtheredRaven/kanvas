(async () => {
  const fs = require("fs");
  const path = require("path");

  // SERVER
  Server = {};

  var express = require("express");
  Server.app = express();

  // HTTP
  var httpServer = require("http").Server(Server.app);
  Server.io = require("socket.io")(httpServer);
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

  require("./src/contracts")(Server);
  require("./src/pixelMapUpdating")(Server);
  require("./src/socket")(Server);
  require("./src/blockchainEventsListener")(Server);
  require("./src/priceListener")(Server);
})();

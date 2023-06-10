// HTTP SERVER
Server = {};
var express = require("express");
Server.app = express();
var httpServer = require("http").Server(Server.app);
Server.io = require("socket.io")(httpServer);
Server.listeningPort = 8081;
httpServer.listen(process.env.PORT || Server.listeningPort, () => {});

require("./src/logging")(Server);

// DATABASE
const DbWrapper = require("./db/db_wrapper");
const DbModel = require("./db/db_model");
Server.db = new DbWrapper("db/data.db", Server);
new DbModel(Server.db).loadModels();

// PATHS DEFINITIONS
Server.app.use("/", express.static(__dirname + "/../client/dist"));
Server.app.get("/", function (req, res) {
  res.sendFile(__dirname + "/../client/dist/index.html");
});

require("./src/loadData")(Server);
require("./src/socket")(Server);
require("./src/blockchainEventsListener")(Server);

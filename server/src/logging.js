const fs = require("fs");
const util = require("util");
module.exports = function (Server) {
  Server.PATH_TO_LOGS = __dirname + "/../logs/";
  let updateLogsFileStream = function () {
    let currentDate = new Date();
    currentDate =
      currentDate.getUTCFullYear() +
      "_" +
      (currentDate.getUTCMonth() + 1) +
      "_" +
      currentDate.getUTCDate();

    if (currentDate != Server.LOGS_FILE_NAME) {
      Server.logStream?.close();
      Server.LOGS_FILE_NAME = currentDate;
      Server.logStream = fs.createWriteStream(
        Server.PATH_TO_LOGS + Server.LOGS_FILE_NAME + ".log",
        {
          flags: "w",
        }
      );
    }
  };

  console.log = function (s) {
    updateLogsFileStream();
    Server.logStream.write(util.format(s) + "\n");
    process.stdout.write(util.format(s) + "\n");
  };

  Server.logging = function (...args) {
    if (!args.length) return;
    let separator = " - ";
    let log = new Date().toUTCString() + separator;
    args.forEach((arg) => {
      log += arg.toString() + separator;
    });
    console.log(log);
  };

  Server.errorLogging = function () {
    Server.logging("ERROR", ...arguments);
  };

  Server.infoLogging = function () {
    Server.logging("INFO", ...arguments);
  };

  Server.initSocketLogging = function (socket) {
    socket.toString = function () {
      return (
        (socket.userModel ? socket.userModel.username : "_") +
        "@" +
        socket.handshake.address
      );
    };
  };
};

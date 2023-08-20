const sqlite3 = require("sqlite3");

class DbWrapper {
  constructor(dbFilePath, Server) {
    this.server = Server;
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) {
        this.server.errorLogging("Could not connect to database", err);
      } else {
        this.server.infoLogging("Connected to database");
      }
    });
  }

  run(sql, params = []) {
    let Server = this.server;
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          Server.errorLogging("Error running sql " + sql);
          Server.errorLogging(err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  get(sql, params = []) {
    let Server = this.server;
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          Server.errorLogging("Error running sql: " + sql);
          Server.errorLogging(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    let Server = this.server;
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          Server.errorLogging("Error running sql: " + sql);
          Server.errorLogging(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = DbWrapper;

class DbModel {
  constructor(dbWrapper) {
    this.db = dbWrapper;
  }

  async loadModels() {
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS processed_events (id TEXT PRIMARY KEY);`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, token_balance INTEGER DEFAULT 0, pixels_balance INTEGER DEFAULT 0);`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS pixels (posX INTEGER, posY INTEGER, owner TEXT, red INTEGER, green INTEGER, blue INTEGER, alpha INTEGER, metadata TEXT, event_id TEXT, unvisible INTEGER, CONSTRAINT positionPK PRIMARY KEY (posX,posY), CONSTRAINT ownerFK FOREIGN KEY (owner) REFERENCES accounts(id), CONSTRAINT eventIdFK FOREIGN KEY (event_id) REFERENCES processed_events(id));`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS price_history (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER, kan_price_in_koin REAL, koin_price_in_dollars REAL);`
    );
    await this.db.run(
      `CREATE INDEX IF NOT EXISTS price_history_timestamp_index ON price_history(timestamp);`
    );
    /*await this.db.run(
      `CREATE TABLE IF NOT EXISTS constants (canvas_width INTEGER, canvas_height INTEGER);`
    );*/
  }
}

module.exports = DbModel;

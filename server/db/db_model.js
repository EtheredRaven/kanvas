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
      `CREATE INDEX IF NOT EXISTS accounts_pixels_balance_index ON accounts(pixels_balance);`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS pixels (posX INTEGER, posY INTEGER, owner TEXT, red INTEGER, green INTEGER, blue INTEGER, alpha INTEGER, metadata TEXT, event_id TEXT, unvisible INTEGER, CONSTRAINT positionPK PRIMARY KEY (posX,posY), CONSTRAINT ownerFK FOREIGN KEY (owner) REFERENCES accounts(id), CONSTRAINT eventIdFK FOREIGN KEY (event_id) REFERENCES processed_events(id));`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS price_history (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER, kan_price_in_koin REAL, koin_price_in_dollars REAL, volume_in_kan INTEGER DEFAULT 0);`
    );
    await this.db.run(
      `CREATE INDEX IF NOT EXISTS price_history_timestamp_index ON price_history(timestamp);`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS space_striker (id INTEGER PRIMARY KEY AUTOINCREMENT, address TEXT, ip TEXT, highscore INTEGER, last_connexion_timestamp INTEGER, highscore_tries INTEGER, highscore_timestamp INTEGER, CONSTRAINT addressIpCouple UNIQUE(address,ip));`
    );
    await this.db.run(
      `CREATE TABLE IF NOT EXISTS space_striker_winners (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER, address TEXT, highscore INTEGER, highscore_tries INTEGER);`
    );

    /*try {
      await this.db.run(
        `ALTER TABLE price_history ADD volume_in_kan INTEGER DEFAULT 0;`
      );
      await this.db.run(`UPDATE price_history SET volume_in_kan=0;`);
    } catch (err) {
      console.log(err);
    }*/
    /*await this.db.run(
      `CREATE TABLE IF NOT EXISTS constants (canvas_width INTEGER, canvas_height INTEGER);`
    );*/
  }
}

module.exports = DbModel;

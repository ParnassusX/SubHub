const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message);
      throw err;
    }
});

const initDb = (callback) => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      CONSTRAINT email_unique UNIQUE (email)
    )`, (err) => {
      if (err) { return callback(err); }
    });

    db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      name TEXT,
      category TEXT,
      billingCycle TEXT,
      nextPaymentDate TEXT,
      amount REAL,
      FOREIGN KEY (userId) REFERENCES users (id)
    )`, (err) => {
      if (err) { return callback(err); }
    });
    callback(null);
  });
};

module.exports = { initDb, db };

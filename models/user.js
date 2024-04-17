const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const res = require("express/lib/response");
const db = new sqlite3.Database("test.sqlite");

const sql =
  "CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL, age INT NOT NULL, isAdmin INTEGER DEFAULT 0  )";

db.run(sql);

const query = "SELECT * FROM users WHERE name = ?";

db.get(query, (err, user) => {
  if (err) {
    console.error(err);
    return;
  }
  if (user) {
    const updateQuery = "UPDATE users SET isAdmin = ? WHERE id = ?";
    db.run(updateQuery);
  }
});
class User {
  static create(username, password, isAdmin, cb) {
    db.run('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)', [username, password, isAdmin], function(err) {
      if (err) {
        return cb(err);
      }
      
      cb(null);
    });
  }

  static authenticate(username, password, cb) {
    db.get('SELECT id, password FROM users WHERE username = ?', [username], function(err, row) {
      if (err) {
        return cb(err);
      }
      
      if (!row) {
        return cb(null, false);
      }

      if (row.password === password) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    });
  }

  static updateAdminStatus(id, isAdmin, cb) {
    db.run('UPDATE users SET isAdmin = ? WHERE id = ?', [isAdmin, id], function(err) {
      if (err) {
        return cb(err);
      }
      
      cb(null);
    });
  }
}

module.exports = User;



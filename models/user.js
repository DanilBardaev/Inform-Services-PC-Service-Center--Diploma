const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("test.sqlite");
const nodemailer = require("nodemailer");

const sql =
  "CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL, age INT NOT NULL, isAdmin INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP )";

db.run(sql);

class User {
  static create(username, email, password, age, isAdmin, cb) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return cb(err);
      const insertUserQuery = "INSERT INTO users (name, email, password, age, isAdmin) VALUES (?, ?, ?, ?, ?)";
      db.run(insertUserQuery, [username, email, hashedPassword, age, isAdmin], cb);
    });
  }

  static authenticate(username, password, cb) {
    const selectUserQuery = "SELECT id, password FROM users WHERE name = ?";
    db.get(selectUserQuery, [username], (err, user) => {
      if (err) return cb(err);
      if (!user) return cb(null, false);

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) return cb(err);
        cb(null, result);
      });
    });
  }

  static updateAdminStatus(id, isAdmin, cb) {
    const updateAdminQuery = "UPDATE users SET isAdmin = ? WHERE id = ?";
    db.run(updateAdminQuery, [isAdmin, id], cb);
  }

  static sendNotificationEmail(userId, subject, message) {
    const getUserEmailQuery = "SELECT email FROM users WHERE id = ?";
    db.get(getUserEmailQuery, [userId], (err, user) => {
      if (err) return console.error("Error retrieving user email:", err);

      const userEmail = user.email;

      // Создаем транспортер для отправки почты
      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: "danillol132v14@hotmail.com", 
          pass: "password123132132B" 
        }
      });

      // Настройка письма
      const mailOptions = {
        from: "danillol132v14@hotmail.com", 
        to: userEmail, // Вместо recipientEmail здесь нужно использовать userEmail
        subject: subject, // Тема письма
        text: message // Содержание письма
      };

      // Отправляем письмо
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending notification email:", err);
        } else {
          console.log("Notification email sent:", info.response);
        }
      });
    });
  }

}

module.exports = User;

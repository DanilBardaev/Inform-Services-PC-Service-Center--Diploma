const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const nodemailer = require("nodemailer");

const db = new sqlite3.Database("test.sqlite");

// Создаем таблицу пользователей, если она не существует
const createUserTableSql = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    age INT NOT NULL,
    isAdmin INTEGER DEFAULT 0,
    requestStatus TEXT DEFAULT 'Pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createUserTableSql);

class User {
  static create(username, email, password, age, isAdmin, recipientEmail) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return;
      }
      const insertUserQuery = "INSERT INTO users (username, email, password, age, isAdmin) VALUES (?, ?, ?, ?, ?)";
      db.run(insertUserQuery, [username, email, hashedPassword, age, isAdmin], (err) => {
        if (err) {
          console.error("Error creating user:", err);
          return;
        }
        this.sendNotificationEmail(username, "Welcome to our platform!", recipientEmail);
      });
    });
  }static findByEmail(email) {
  const selectUserQuery = "SELECT * FROM users WHERE email = ?";
  return new Promise((resolve, reject) => {
    db.get(selectUserQuery, [email], (err, user) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(user);
    });
  });
}


  static authenticate(username, password, cb) {
    const selectUserQuery = "SELECT id, password FROM users WHERE username = ?";
    db.get(selectUserQuery, [username], (err, user) => {
      if (err) {
        console.error("Error retrieving user:", err);
        cb(err, null);
        return;
      }
      if (!user) {
        cb(null, false);
        return;
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          cb(err, null);
          return;
        }
        cb(null, result);
      });
    });
  }

  static updateRequestStatus(userId, requestStatus) {
    const updateRequestStatusQuery = "UPDATE users SET requestStatus = ? WHERE id = ?";
    db.run(updateRequestStatusQuery, [requestStatus, userId], (err) => {
      if (err) {
        console.error("Error updating request status:", err);
      }
    });
  }

  static sendNotificationEmail(username, subject, recipientEmail) {
    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "danillol132v14@hotmail.com",
        pass: "password123132132B"
      }
    });

    const mailOptions = {
      from: "danillol132v14@hotmail.com",
      to: recipientEmail,
      subject: subject,
      text: `Dear ${username},\n\n${subject}\n\nBest regards,\nYour Application`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending notification email:", err);
      } else {
        console.log("Notification email sent:", info.response);
      }
    });
  }
}

module.exports = { User };

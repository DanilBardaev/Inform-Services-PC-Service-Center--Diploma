const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("test.sqlite");
const nodemailer = require("nodemailer");

const sql =
  "CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL, age INT NOT NULL, isAdmin INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, profile_img TEXT DEFAULT 'https://kappa.lol/Nykez')";

db.run(sql);

class User {
  static create(username, email, password, age, isAdmin, recipientEmail, cb) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return cb(err);
      const insertUserQuery = "INSERT INTO users (name, email, password, age, isAdmin) VALUES (?, ?, ?, ?, ?)";
      db.run(insertUserQuery, [username, email, hashedPassword, age, isAdmin], (err) => {
        if (err) return cb(err);
        this.sendNotificationEmail(username, "Теперь вам доступны наши услуги.", recipientEmail); // Отправка уведомления о создании нового пользователя
        cb(null); // Вызываем колбэк после завершения операции
      });
    });
  }
  
  static findOneByEmail(email, cb) {
    const selectUserQuery = "SELECT * FROM users WHERE email = ?";
    db.get(selectUserQuery, [email], (err, user) => {
      if (err) {
        console.error("Ошибка при поиске пользователя по email:", err);
        return cb(err); // Вернем ошибку через колбэк, если произошла ошибка
      }
      cb(null, user); // Вызываем колбэк только если нет ошибок
    });
  }
  
  static findOneByName(username, cb) {
    const selectUserQuery = "SELECT * FROM users WHERE name = ?";
    db.get(selectUserQuery, [username], (err, user) => {
      if (err) {
        console.error("Ошибка при поиске пользователя по имени:", err);
        return cb(err); // Вернем ошибку через колбэк, если произошла ошибка
      }
      cb(null, user); // Вызываем колбэк только если нет ошибок
    });
  }
  
  static updateProfile(userId, newData, cb) {
    const { profile_img } = newData;
    const updateProfileQuery = "UPDATE users SET profile_img = ? WHERE id = ?";
    db.run(updateProfileQuery, [profile_img, userId], (err) => {
      if (err) {
        console.error("Error updating profile:", err);
        return cb(err);
      }
      cb(null);
    });
  }

  static updateName(userId, newName, cb) {
    const updateNameQuery = "UPDATE users SET name = ? WHERE id = ?";
    db.run(updateNameQuery, [newName, userId], (err) => {
      if (err) {
        console.error("Error updating name:", err);
        return cb(err);
      }
      cb(null);
    });
  }

  
  static updateAdminStatus(id, isAdmin, cb) {
    const updateAdminQuery = "UPDATE users SET isAdmin = ? WHERE id = ?";
    db.run(updateAdminQuery, [isAdmin, id], cb);
  }
  
  static sendNotificationEmail(username, subject, recipientEmail) {
    // Настройка транспортера для отправки почты
    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "anillol132v14@hotmail.com", 
        pass: "password123132132B" 
      }
    });

    // Настройка письма
    const mailOptions = {
      from: "anillol132v14@hotmail.com", 
      to: recipientEmail, 
      subject: subject, 
      html: `
        <div style="color: #00000; font-weight: 400;">
          <p style="font-size: 23px; color: #4280d6; font-weight: 500; margin-bottom: 25px;">Добро пожаловать в Информ Сервис!</p>
          <p style="color: #000000; font-size: 18x;">Дорогой ${username},</p>
          <p style="color: #000000; font-size: 18x;">${subject}</p>
          <p style="color: #000000; font-size: 18x; margin-top: 20px;">С уважением,</p>
          <p style="color: #000000; font-size: 18x;">Информ Сервис</p>
          <img src="https://kappa.lol/S2vq6" alt="#" style="max-width: 120px; margin-bottom: 20px;">
        </div>
      `, 
    };

    // Отправка письма
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending notification email:", err);
      } else {
        console.log("Notification email sent:", info.response);
      }
    });
  }
}

module.exports = User;

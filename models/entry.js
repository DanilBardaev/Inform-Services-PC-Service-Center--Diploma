const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("test.sqlite");
const multer = require("multer");
const path = require('path');
const nodemailer = require("nodemailer");

// Настройка хранилища для загружаемых файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Папка для сохранения загруженных файлов
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname)); // Генерация уникального имени файла
  },
});

// Создание экземпляра multer с настройками хранилища
const upload = multer({ storage: storage });

// SQL-запрос для создания таблицы записей (если она не существует)
const createEntriesTableSql = `
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    imagePath TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Создание таблицы записей (если она не существует)
db.run(createEntriesTableSql);

class Entry {
  static create(data, recipientEmail) {
    const insertEntrySql = `
    INSERT INTO entries (username, title, content, imagePath, timestamp, createdAt)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `;
    db.run(insertEntrySql, [data.username, data.title, data.content, data.imagePath], (err) => {
      if (err) {
        console.error("Error creating entry:", err);
      } else {
        console.log("Recipient email:", data.recipientEmail); // Выводим адрес получателя в консоль
        // Отправка уведомления о создании новой записи
        this.sendNotificationEmail(data.name, data.title, recipientEmail); // Передача recipientEmail
      }
    });
  }

  // Метод для получения всех записей
  static selectAll(cb) {
    const selectAllSql = "SELECT * FROM entries ORDER BY timestamp DESC";
    db.all(selectAllSql, cb);
  }

  // Метод для получения записи по идентификатору
  static getEntryById(id, cb) {
    const selectEntrySql = "SELECT * FROM entries WHERE id = ?";
    db.get(selectEntrySql, [id], cb);
  }

  // Метод для удаления записи по идентификатору
  static deleteById(id, cb) {
    const deleteEntrySql = "DELETE FROM entries WHERE id = ?";
    db.run(deleteEntrySql, [id], cb);
  }

  // Метод для обновления записи
  static updateById(id, updateInf, cb) {
    const updateEntrySql = `
      UPDATE entries
      SET title = ?, content = ?, imagePath = ?, timestamp = datetime('now')
      WHERE id = ?
    `;
    db.run(updateEntrySql, [updateInf.title, updateInf.content, updateInf.imagePath, id], cb);
  }

  static sendNotificationEmail(username, title, recipientEmail) {
    // Настройка транспортера для отправки почты
    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "danillol132v14@hotmail.com", 
        pass: "password123132132B" 
      }
    });
  
    // Настройка письма
    const mailOptions = {
      from: "danillol132v14@hotmail.com", // От кого отправляется письмо
      to: recipientEmail, // Кому отправляется письмо
      subject: "New Entry Created", // Тема письма
      text: `Dear ${username},\n\nA new entry titled "${title}" has been created.\n\nBest regards,\nYour Application` // Содержание письма
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

module.exports = Entry;

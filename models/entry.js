// entry.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("test.sqlite");
const nodemailer = require("nodemailer");

// SQL-запрос для создания таблицы записей (если она не существует)
const createEntriesTableSql = `
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    imagePath TEXT,
    status TEXT DEFAULT 'Подана',
    ticket INTEGER, -- Добавляем поле для номера заявки
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Создание таблицы записей (если она не существует)
db.run(createEntriesTableSql);

class Entry {
  static create(data, recipientEmail, ticketNumber, service) {
    const insertEntrySql = `
      INSERT INTO entries (username, title, content, imagePath, status, ticket, timestamp, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    db.run(insertEntrySql, [data.username, data.title, data.content, data.imagePath, 'Подана', ticketNumber], (err) => {
      if (err) {
        console.error("Error creating entry:", err);
      } else {
        console.log("Recipient email:", recipientEmail); // Выводим адрес получателя в консоль
        // Отправка уведомления о создании новой записи
        this.sendNotificationEmail(data.username, data.title, recipientEmail, service); // Передача recipientEmail
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

  // Метод для обновления статуса заявки
  static updateStatusById(id, status, cb) {
    const updateStatusSql = "UPDATE entries SET status = ? WHERE id = ?";
    db.run(updateStatusSql, [status, id], cb);
  }

  // Метод для отправки уведомления о создании новой записи
  static sendNotificationEmail(username, title, recipientEmail, service) {
    // Настройка транспортера для отправки почты
    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "qwevdanil1231weqqewqvwv@outlook.com",
        pass: "password123132132B",
      },
    });

    // Настройка письма
    const mailOptions = {
      from: "qwevdanil1231weqqewqvwv@outlook.com", // От кого отправляется письмо
      to: recipientEmail, // Кому отправляется письмо
      subject: "Заявка на услугу Информ Сервис", // Тема письма
      html: `
      <div style="color: #00000; font-weight: 400;">
      <p style="font-size: 23px; color: #4280d6; font-weight: 500; margin-bottom: 25px;">Ваша заявка принята!</p>
      <p style="color: #000000; font-size: 16x;">Дорогой ${username},</p>
      <p style="color: #000000; font-size: 16x;">${title} была создана.</p>
      <p style="color: #000000; font-size: 16x;">Услуга: ${service}.</p>
      <p style="margin-top: 20px; color: #000000; font-size: 16x;">С уважением,</p>
      <p style="color: #000000; font-size: 16x;">Информ Сервис</p>
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

module.exports = Entry;

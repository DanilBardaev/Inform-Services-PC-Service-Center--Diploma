const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("test.sqlite");
const nodemailer = require("nodemailer");

const createEntriesTableSql = `
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, 
    username TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    imagePath TEXT,
    status TEXT DEFAULT 'Подана',
    ticket INTEGER, -- Поле для номера заявки
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) 
  )
`;
db.run(createEntriesTableSql);

class Entry {
  static create(data, recipientEmail, ticketNumber, service, comments) {
    const insertEntrySql = `
      INSERT INTO entries (user_id, username, title, content, imagePath, status, ticket, timestamp, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    db.run(insertEntrySql, [data.user_id, data.username, data.title, data.content, data.imagePath, 'Подана', ticketNumber], (err) => {
      if (err) {
        console.error("Error creating entry:", err);
      } else {
        console.log("Recipient email:", recipientEmail);
        this.sendNotificationEmail(data.username, data.title, recipientEmail, service, comments);
      }
    });
  }
  static getUserEntries(userId, cb) {
    const selectEntriesSql = "SELECT * FROM entries WHERE user_id = ? ORDER BY timestamp DESC";
    db.all(selectEntriesSql, [userId], cb);
  }
 
  static selectAll(cb) {
    const selectAllSql = "SELECT * FROM entries ORDER BY timestamp DESC";
    db.all(selectAllSql, cb);
  }

  static getEntryById(id, cb) {
    const selectEntrySql = "SELECT * FROM entries WHERE id = ?";
    db.get(selectEntrySql, [id], cb);
  }


  static deleteById(id, cb) {
    const deleteEntrySql = "DELETE FROM entries WHERE id = ?";
    db.run(deleteEntrySql, [id], cb);
  }


  static updateById(id, updateInf, cb) {
    const updateEntrySql = `
      UPDATE entries
      SET title = ?, content = ?, imagePath = ?, timestamp = datetime('now')
      WHERE id = ?
    `;
    db.run(updateEntrySql, [updateInf.title, updateInf.content, updateInf.imagePath, id], cb);
  }

  static updateStatusById(id, status, cb) {
    const updateStatusSql = "UPDATE entries SET status = ? WHERE id = ?";
    db.run(updateStatusSql, [status, id], cb);
  }

  static sendNotificationEmail(username, title, recipientEmail, service,comments) {
   
    const transporter = nodemailer.createTransport({    
      host: 'smtp.mail.ru',
      service: 'mail',
      port: 465,
      secure: true,
   
      debug: true,
      secureConnection: false,
      auth: {
        user: "informserice1234@mail.ru",
        pass: "nknihRYFEHpYEGpCmjcd",
      },
      smtp:{
        rejectUnAuthorized: true,
      }
    });

    const mailOptions = {
      from: "informserice1234@mail.ru", 
      to: recipientEmail, 
      subject: "Заявка на услугу Информ Сервис", 
      html: `
      <div style="color: #00000; font-weight: 400;">
      <p style="font-size: 23px; color: #4280d6; font-weight: 500; margin-bottom: 25px;">Ваше заявка отправлена нам на почту!</p>
      <p style="color: #000000; font-size: 16x;">Дорогой ${username},</p>
      <p style="color: #000000; font-size: 16x;">${title} была создана.</p>
      <p style="color: #000000; font-size: 16x;">Услуга: ${service}.</p>
      <p style="color: #000000; font-size: 16x;">Ваше сообщение: ${comments}</p>
      <p style="margin-top: 20px; color: #000000; font-size: 16x;">С уважением,</p>
      <p style="color: #000000; font-size: 16x;">Информ Сервис</p>
      <img src="https://kappa.lol/S2vq6" alt="#" style="max-width: 120px; margin-bottom: 20px;">
      </div>
    `,
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

module.exports = Entry;

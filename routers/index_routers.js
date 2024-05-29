const express = require("express");
const path = require("path");
const router = express.Router();
const register = require("../controllers/register");
const login = require("../controllers/login");
const validate = require("../middleware/validate");
const User = require("../models/user"); 
const Entry = require("../models/entry"); 
const multer = require("multer");
const passport = require("passport");
const ensureAuthenticated = require("../middleware/isAuthenticated");
const nodemailer = require("nodemailer");
const link = "https://kappa.lol/OFmCl";
const messanger = "https://kappa.lol/g-qSm";
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("test.sqlite");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

router.post("/profile/updateImg", upload.single("profileImg"), ensureAuthenticated, async (req, res) => {
  const userId = req.user.id;
  const newProfileImg = req.file ? req.file.path : null;

  try {
    await User.updateProfile(userId, { profile_img: newProfileImg }, (err) => {
      if (err) {
        console.error("Error updating profile image:", err);
        return res.status(500).send("Ошибка при обновлении фото профиля");
      } else {
        return res.redirect("/profile");
      }
    });
  } catch (err) {
    console.error("Error updating profile image:", err);
    res.status(500).send("Ошибка при обновлении фото профиля");
  }
});

router.post("/profile/updateName", ensureAuthenticated, async (req, res) => {
  const userId = req.user.id;
  const newName = req.body.name;
  const ticketNumber = req.query.ticket;
  const service = req.query.service;

  try {
    await User.updateName(userId, newName, (err) => {
      if (err) {
        console.error("Error updating name:", err);
        return res.status(500).send("Ошибка при обновлении имени пользователя");
      } else {
        return res.redirect(`/profile?service=${encodeURIComponent(service)}&ticket=${ticketNumber}`);
      }
    });
  } catch (err) {
    console.error("Error updating name:", err);
    res.status(500).send("Ошибка при обновлении имени пользователя");
  }
});


router.get("/", function(req, res) {
  res.render("index", { link: link, messanger: messanger });
});
// const { comments } = req.body; 
router.get("/service_request", function(req, res) {
  res.render("service_request", { user: req.user, link: link, messanger: messanger});
});

router.post("/submit_request_service_request", ensureAuthenticated, async (req, res) => {
  const username = req.user ? req.user.name : null;
  const { service, comments } = req.body;
  const recipientEmail = req.user.email;

  const data = {
    user_id: req.user.id,
    username: username,
    title: "Новая заявка",
    content: `Выбранная услуга: ${service}\n\nКомментарий: ${comments}`,
    imagePath: ""
  };

  try {
    const randomTicketNumber = generateRandomNumber();

    // Сохраняем информацию о заявке в базе данных
    await Entry.create(data, recipientEmail, randomTicketNumber, service, comments);

    res.redirect(`/profile`);
  } catch (err) {
    console.error("Error submitting service request:", err);
    res.status(500).send("Ошибка при отправке заявки");
  }
});


router.post("/submit_request", ensureAuthenticated, async (req, res) => {
  const username = req.user ? req.user.name : null;
  const { service, comments } = req.body;
  const recipientEmail = req.user.email;

  const data = {
    user_id: req.user.id,
    username: username,
    title: "Новая заявка",
    content: `Выбранная услуга: ${service}\n\nКомментарий: ${comments}`,
    imagePath: ""
  };

  try {
    const randomTicketNumber = generateRandomNumber();

    // Сохраняем информацию о заявке в базе данных
    await Entry.create(data, recipientEmail, randomTicketNumber, service, comments);

    res.redirect(`/profile`);
  } catch (err) {
    console.error("Error submitting service request:", err);
    res.status(500).send("Ошибка при отправке заявки");
  }
});

router.post("/submit_contact_form", async (req, res) => {
  const { name, email, phone, message } = req.body;
  const { service, comments, recipientEmail } = req.body; 
 
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
 
  // Настройка письма
  const mailOptions = {
    
    from: "informserice1234@mail.ru", 
      to: recipientEmail, 
    subject: 'Мы получили ваше сообщение',
    html: `
      <div style="color: #00000; font-weight: 400;">
      <p style="font-size: 23px; color: #4280d6; font-weight: 500; margin-bottom: 25px;">Ваше сообщение отправлено нам на почту!</p>
      <p style="color: #000000; font-size: 16x;">Дорогой ${name},</p>
      <p style="color: #000000; font-size: 16x;">Почта отправителя: ${recipientEmail}</p>
      <p style="color: #000000; font-size: 16x;">Телефон: ${phone}</p>
      <p style="color: #000000; font-size: 16x;">Ваше сообщение: ${message}</p>
      <p style="margin-top: 20px; color: #000000; font-size: 16x;">С уважением,</p>
      <p style="color: #000000; font-size: 16x;">Информ Сервис</p>
      <img src="https://kappa.lol/S2vq6" alt="#" style="max-width: 120px; margin-bottom: 20px;">
      </div>
    `,
  };

  try {
   
    await transporter.sendMail(mailOptions, recipientEmail);
    res.status(200).send("Ваше сообщение отправлено нам на почту, с уважением Информ Сервис.");
  } catch (error) {
    console.error("Ошибка отправки сообщения:", error);
    res.status(500).send("Ошибка при отправке сообщения");
  }
});
  
function generateRandomNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

router.get("/profile", ensureAuthenticated, async function(req, res) {
  try {
   
    Entry.getUserEntries(req.user.id, (err, entries) => {
      if (err) {
        console.error("Error fetching user entries:", err);
        return res.status(500).send("Ошибка при получении заявок пользователя");
      }

      res.render("profile", { user: req.user, entries: entries, link: link });
    });
  } catch (err) {
    console.error("Error fetching ticket number:", err);
    res.status(500).send("Ошибка при получении номера заявки");
  }
});




router.get("/register", register.form);

router.post("/register", register.submit);

router.get("/login", login.form);

router.post("/login", login.submit);

router.get("/pc", function(req, res) {
  res.render("pc",{ link: link, messanger: messanger }); 
});
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
    return next();
  } else {
    res.redirect('/login'); // или другая страница ошибки
  }
}
router.get("/admin", ensureAuthenticated, function(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).send("Доступ запрещен");
  }

  Entry.selectAll((err, entries) => {
    if (err) {
      console.error("Error retrieving entries:", err);
      return res.status(500).send("Ошибка при получении заявок");
    }

    res.render("admin", { link: link, entries: entries });
  });
});
router.get("/admin", ensureAuthenticated, ensureAdmin, async function(req, res) {
  try {
    Entry.selectAll((err, entries) => {
      if (err) {
        console.error("Error fetching all entries:", err);
        return res.status(500).send("Ошибка при получении всех заявок");
      }
      res.render("admin", { user: req.user, entries: entries });
    });
  } catch (err) {
    console.error("Error fetching all entries:", err);
    res.status(500).send("Ошибка при получении всех заявок");
  }
});

router.post("/admin/delete/:id", ensureAuthenticated, ensureAdmin, async function(req, res) {
  try {
    const entryId = req.params.id;
    Entry.deleteById(entryId, (err) => {
      if (err) {
        console.error("Error deleting entry:", err);
        return res.status(500).send("Ошибка при удалении заявки");
      }
      res.redirect("/admin");
    });
  } catch (err) {
    console.error("Error deleting entry:", err);
    res.status(500).send("Ошибка при удалении заявки");
  }
});

router.post("/admin/updateStatus/:id", ensureAuthenticated, ensureAdmin, async function(req, res) {
  try {
    const entryId = req.params.id;
    const newStatus = req.body.status;
    const userId = req.body.userId;

    Entry.updateStatusById(entryId, newStatus, (err) => {
      if (err) {
        console.error("Error updating entry status:", err);
        return res.status(500).send("Ошибка при обновлении статуса заявки");
      }
      Entry.sendStatusUpdateEmail(userId, newStatus); 
      res.redirect("/admin");
    });
  } catch (err) {
    console.error("Error updating entry status:", err);
    res.status(500).send("Ошибка при обновлении статуса заявки");
  }
});
router.post('/deleteEntry', (req, res) => {
  const ticket = req.body.ticket;
  const deleteQuery = "DELETE FROM entries WHERE ticket = ?";
  db.run(deleteQuery, [ticket], function(err) {
    if (err) {
      console.error("Ошибка при удалении заявки:", err);
      return res.status(500).send("Ошибка сервера");
    }
    res.redirect('/profile'); 
  });
});

router.get("/pc-service", function(req, res) {
  res.render("pc-service",{ link: link, messanger: messanger }); 
});
router.get("/apple", function(req, res) {
  res.render("apple",{ link: link, messanger: messanger }); 
});
router.get("/mobile", function(req, res) {
  res.render("mobile",{ link: link, messanger: messanger }); 
});
router.get("/tablet", function(req, res) {
  res.render("tablet",{ link: link, messanger: messanger }); 
});
router.get("/internet", function(req, res) {
  res.render("internet",{ link: link, messanger: messanger }); 
});
router.get("/laptop", function(req, res) {
  res.render("laptop",{ link: link, messanger: messanger }); 
});
router.get("/contacts", function(req, res) {
  res.render("contacts",{ link: link, messanger: messanger }); 
});
router.get("/index", function(req, res) {
  res.render("index",{ link: link, messanger: messanger }); 
});
router.get("/services", function(req, res) {
  res.render("services",{ link: link, messanger: messanger }); 
});
router.get("/discounts", function(req, res) {
  res.render("discounts",{ link: link, messanger: messanger }); 
});


router.put("/edit/:id", async (req, res, next) => {
  try {
    const { title, content, imagePath } = req.body;
    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: "Запись не найдена" });
    }
    entry.title = title;
    entry.content = content;
    entry.imagePath = imagePath;
    entry.timestamp = new Date();
    await entry.save();
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/auth/yandex",
  passport.authenticate("yandex"),
);

router.get(
  "/auth/yandex/callback",
  passport.authenticate("yandex", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/index");
  }
);

router.get('/auth/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] })
);

router.get( '/auth/google/callback',
  passport.authenticate( 'google', { successRedirect: '/', failureRedirect: '/login' })
);

router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

router.get("/auth/vkontakte", passport.authenticate("vkontakte"));

router.get(
  "/auth/vkontakte/callback",
  passport.authenticate("vkontakte", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

router.get("/logout", login.logout);

module.exports = router;

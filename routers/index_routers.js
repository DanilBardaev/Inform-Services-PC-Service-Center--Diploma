const express = require("express");
const path = require("path");
const router = express.Router();
const register = require("../controllers/register");
const login = require("../controllers/login");
const entries = require("../controllers/entries");
const validate = require("../middleware/validate");
const User = require("../models/user"); 
const Entry = require("../models/entry"); 
const multer = require("multer");
const passport = require("passport");
const ensureAuthenticated = require("../middleware/isAuthenticated");
const nodemailer = require("nodemailer");
const link = "https://kappa.lol/OFmCl";
const messanger = "https://kappa.lol/iSONv";
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
router.get("/service_request", ensureAuthenticated, function(req, res) {
  res.render("service_request", { user: req.user });
});

router.post("/submit_request_service_request", ensureAuthenticated, async (req, res) => {
  const username = req.user ? req.user.name : null;
  const { service, comments, recipientEmail } = req.body; 

  const data = {
      username: username,
      title: "Новая заявка",
      content: `Выбранная услуга: ${service}\n\nКомментарий: ${comments}`,
      imagePath: ""
  };

  try {
      const randomTicketNumber = generateRandomNumber();
      const ticketNumber = req.session.ticketNumber || [];
      ticketNumber.push(randomTicketNumber);
      req.session.ticketNumber = ticketNumber;
      
      // Сохраняем информацию о выбранной услуге для этой заявки в объекте services
      req.session.services = req.session.services || {};
      req.session.services[randomTicketNumber] = service;

      await Entry.create(data, recipientEmail, randomTicketNumber, service);
    
      res.redirect(`/profile?service=${encodeURIComponent(service)}`); 
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
      username: username,
      title: "Новая заявка",
      content: `Выбранная услуга: ${service}\n\nКомментарий: ${comments}`,
      imagePath: ""
  };

  try {
      const randomTicketNumber = generateRandomNumber();
      const ticketNumber = req.session.ticketNumber || [];
      ticketNumber.push(randomTicketNumber);
      req.session.ticketNumber = ticketNumber;
      
      // Сохраняем информацию о выбранной услуге для этой заявки в объекте services
      req.session.services = req.session.services || {};
      req.session.services[randomTicketNumber] = service;

      await Entry.create(data, recipientEmail, randomTicketNumber, service);
      Entry.sendNotificationEmail(username, data.title, recipientEmail, service);
      res.redirect(`/profile?service=${encodeURIComponent(service)}`); 
  } catch (err) {
      console.error("Error submitting service request:", err);
      res.status(500).send("Ошибка при отправке заявки");
  }
});

router.post("/submit_contact_form", async (req, res) => {
  const { name, email, phone, message } = req.body;
  const { service, comments, recipientEmail } = req.body; 
  // Создание транспортера для отправки писем
  const transporter = nodemailer.createTransport({    
    host: 'smtp.mail.ru',
    service: 'mail',
    port: 465,
    secure: true,
    logger: true,
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
    
    from: "informserice1234@mail.ru", // От кого отправляется письмо
      to: recipientEmail, // Кому отправляется письмо
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
    // Отправка письма
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
      const ticketNumbers = req.session.ticketNumber || []; // Получаем массив номеров заявок из сессии
      const services = req.session.services || {}; // Получаем объект с выбранными услугами для заявок

      // Рендеринг страницы профиля с массивом номеров заявок и выбранными услугами
      res.render("profile", { user: req.user, services: services, ticketNumbers: ticketNumbers, link: link }); 
  } catch (err) {
      console.error("Error fetching ticket number:", err);
      res.status(500).send("Ошибка при получении номера заявки");
  }
});



router.get("/entries", entries.list);
router.get("/post", entries.form);

router.post(
  "/post",
  upload.single("entryImage"),
  ensureAuthenticated,
  validate.required("[entry[title]]"),
  validate.required("[entry[content]]"),
  validate.lengthAbove("[entry[title]]", 4),
  entries.submit
);

router.get("/register", register.form);

router.post("/register", register.submit);

router.get("/login", login.form);

router.post("/login", login.submit);

router.get("/pc", function(req, res) {
  res.render("pc",{ link: link, messanger: messanger }); 
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
router.get("/delete/:id", entries.delete);

router.get("/edit/:id", entries.updateForm);

router.post("/edit/:id", entries.updateSubmit);

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
    res.redirect("/entries");
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

const express = require("express");
const path = require("path");
const router = express.Router();
const register = require("../controllers/register");
const login = require("../controllers/login");
const entries = require("../controllers/entries");
const validate = require("../middleware/validate");
const User = require("../models/user"); // Используем модель User
const Entry = require("../models/entry"); // Используем модель Entry
const multer = require("multer");
const passport = require("passport");
const ensureAuthenticated = require("../middleware/isAuthenticated");

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
        // Редирект на страницу профиля
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
  const ticketNumber = req.query.ticket; // Получаем ticketNumber из запроса
  const service = req.query.service; // Получаем service из запроса

  try {
    await User.updateName(userId, newName, (err) => {
      if (err) {
        console.error("Error updating name:", err);
        return res.status(500).send("Ошибка при обновлении имени пользователя");
      } else {
        // Передаем обратно параметры service и ticketNumber
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

router.get("/service_request", ensureAuthenticated, function(req, res) {
  res.render("service_request", { user: req.user });
});

router.post("/submit_request", ensureAuthenticated, async (req, res) => {
  const username = req.user ? req.user.name : null;
  const { service, recipientEmail } = req.body;

  const data = {
    username: username,
    title: "Новая заявка",
    content: `Услуга: ${service}`,
    imagePath: "" 
  };
  try {
    const randomTicketNumber = generateRandomNumber();
    req.session.service = service;
    req.session.ticketNumber = randomTicketNumber;

    await Entry.create(data, recipientEmail, randomTicketNumber, service); 

    res.redirect("/profile");

  } catch (err) {
    console.error("Error submitting service request:", err);
    res.status(500).send("Ошибка при отправке заявки");
  }
});

function generateRandomNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

router.get("/profile", ensureAuthenticated, async function(req, res) {
  try {
    // Проверяем наличие значения service и ticket в сессии
    const service = req.session.service;
    const ticketNumber = req.session.ticketNumber;
    // Очищаем значения из сессии
    delete req.session.service;
    delete req.session.ticketNumber;

    res.render("profile", { user: req.user, service: service, ticketNumber: ticketNumber, link: link }); 
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

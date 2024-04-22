const {User} = require("../models/user");
const link = "https://kappa.lol/OFmCl";
const messanger = "https://kappa.lol/iSONv";
const logger = require("../logger/index");
const winston = require("winston");
const jwt = require("jsonwebtoken");
require("dotenv").config();
exports.form = (req, res) => {
  res.render("registerForm", { errors: {}, link: link, messanger: messanger });
};

exports.submit = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create(name, email, password, req.body.age, 0, email); // Создание нового пользователя
    // Вход пользователя в систему
    req.session.userEmail = email;
    req.session.userName = name;

    // Выполнение входа в систему с использованием JWT
    const token = jwt.sign(
      {
        name: name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 60 * 60,
      }
    );
    req.session.token = token; // Сохранение токена в сессии

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 60 * 60,
    });
    console.log("Токен подготовлен: " + token);
    logger.info("Токен подготовлен: " + token);

    res.redirect("/entries"); // Перенаправление на страницу entries.ejs
  } catch (err) {
    console.error("Ошибка при регистрации пользователя:", err);
    return next(err);
  }
};
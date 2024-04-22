const User = require("../models/user");

const link = "https://kappa.lol/OFmCl";
const messanger = "https://kappa.lol/iSONv";
const logger = require("../logger/index");
const winston = require("winston");
const jwt = require("jsonwebtoken");
require("dotenv").config();
console.log(User);

exports.form = (req, res) => {
  res.render("registerForm", { errors: {}, link: link, messanger: messanger });
};

exports.submit = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    User.findOneByEmail(email, (err, user) => { // Передаем колбэк
      if (err) {
        console.error("Ошибка при поиске пользователя:", err);
        return next(err);
      }
      if (user) {
        logger.info("Такой пользователь в базе уже существует:", user);
        res.redirect("/entries"); // Перенаправление на страницу entries.ejs
      } else {
        User.create(
          name,
          email,
          password,
          req.body.age,
          0, // isAdmin
          req.body.recipientEmail, // recipientEmail передается здесь
          (err) => {
            if (err) {
              console.error("Ошибка при создании пользователя:", err);
              return next(err);
            }
            req.session.userEmail = email;
            req.session.userName = name;
            // Далее код для создания токена и перенаправления
            const token = jwt.sign(
              {
                name: req.body.name,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: 60 * 60,
              }
            );
            res.cookie("jwt", token, {
              httpOnly: true,
              maxAge: 60 * 60,
            });
            console.log("Токен подготовлен: " + token);
            logger.info("Токен подготовлен: " + token);
            res.redirect("/entries"); // Перенаправление на страницу entries.ejs
          }
        );
      }
    });
  } catch (err) {
    console.error("Ошибка при регистрации пользователя:", err);
    return next(err);
  }
};

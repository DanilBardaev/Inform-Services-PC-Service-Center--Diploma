// const User = require("../models/user");
// const {emailValidation, passValidation}  = require("../middleware/validation");
const { User } = require("../models/db");

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
    const user = await User.findOne({
      where: { email: email },
    });
    if (user) {
      logger.info("Такой пользователь в базе уже существует:", user);
      res.redirect("/entries"); // Перенаправление на страницу entries.ejs
    } else {
      await User.create({
        name: name,
        email: email,
        password: password,
        age: req.body.age,
      });
      req.session.userEmail = email;
      req.session.userName = name;
    }
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
  } catch (err) {
    console.error("Ошибка при регистрации пользователя:", err);
    return next(err);
  }
};

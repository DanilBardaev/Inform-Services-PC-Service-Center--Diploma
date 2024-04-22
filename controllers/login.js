const User = require("../models/user");
const validate = require("../middleware/validate");
const messanger = "https://kappa.lol/iSONv";
const logger = require("../logger/index");
const link = "https://kappa.lol/OFmCl";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
require("dotenv").config();

exports.form = (req, res) => {
  logger.info("Пользователь зашёл на страницу логина");
  res.render("loginForm", { title: "Login", messanger: messanger, link: link });
};


async function authenticate(dataForm, cb) {
  try{
  const user = await User.findOne({where: {email: dataForm.email}})
    if (err) return cb(err);
    if(!user) return cb();
    const result = bcrypt.compare(dataForm.password,user.password)
        if (result)return cb(null,user);
       return cb()
       } catch (err) {
    return cb(err)
   }
  }



exports.submit = (req, res, next) => {
  authenticate(req.body.loginForm, (error, data) => {
    if (error) {
      logger.error(`Произошла ошибка: ${error}`);
      return next(error);
    }
    if (!data) {
      res.error("Имя или пароль неверный");
      logger.error("Имя или пароль неверный");
      res.redirect("back");
    }
    req.session.userEmail = data.email;
    req.session.userName = data.name;
    logger.info("Пользователь вошёл в аккаунт");
    //jwt generation
    const jwtTime = process.env.JWTTIME;
    const token = jwt.sign(
      {
        name: data.email,
      },
      process.env.JWTTOKENSECRET,
      {
        expiresIn: jwtTime,
      }
    );
    // создание cookie для пользователя
    res.cookie("jwt", token, { httpOnly: true, maxAge: jwtTime });
    logger.info(`Создан новый токен для ${data.email}, Токен: ${token}`);
    return res.redirect("/");
  });
};

exports.logout = (req, res, next) => {
  res.clearCookie("jwt");
  res.clearCookie("connect.sid");
  logger.info("Пользователь вышел");
  req.session.destroy((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};
const User = require("../models/user");

const link = "https://kappa.lol/OFmCl";
const messanger = "https://kappa.lol/iSONv";
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
    User.findOneByEmail(email, (err, user) => { 
      if (err) {
        console.error("Ошибка при поиске пользователя:", err);
        return next(err);
      }
      if (user) {

        res.redirect("/index"); 
      } else {
        User.create(
          name,
          email,
          password,
          req.body.age,
          0, 
          req.body.recipientEmail, 
          (err) => {
            if (err) {
              console.error("Ошибка при создании пользователя:", err);
              return next(err);
            }
            req.session.userEmail = email;
            req.session.userName = name;
         
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
          
            res.redirect("/index"); 
          }
        );
      }
    });
  } catch (err) {
    console.error("Ошибка при регистрации пользователя:", err);
    return next(err);
  }
};

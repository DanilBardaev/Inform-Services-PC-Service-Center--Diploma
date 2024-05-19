const User = require("../models/user");
const validate = require("../middleware/validate");
const messanger = "https://kappa.lol/iSONv";

const link = "https://kappa.lol/OFmCl";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const sqlite3 = require('sqlite3').verbose();
require("dotenv").config();
const db = new sqlite3.Database("test.sqlite");
exports.form = (req, res) => {
  
  res.render("loginForm", { title: "Login", messanger: messanger, link: link });
};


async function authenticate(dataForm, cb) {
  try {
      const query = `SELECT * FROM users WHERE email = ?`;
      db.get(query, [dataForm.email], async (err, row) => {
          if (err) {
              return cb(err);
          }
          if (!row) {
              return cb(); 
          }
        
          const result = await bcrypt.compare(dataForm.password, row.password);
          if (result) {
           
              return cb(null, row);
          } else {
             
              return cb();
          }
      });
  } catch (err) {
      return cb(err);
  }
}

exports.submit = (req, res, next) => {
  authenticate(req.body.loginForm, (error, data) => {
    if (error) {
      return next(error);
    }
    if (!data) {
     
      req.flash("error", "Имя или пароль неверный");
      return res.redirect("/login");
    }
  
    req.login(data, (err) => {
      if (err) {
        return next(err);
      }
   
      req.session.userEmail = data.email;
     
      return res.redirect("/");
    });
  });
};



exports.logout = (req, res, next) => {
  res.clearCookie("jwt");
  res.clearCookie("connect.sid");
  req.session.destroy((err) => {
      if (err) return next(err);
      res.redirect("/");
  });
};

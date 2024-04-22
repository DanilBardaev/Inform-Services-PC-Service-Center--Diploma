const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("test.sqlite");
const bcrypt = require("bcrypt");

module.exports = async function (req, res, next) {
  try {
    if (req.session.userEmail) {
      const email = req.session.userEmail;
      const selectUserQuery = "SELECT * FROM users WHERE email = ?";
      db.get(selectUserQuery, [email], (err, userData) => {
        if (err) {
          console.error("Ошибка при поиске пользователя по email:", err);
          return next(err);
        }

        if (userData) {
          req.user = res.locals.user = userData;
          res.locals.admin = userData.isAdmin === 1 ? true : false;
        }
        next();
      });
    } else if (req.session.passport) {
      res.locals.user = req.session.passport.user;
      next();
    } else {
      next();
    }
  } catch (err) {
    return next(err);
  }
};

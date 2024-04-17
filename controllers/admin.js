const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/admin/users", (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect("/login");
  }
});

router.post("/admin/users/:id/delete", (req, res) => {
  if (!req.session.isAdmin) {
    return res.redirect("/login");
  }

  const userId = req.params.id;

  User.findByIdAndRemove(userId, (err) => {
    if (err) {
      logger.error(err);
      console.error(err);
      return res.status(500).send("Внутренняя ошибка сервера");
    }

    res.redirect("/admin/users");
  });
});

module.exports = router;

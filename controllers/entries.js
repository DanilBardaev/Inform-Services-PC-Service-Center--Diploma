const logger = require("../logger/index");
const Entry = require("../models/entry"); // Используем правильный путь для импорта
const multer = require("multer");
const link = "https://kappa.lol/OFmCl";
const messanger = "https://kappa.lol/iSONv";
const path = require("path");
const express = require("express");
const router = express.Router();

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

exports.delete = (req, res, next) => {
  const postId = req.params.id;
  Entry.deleteById(postId, (err) => { // Внесены исправления здесь
    if (err) return next(err);
    res.redirect("/");
  });
};

exports.list = async (req, res, next) => {
  try {
    Entry.selectAll((err, entries) => { // Внесены исправления здесь
      if (err) {
        return next(err);
      }
      res.render("entries", { title: "Entries", entries: entries, link: link });
    });
  } catch (err) {
    next(err);
  }
};

exports.form = (req, res, next) => {
  res.render("post", { title: "Post" });
};

exports.submit = async (req, res, next) => {
  try {
    console.log(req.body);
    const username = req.user ? req.user.name : null;
    const data = req.body.entry;
    const imagePath = req.file ? req.file.path : null;

    // Проверяем наличие адреса электронной почты получателя в данных запроса
    if (!data || !data.email) {
      console.error("Recipient email is missing or invalid.");
      return res.redirect("/entries");
    }

    // Используем email из данных запроса
    const recipientEmail = data.email;

    const entry = {
      username: username,
      title: data.title,
      content: data.content,
      imagePath: imagePath,
    };
    await Entry.create(entry);

    // Вызываем функцию sendNotificationEmail с recipientEmail
    Entry.sendNotificationEmail(username, data.title, recipientEmail);
    
    res.redirect("/entries");
  } catch (err) {
    return next(err);
  }
};




exports.updateForm = (req, res) => {
  const id = req.params.id;
  Entry.getEntryById(id, (err, entry) => { // Внесены исправления здесь
    if (err) {
      return res.redirect("/");
    }
    res.render("edit", {
      title: "Форма изменения поста",
      entry: entry,
      link: link,
      messanger: messanger,
    });
    logger.info("Зашли на страницу edit post");
  });
};

exports.updateSubmit = (req, res, next) => {
  const id = req.params.id;
  if (!req.body.entry) {
    return next(new Error("Entry data is missing"));
  }
  const updateInf = {
    title: req.body.entry.title,
    content: req.body.entry.content,
    imagePath: req.file ? req.file.path : req.body.entry.imagePath,
  };
  Entry.updateById(id, updateInf, (err) => { // Внесены исправления здесь
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

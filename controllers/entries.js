const logger = require("../logger/index");
const { Entry } = require("../models/db");
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
  Entry.delete(postId, (err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

exports.list = async (req, res, next) => {
  try {
    const entries = await Entry.findAll();
    res.render("entries", { title: "Entries", entries: entries, link: link });
  } catch (err) {
    next(err); // Передаем ошибку в следующий обработчик middleware
  }
};


exports.form = (req, res, next) => {
  res.render("post", { title: "Post" });
};

exports.submit = async (req, res, next) => {
  try {
    const username = req.user ? req.user.name : null;
    const data = req.body.entry;
    // if (!data.content) {
    //   throw new Error("Content is required");
    // }
    const imagePath = req.file ? req.file.path : null;
    const entry = {
      username: username,
      title: data.title,
      content: data.content,
      imagePath: imagePath,
    };
    await Entry.create(entry);
    res.redirect("/entries");
    // console.log(entry.imagePath);
  } catch (err) {
    return next(err);
  }
};

exports.updateForm = (req, res) => {
  const id = req.params.id;
  Entry.getEntryId(id, (err, entry) => {
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
  Entry.getEntryId(id, (err, entry) => {
    if (err) {
      return next(err);
    }
    if (!updateInf.imagePath) {
      updateInf.imagePath = entry.imagePath;
    }
    Entry.update(id, updateInf, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
};

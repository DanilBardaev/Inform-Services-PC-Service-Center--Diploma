const express = require("express");
const logger = require("../logger/index");

module.exports = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  logger.info("Работает клиент от Yandex");
  res.redirect("/login");
};

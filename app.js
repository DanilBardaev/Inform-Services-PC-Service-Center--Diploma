const express = require("express");
const favicon = require("express-favicon");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const session = require("express-session");

const messanger = "https://kappa.lol/iSONv";
const link = "https://kappa.lol/OFmCl";
const bodyParser = require("body-parser");

const passport = require("passport");
const passportFunction = require("./middleware/passport_jwt");
const passportFunctionYandex = require("./middleware/passport_yandex");
const passportFunctionGoogle = require("./middleware/passport_go");
const passportFunctionGitHub = require("./middleware/passport_github");
const passportFunctionVkontakte = require("./middleware/passport_vkontakte");

const winston = require("winston");
const app = express();
app.use(bodyParser.json());


app.use(bodyParser.urlencoded({ extended: true }));
const myRoutes = require("./routers/index_routers");
const userSession = require("./middleware/user_session");
const passportFunctionJWT = require("./middleware/passport_jwt");

require("dotenv").config;
const port = process.env.PORT || "3000";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const flash = require("connect-flash");
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "css")));
app.use(express.static(path.join(__dirname, "views")));
app.use("/uploads", express.static("uploads"));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
passportFunctionJWT(passport);
passportFunctionYandex(passport);
passportFunctionGoogle(passport);
passportFunctionGitHub(passport);
passportFunctionVkontakte(passport);
app.use(
  "/css/bootstrap.css",
  express.static(
    path.join(
      __dirname,
      "public/css/bootstrap-5.3.2/dist/css/bootstrap.min.css"
    )
  )
);
app.use(favicon(__dirname + "/image/logo-png.png"));
app.use(userSession);

app.use(myRoutes);

app.get("/", (req, res) => {
  res.render("registerForm.ejs", { link: link, messanger: messanger });
});



app.listen(port, async () => {
  // await sequelize.sync({force: true})
 
  console.log(`Сервер запущен на порту ` + port + " База данных синхронизирована");

});

if (app.get("env") != "development") {
} else {
}

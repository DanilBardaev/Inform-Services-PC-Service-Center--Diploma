const logger = require('../logger/index');
const { Sequelize, DataTypes } = require('sequelize');
require ("dotenv").config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'test.sqlite',
    logging: (msg) => {
        logger.info(msg);
    }
});

// Определение моделей

const Entry = sequelize.define("entries", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    imagePath: {
        type: DataTypes.STRING,
    },
    timestamp: {
        type: DataTypes.DATE, // Изменено на DATE
        defaultValue: Sequelize.NOW // Добавлено значение по умолчанию
    },
});

const User = sequelize.define("users", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isAdmin: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Добавлено значение по умолчанию
    },
});

// Синхронизация базы данных с определениями моделей
sequelize.sync()
  .then(() => {
    console.log('База данных синхронизирована');
  })
  .catch(err => {
    console.error('Ошибка синхронизации базы данных:', err);
  });

module.exports = {
    Entry, User, sequelize
};

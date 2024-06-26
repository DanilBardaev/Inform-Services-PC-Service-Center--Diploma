const User = require('../models/user');
const link = "https://kappa.lol/OFmCl";
exports.showProfile = async (req, res, next) => {
  try {
    const userId = req.user._id; // Предполагая, что у вас есть доступ к идентификатору пользователя
    const user = await User.findById(userId);

    // Предполагая, что статус заявки доступен в объекте пользователя
    const requestStatus = user.requestStatus;

    res.render('profile', { user, requestStatus, link: link, });
  } catch (err) {
    next(err);
  }
};

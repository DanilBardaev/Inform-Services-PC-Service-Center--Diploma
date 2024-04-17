const getField = (req, parsedField) => {
  if (req.body[parsedField[0]]) {
    value = req.body[parsedField[0]][parsedField[1]];
    return value;
  } else {
    return undefined;
  }
};

function parseField(field) {
  return field.split(/\[|\]/).filter((s) => s);
}
const flash = require('connect-flash');
const validate = (req, res, next) => {
  const errors = [];

  // Проверка наличия обязательных полей
  for (const field in requiredFields) {
    if (!req.body[field]) {
      errors.push(`Поле "${field}" обязательно для заполнения`);
    }
  }

  // Проверка длины полей
  for (const field in lengthFields) {
    if (req.body[field].length < lengthFields[field]) {
      errors.push(`Поле "${field}" должно быть не короче ${lengthFields[field]} символов`);
    }
  }

  // Проверка формата полей
  for (const field in formatFields) {
    if (!formatFields[field].test(req.body[field])) {
      errors.push(`Поле "${field}" должно соответствовать формату ${formatFields[field]}`);
    }
  }

  // Проверка уникальности полей
  for (const field in uniqueFields) {
    // Проверка уникальности поля в базе данных
    Entry.findOne({ [field]: req.body[field] })
      .then((entry) => {
        if (entry) {
          errors.push(`Поле "${field}" должно быть уникальным`);
        }
      });
  }

  // Если есть ошибки, сохраняем их в сессии и перенаправляем на предыдущую страницу
  if (errors.length > 0) {
    req.flash('error_msg', errors);
    return res.redirect("back");
  }

  // Если нет, перенаправляем на следующий middleware
  next();
};

exports.required = (field) => {
  let parsedField = parseField(field);
  return (req, res, next) => {
    if (getField(req, parsedField)) {
      next();
    } else {
      req.flash('error_msg', `Поле ${parsedField.join(" ")} не заполнено`);
      res.redirect("back");
    }
  };
};

exports.lengthAbove = (field, len) => {
  field = parseField(field);
  return (req, res, next) => {
    if (getField(req, field).length > len) {
      next();
    } else {
      req.flash('error_msg', `Поле ${field.join(" ")} должно быть более ${len} знаков`);
      res.redirect("back");
    }
  };
};

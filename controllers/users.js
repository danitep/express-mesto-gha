const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequest = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found-err');

// Обработка ошибок
function checkCreatingRequest(name, about, avatar, email, password) {
  if (!email || !password) {
    throw new BadRequest('Некорректные введённые данные');
  }
}
function checkSendining(user) {
  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }
}
function checkSendiningAllUsers(users) {
  if (!users[0]) {
    throw new NotFoundError('Пользователи не найдены');
  }
}
function sendData(res, data) {
  res.send(data);
}
function sendCreatedData(res, data) {
  const {
    name,
    about,
    avatar,
    email,
  } = data;
  res.status(201).send({
    name,
    about,
    avatar,
    email,
  });
}

function checkUpdatingRequest(body) {
  const { name, about, avatar } = body;
  if (!name && !about && !avatar) {
    throw new BadRequest('Некорректные введённые данные');
  }
}
function checkAvatarUpdatingRequest(body) {
  const { avatar } = body;
  if (!avatar) {
    const err = new Error('Некорректные введённые данные');
    err.name = 'Bad Request';
    err.status = 400;
    throw err;
  }
}

// Контроллеры
module.exports.createUser = (req, res, next) => {
  try {
    const {
      name,
      about,
      avatar,
      email,
      password,
    } = req.body;
    checkCreatingRequest(name, about, avatar, email, password);
    bcrypt.hash(req.body.password, 10)
      .then((hash) => User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      }))
      .then((user) => {
        checkSendining(user);
        sendCreatedData(res, user);
      })
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      checkSendining(user);
      sendData(res, user);
    })
    .catch((err) => next(err));
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      checkSendining(user);
      sendData(res, user);
    })
    .catch((err) => next(err));
};

module.exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      checkSendiningAllUsers(users);
      sendData(res, users);
    })
    .catch((err) => next(err));
};

module.exports.updatePorfile = (req, res, next) => {
  try {
    checkUpdatingRequest(req.body);
    User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    })
      .then((user) => {
        checkSendining(user);
        sendData(res, user);
      })
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
};

module.exports.updateAvatar = (req, res, next) => {
  try {
    checkAvatarUpdatingRequest(req.body);
    User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, {
      new: true,
      runValidators: true,
    })
      .then((user) => {
        checkSendining(user);
        sendData(res, user);
      })
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => next(err));
};

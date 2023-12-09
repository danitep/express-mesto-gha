const User = require('../models/user');

// Обработка ошибок
function checkCreatingRequest(name, about, avatar) {
  if (!name || !about || !avatar) {
    const err = new Error('Некорректные введённые данные');
    err.name = 'Bad Request';
    err.status = 400;
    throw err;
  }
}
function checkSendining(user) {
  if (!user) {
    const err = new Error('Пользователь не найден');
    err.name = 'NotFoundError';
    err.status = '404';
    throw err;
  }
}
function checkSendiningAllUsers(users) {
  if (!users[0]) {
    const err = new Error('Пользователи не найдены');
    err.name = 'NotFoundError';
    err.status = '404';
    throw err;
  }
}
function sendData(res, data) {
  res.send(data);
}
function sendError(res, err) {
  let { status, message } = err;
  if (err.name === 'CastError') {
    status = 400;
    message = 'Некорректные введённые данные';
  }
  if (!status) {
    status = 500;
  }
  res.status(status).send({ message });
}
function checkUpdatingRequest(body) {
  const { name, about, avatar } = body;
  if (!name && !about && !avatar) {
    const err = new Error('Некорректные введённые данные');
    err.name = 'Bad Request';
    err.status = 400;
    throw err;
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
module.exports.createUser = (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    checkCreatingRequest(name, about, avatar);
    User.create({ name, about, avatar })
      .then((user) => {
        checkSendining(user);
        sendData(res, user);
      })
      .catch((err) => sendError(res, err));
  } catch (err) {
    sendError(res, err);
  }
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      checkSendining(user);
      sendData(res, user);
    })
    .catch((err) => sendError(res, err));
};

module.exports.getAllUsers = (req, res) => {
  User.find({})
    .then((users) => {
      checkSendiningAllUsers(users);
      sendData(res, users);
    })
    .catch((err) => sendError(res, err));
};

module.exports.updatePorfile = (req, res) => {
  try {
    checkUpdatingRequest(req.body);
    User.findByIdAndUpdate(req.user._id, req.body, { new: true })
      .then((user) => {
        checkSendining(user);
        sendData(res, user);
      })
      .catch((err) => sendError(res, err));
  } catch (err) {
    sendError(res, err);
  }
};

module.exports.updateAvatar = (req, res) => {
  try {
    checkAvatarUpdatingRequest(req.body);
    User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: true })
      .then((user) => {
        checkSendining(user);
        sendData(res, user);
      })
      .catch((err) => sendError(res, err));
  } catch (err) {
    sendError(res, err);
  }
};

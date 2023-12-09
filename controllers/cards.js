const { isValidObjectId } = require('mongoose');
const Card = require('../models/card');

// Обработка ошибок
function checkCreatingRequest(name, link) {
  const err = new Error('Некорректные введённые данные (отсутствуют основные поля)');
  err.name = 'Bad Request';
  err.status = 400;
  if (!name || !link) {
    throw err;
  } else if (name.length < 2 || name.length > 30) {
    throw err;
  }
}
function checkSendining(card) {
  if (!card) {
    const err = new Error('Карточка не найдена');
    err.name = 'NotFoundError';
    err.status = '404';
    throw err;
  }
}
function checkSendiningAllCards(cards) {
  if (!cards[0]) {
    const err = new Error('Карточки не найдены');
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
    message = 'Некорректные введённые данные (ссылка или объект json)';
  }
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Некорректные введённые данные (значения параметров некорректны)';
  }
  if (!status) {
    status = 500;
  }
  res.status(status).send({ message });
}
function checkUpdatingRequest(req) {
  const { cardId } = req.params;
  if (!isValidObjectId(cardId)) {
    const err = new Error('Некорректные введённые данные(id карточки)');
    err.name = 'Bad Request';
    err.status = 400;
    throw err;
  }
}

// Контроллеры
module.exports.createCard = (req, res) => {
  try {
    const owner = req.user._id;
    const { name, link } = req.body;
    checkCreatingRequest(name, link);
    Card.create({ name, link, owner })
      .then((card) => {
        checkSendining(card);
        sendData(res, card);
      })
      .catch((err) => sendError(res, err));
  } catch (err) {
    sendError(res, err);
  }
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndDelete(req.params.cardId)
    .then((card) => {
      checkSendining(card);
      sendData(res, card);
    })
    .catch((err) => sendError(res, err));
};

module.exports.getAllCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      checkSendiningAllCards(cards);
      sendData(res, cards);
    })
    .catch((err) => sendError(res, err));
};

module.exports.likeCard = (req, res) => {
  try {
    checkUpdatingRequest(req);
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
      { new: true },
    )
      .then((card) => {
        checkSendining(card);
        sendData(res, card);
      })
      .catch((err) => sendError(res, err));
  } catch (err) {
    sendError(res, err);
  }
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      checkSendining(card);
      sendData(res, card);
    })
    .catch((err) => sendError(res, err));
};

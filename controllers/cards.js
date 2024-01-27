const { isValidObjectId } = require('mongoose');
const Card = require('../models/card');
const NotFound = require('../errors/not-found-err');
const BadRequest = require('../errors/bad-request');
const Forbidden = require('../errors/forbidden-err');

const { STATUS_CREATED } = process.env;

// Обработка ошибок
function checkCreatingRequest(name, link) {
  if (!name || !link) {
    throw new BadRequest('Некорректные введённые данные (отсутствуют основные поля)');
  } else if (name.length < 2 || name.length > 30) {
    throw new BadRequest('Некорректные введённые данные (отсутствуют основные поля)');
  }
}
function checkSendining(card) {
  if (!card) {
    throw new NotFound('Карточка не найдена');
  }
}
function checkSendiningAllCards(cards) {
  if (!cards[0]) {
    throw new NotFound('Карточки не найдены');
  }
}
function sendData(res, data) {
  res.send(data);
}
function sendCreatedData(res, data) {
  res.status(STATUS_CREATED).send(data);
}

function checkUpdatingRequest(req) {
  const { cardId } = req.params;
  if (!isValidObjectId(cardId)) {
    throw new BadRequest('Некорректные введённые данные(id карточки)');
  }
}

// Контроллеры
module.exports.createCard = (req, res, next) => {
  try {
    const owner = req.user._id;
    const { name, link } = req.body;
    checkCreatingRequest(name, link);
    Card.create({ name, link, owner })
      .then((card) => {
        checkSendining(card);
        sendCreatedData(res, card);
      })
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    // eslint-disable-next-line consistent-return
    .then((card) => {
      checkSendining(card);
      if (req.user._id !== card.owner.toHexString()) {
        throw new Forbidden('Разрешено удаление только собственных карточек');
      }
      Card.deleteOne(card)
        .then(() => {
          checkSendining(card);
          sendData(res, card);
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

module.exports.getAllCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      checkSendiningAllCards(cards);
      sendData(res, cards);
    })
    .catch((err) => next(err));
};

module.exports.likeCard = (req, res, next) => {
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
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      checkSendining(card);
      sendData(res, card);
    })
    .catch((err) => next(err));
};

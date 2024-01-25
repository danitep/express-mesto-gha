const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const NotFoundError = require('../errors/not-found-err');

const {
  createCard, getAllCards, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');
const { urlChecking } = require('../utils/urlChecking');

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    link: Joi.string().pattern(urlChecking),
  }),
}), createCard);

router.get('/', getAllCards);

router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24),
  }),
}), deleteCard);

router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24),
  }),
}), likeCard);

router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24),
  }),
}), dislikeCard);

router.all('/:any', () => {
  throw new NotFoundError('Неверный путь');
});

module.exports = router;

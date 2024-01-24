const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const NotFoundError = require('../errors/not-found-err');

const { urlChecking } = require('../utils/urlChecking');

const {
  getCurrentUser, getUserById, getAllUsers, updatePorfile, updateAvatar,
} = require('../controllers/users');

router.get('/me', getCurrentUser);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().length(24),
  }),
}), getUserById);

router.get('/', getAllUsers);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(urlChecking),
  }),
}), updatePorfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string(),
  }),
}), updateAvatar);

router.all('/:any', () => {
  throw new NotFoundError('Неверный путь');
});

module.exports = router;

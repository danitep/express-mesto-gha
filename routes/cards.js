const router = require('express').Router();

const {
  createCard, getCardById, getAllCards, likeCard, dislikeCard,
} = require('../controllers/cards');

router.post('/', createCard);
router.get('/:id', getCardById);
router.get('/', getAllCards);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);

module.exports = router;

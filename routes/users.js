const router = require('express').Router();

const {
  createUser, getUserById, getAllUsers, updatePorfile, updateAvatar,
} = require('../controllers/users');

router.post('/', createUser);
router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.patch('/me', updatePorfile);
router.patch('/me/avatar', updateAvatar);

module.exports = router;

const router = require('express').Router();
const {
  getUsers,
  getUser,
  updateUser,
  updateUserAvatar,
} = require('../controllers/users');
const auth = require('../middlewares/auth');

router.get('/', auth, getUsers);
router.get('/:userId', auth, getUser);
router.patch('/me', auth, updateUser);
router.patch('/me/avatar', auth, updateUserAvatar);

module.exports = router;

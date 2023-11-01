const router = require('express').Router();
const { celebrate, Joi, Segments } = require('celebrate');
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');
const auth = require('../middlewares/auth');

router.get('/', auth, getCards);

router.post(
  '/',
  auth,
  celebrate({
    body: Joi.object().keys({
      likes: Joi.array(),
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().uri().required(),
      owner: Joi.object().required(),
      createdAt: Joi.date(),
    }),
  }),
  createCard,
);

router.delete(
  '/:cardId',
  auth,
  celebrate({
    [Segments.PARAMS]: {
      cardId: Joi.string().hex().length(24).required(),
    },
  }),
  deleteCard,
);

router.put(
  '/:cardId/likes',
  auth,
  celebrate({
    [Segments.PARAMS]: {
      cardId: Joi.string().hex().length(24).required(),
    },
  }),
  likeCard,
);

router.delete(
  '/:cardId/likes',
  auth,
  celebrate({
    [Segments.PARAMS]: {
      cardId: Joi.string().hex().length(24).required(),
    },
  }),
  dislikeCard,
);

module.exports = router;

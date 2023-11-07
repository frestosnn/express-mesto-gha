const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require("../controllers/cards");
const auth = require("../middlewares/auth");

router.get("/", auth, getCards);

router.post(
  "/",
  auth,
  celebrate({
    body: Joi.object().keys({
      likes: Joi.array(),
      name: Joi.string().required().min(2).max(30),
      link: Joi.string()
        .uri()
        .required()
        .pattern(
          /(https?:\/\/)(w{3}\.)?(((\d{1,3}\.){3}\d{1,3})|((\w-?)+\.(ru|com)))(:\d{2,5})?((\/.+)+)?\/?#?/
        ),
      owner: Joi.object(),
      createdAt: Joi.date(),
    }),
  }),
  createCard
);

router.delete(
  "/:cardId",
  auth,
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24),
    }),
  }),
  deleteCard
);

router.put(
  "/:cardId/likes",
  auth,
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24),
    }),
  }),
  likeCard
);

router.delete(
  "/:cardId/likes",
  auth,
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24),
    }),
  }),
  dislikeCard
);

module.exports = router;

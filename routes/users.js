const router = require("express").Router();
const { celebrate, Joi, Segments } = require("celebrate");
const {
  getUsers,
  getUser,
  updateUser,
  updateUserAvatar,
  getOwner,
} = require("../controllers/users");
const auth = require("../middlewares/auth");

router.get("/", auth, getUsers);
router.get(
  "/:userId",
  auth,
  celebrate({
    [Segments.PARAMS]: {
      userId: Joi.string().hex().length(24).required(),
    },
  }),
  getUser
);
router.patch(
  "/me",
  auth,
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      about: Joi.string().min(2).max(30).required(),
    }),
  }),
  updateUser
);
router.patch(
  "/me/avatar",
  auth,
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().required(),
    }),
  }),
  updateUserAvatar
);
router.get("/me", auth, getOwner);

module.exports = router;

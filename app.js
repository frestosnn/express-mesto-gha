const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const { celebrate, Joi } = require("celebrate");
const { errors } = require("celebrate");
const { createUser, login } = require("./controllers/users");

const userRouter = require("./routes/users");
const cardRouter = require("./routes/cards");
require("dotenv").config();
const errorHandler = require("./middlewares/error-handler");
const PathError = require("./errors/path-errors");

const { PORT = 3000, DB_URL = "mongodb://127.0.0.1:27017/mestodb" } =
  process.env;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.disable("x-powered-by");

// через localhost не получается подключиться, первая ссылка с решением проблемы со StackOverflow
mongoose.connect(DB_URL);
app.post(
  "/signin",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  login
);

app.post(
  "/signup",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string()
        .uri()
        .pattern(
          /(https?:\/\/)(w{3}\.)?(((\d{1,3}\.){3}\d{1,3})|((\w-?)+\.(ru|com)))(:\d{2,5})?((\/.+)+)?\/?#?/
        ),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  createUser
);

app.use("/users", userRouter);
app.use("/cards", cardRouter);

// обработка ошибок celebrate
app.use(errors());

app.use(errorHandler);

app.use((req, res, next) => {
  const err = new PathError("Not Found: Маршрут не найден");
  next(err);
});

app.listen(PORT, () => {
  console.log(`App is listening ${PORT}`);
});

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const { celebrate, Joi } = require("celebrate");
const { errors } = require("celebrate");
const { createUser, login } = require("./controllers/users");

const userRouter = require("./routes/users");
const cardRouter = require("./routes/cards");
require("dotenv").config();

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
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
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
      avatar: Joi.string().uri(),
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  createUser
);

app.use("/users", userRouter);
app.use("/cards", cardRouter);

// обработка ошибок celebrate
app.use(errors());

app.use((req, res, next) => {
  const err = new Error("Not Found: Маршрут не найден");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status).send({ message: err.message });
  next();
});

app.listen(PORT, () => {
  console.log(`App is listening ${PORT}`);
});

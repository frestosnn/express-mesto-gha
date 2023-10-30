const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const { createUser, login } = require("./controllers/users");
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

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// создание для каждой карточки владельца с одним ID
app.use((req, res, next) => {
  req.user = {
    _id: "6526724bbf06121c53305df4",
  };

  next();
});

app.post("/signin", login);
app.post("/signup", createUser);

app.use("/users", require("./routes/users"));
app.use("/cards", require("./routes/cards"));

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

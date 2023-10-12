const express = require("express");
const mongoose = require("mongoose");

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//через localhost не получается подключиться, первая ссылка с решением проблемы со StackOverflow
mongoose.connect("mongodb://127.0.0.1:27017/mestodb");

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

//создание для каждой карточки владельца с одним ID
app.use((req, res, next) => {
  req.user = {
    _id: "6526724bbf06121c53305df4",
  };

  next();
});

app.use("/users", require("./routes/users.js"));
app.use("/cards", require("./routes/cards.js"));

//обработка неправильных путей
app.use((req, res) => {
  res.status(404).send("Обработка неправильного пути");
});

app.listen(PORT, () => {
  console.log(`App is listening ${PORT}`);
});

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//через localhost не получается подключиться, первая ссылка с решением проблемы со StackOverflow
mongoose.connect("mongodb://127.0.0.1:27017/mestodb");

app.use((req, res, next) => {
  req.user = {
    _id: "6526724bbf06121c53305df4",
  };

  next();
});

app.use("/users", require("./routes/users.js"));
app.use("/cards", require("./routes/cards.js"));

app.listen(PORT, () => {
  console.log(`App is listening ${PORT}`);
});

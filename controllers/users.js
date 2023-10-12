const User = require("../models/user");

const handleErrors = (err, res) => {
  if (err.name === "ValidationError") {
    return res.status(400).send({ message: "Переданы некорректные данные." });
  } else {
    return res.status(500).send({ message: "Произошла ошибка" });
  }
};

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => handleErrors(err, res));
};

module.exports.createUser = (req, res) => {
  const { name, about } = req.body;

  User.create({ name, about })
    .then((user) => res.send(user))
    .catch((err) => handleErrors(err, res));
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.userId)

    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "Пользователь не найден" });
      }
      res.send(user);
    })
    .catch((err) => handleErrors(err, res));
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  const owner = req.user._id;

  User.findByIdAndUpdate(owner, { name: name, about: about })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "Пользователь не найден" });
      }
      res.send(user);
    })
    .catch((err) => handleErrors(err, res));
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  const owner = req.user._id;

  User.findByIdAndUpdate(owner, { avatar: avatar })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "Пользователь не найден" });
      }
      res.send(user);
    })
    .catch((err) => handleErrors(err, res));
};

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const { JWT_SECRET = "secret" } = process.env;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(() =>
      res.status(500).send({ message: "На сервере произошла ошибка" })
    );
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar, email, password } = req.body;

  // хэшируем пароль
  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        email,
        password: hash,
        name,
        about,
        avatar,
      })
    )
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при создании пользователя.",
        });
      }
      if (err.code === 11000) {
        return res
          .status(409)
          .send({ message: "Такой пользователь уже создан" });
      }
      return res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error("InvalidId"))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(400).send({ message: "Invalid ID" });
      }
      if (err.message === "InvalidId") {
        res
          .status(404)
          .send({ message: "Пользователь по указанному _id не найден." });
      }
      return res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

module.exports.updateUser = (req, res) => {
  const owner = req.user._id;

  User.findByIdAndUpdate(
    owner,
    { name: req.body.name, about: req.body.about },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(new Error("InvalidId"))
    .then((user) => {
      res.status(200).send(user);
    })

    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при обновлении профиля.",
        });
      }
      if (err.message === "InvalidId") {
        res
          .status(404)
          .send({ message: "Пользователь по указанному _id не найден." });
      }
      return res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const owner = req.user._id;

  User.findByIdAndUpdate(
    owner,
    { avatar: req.body.avatar },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(new Error("InvalidId"))
    .then((user) => {
      res.status(200).send(user);
    })

    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).send({
          message: "Переданы некорректные данные при обновлении аватара. ",
        });
      }
      if (err.message === "InvalidId") {
        res
          .status(404)
          .send({ message: "Пользователь по указанному _id не найден." });
      }
      return res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

module.exports.getOwner = (req, res) => {
  const currentUser = req.user;
  if (currentUser) {
    return res.status(200).send(currentUser);
  }
  return res.status(500).send({ message: "На сервере произошла ошибка" });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Email или пароль не заполнены" });
  }

  return User.findOne({ email })
    .select("+password")
    .orFail(new Error("InvalidData"))
    .then((user) => {
      bcrypt.compare(password, user.password, (err, matched) => {
        if (!matched) {
          return res
            .status(401)
            .send({ message: "Пароль или email не верный" });
        }

        // генерируем токен пользователя
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });

        // отдаем пользователю токен
        return res.status(200).send({ token });
      });
    })
    .catch((err) => {
      if (err.message === "InvalidData") {
        return res
          .status(401)
          .send({ message: "Такого пользователя не существует" });
      }

      return res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

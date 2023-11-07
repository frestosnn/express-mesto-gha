const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const UnauthorizedError = require("../errors/unauthorized-errors");
const ValidationError = require("../errors/validation-errors");

const { JWT_SECRET = "secret" } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(() => {
      if (err.name === "UnauthorizedError") {
        return next(new UnauthorizedError("У  вас нет прав доступа"));
      }
      res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

module.exports.createUser = (req, res, next) => {
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
    .then((user) => {
      const updatedUser = { ...user.toObject() };
      updatedUser.password = undefined;
      res.status(201).send(updatedUser);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(
          new ValidationError(
            "Переданы некорректные данные при создании пользователя."
          )
        );
      }
      if (err.code === 11000) {
        return res
          .status(409)
          .send({ message: "Такой пользователь уже создан" });
      }
      return res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error("InvalidId"))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new ValidationError("Неправильный ID"));
      }

      if (err.message === "InvalidId") {
        res
          .status(404)
          .send({ message: "Пользователь по указанному _id не найден." });
      }
      return res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

module.exports.updateUser = (req, res, next) => {
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
        next(
          new ValidationError(
            "Переданы некорректные данные при обновлении профиля."
          )
        );
      }

      if (err.message === "InvalidId") {
        res
          .status(404)
          .send({ message: "Пользователь по указанному _id не найден." });
      }
      return res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

module.exports.updateUserAvatar = (req, res, next) => {
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
        return next(
          new ValidationError(
            "Переданы некорректные данные при обновлении аватара."
          )
        );
      }

      if (err.message === "InvalidId") {
        res
          .status(404)
          .send({ message: "Пользователь по указанному _id не найден." });
      }
      return res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

module.exports.getOwner = (req, res, next) => {
  const currentUser = req.user._id;
  User.findById(currentUser)
    .orFail(new Error("InvalidId"))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new ValidationError("Неправильный ID"));
      }
      if (err.message === "InvalidId") {
        res
          .status(404)
          .send({ message: "Пользователь по указанному _id не найден." });
      }
      return res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ValidationError("Email или пароль не заполнены"));
  }

  return User.findOne({ email })
    .select("+password")
    .then((user) => {
      bcrypt.compare(password, user.password, (err, matched) => {
        if (!matched) {
          return next(new UnauthorizedError("Пароль или email не верный"));
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
      if (err instanceof UnauthorizedError) {
        return next(new UnauthorizedError("Такого пользователя не существует"));
      }

      return res.status(500).send({ message: "На сервере произошла ошибка" });
    });
};

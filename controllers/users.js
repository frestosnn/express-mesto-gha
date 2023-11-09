const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UnauthorizedError = require('../errors/unauthorized-errors');
const ValidationError = require('../errors/validation-errors');
const PathError = require('../errors/path-errors');
const BdError = require('../errors/bd-errors');

const { JWT_SECRET = 'secret' } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => next(err));
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  // хэшируем пароль
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((user) => {
      const updatedUser = { ...user.toObject() };
      updatedUser.password = undefined;
      res.status(201).send(updatedUser);
    })

    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError(
            'Переданы некорректные данные при создании пользователя.',
          ),
        );
      }

      if (err.code === 11000) {
        return next(new BdError('Такой пользователь уже создан'));
      }

      return next(err);
    });
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new PathError('Пользователь по указанному _id не найден.'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Неправильный ID'));
      }

      return next(err);
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
    },
  )
    .orFail(new PathError('Пользователь по указанному _id не найден.'))

    .then((user) => {
      res.status(200).send(user);
    })

    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(
          new ValidationError(
            'Переданы некорректные данные при обновлении профиля.',
          ),
        );
      }

      return next(err);
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
    },
  )
    .orFail(new PathError('Пользователь по указанному _id не найден.'))

    .then((user) => {
      res.status(200).send(user);
    })

    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError(
            'Переданы некорректные данные при обновлении аватара.',
          ),
        );
      }

      return next(err);
    });
};

module.exports.getOwner = (req, res, next) => {
  const currentUser = req.user._id;
  User.findById(currentUser)
    .orFail(new PathError('Пользователь по указанному _id не найден.'))

    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => next(err));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedError('Такого пользователя не существует'));
      }
      return user;
    })

    .then((user) => {
      bcrypt.compare(password, user.password, (err, matched) => {
        if (!matched) {
          return next(new UnauthorizedError('Пароль или email не верный'));
        }

        // генерируем токен пользователя
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: '7d',
        });

        // отдаем пользователю токен
        return res.status(200).send({ token });
      });
    })
    .catch((err) => next(err));
};

const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({
          message: 'Переданы некорректные данные при создании пользователя.',
        });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('InvalidId'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Invalid ID' });
      }
      if (err.message === 'InvalidId') {
        res
          .status(404)
          .send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
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
    },
  )
    .orFail(new Error('InvalidId'))
    .then((user) => {
      res.status(200).send(user);
    })

    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({
          message: 'Переданы некорректные данные при обновлении профиля.',
        });
      }
      if (err.message === 'InvalidId') {
        res
          .status(404)
          .send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
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
    },
  )
    .orFail(new Error('InvalidId'))
    .then((user) => {
      res.status(200).send(user);
    })

    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({
          message: 'Переданы некорректные данные при обновлении аватара. ',
        });
      }
      if (err.message === 'InvalidId') {
        res
          .status(404)
          .send({ message: 'Пользователь по указанному _id не найден.' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

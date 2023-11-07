const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({
          message: 'Переданы некорректные данные при создании карточки.',
        });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.deleteCard = (req, res) => {
  const userId = req.user._id;
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .orFail(new Error('InvalidId'))
    .then((card) => {
      if (card.owner.toString() !== userId.toString()) {
        return res.status(403).send({ message: 'Отсутствуют права' });
      }
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).send({
          message: 'Переданы некорректные данные при обновлении профиля.',
        });
      }
      if (err.message === 'InvalidId') {
        res
          .status(404)
          .send({ message: 'Карточка по указанному _id не найдена.' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('InvalidId'))
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).send({
          message: 'Переданы некорректные данные для постановки лайка',
        });
      }

      if (err.message === 'InvalidId') {
        res
          .status(404)
          .send({ message: 'Карточка по указанному _id не найдена.' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,

    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('InvalidId'))
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res
          .status(400)
          .send({ message: 'Переданы некорректные данные для снятия лайка' });
      }
      if (err.message === 'InvalidId') {
        res
          .status(404)
          .send({ message: 'Карточка по указанному _id не найдена.' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

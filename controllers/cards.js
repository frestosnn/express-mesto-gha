const Card = require("../models/card");

const handleErrors = (err, res) => {
  if (err.name === "ValidationError") {
    return res.status(400).send({ message: "Переданы некорректные данные." });
  } else {
    return res.status(500).send({ message: "Произошла ошибка" });
  }
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => handleErrors(err, res));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => handleErrors(err, res));
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: "Пользователь не найден" });
        return;
      }

      res.send(card);
    })
    .catch((err) => handleErrors(err, res));
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: "Пользователь не найден" });
        return;
      }

      res.send(card);
    })
    .catch((err) => handleErrors(err, res));
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,

    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: "Пользователь не найден" });
        return;
      }

      res.send(card);
    })
    .catch((err) => handleErrors(err, res));
};

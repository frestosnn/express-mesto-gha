const ValidationError = require('../errors/validation-errors');
const PathError = require('../errors/path-errors');
const Card = require('../models/card');
const RightsError = require('../errors/rights-errors');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError(
            'Переданы некорректные данные при создании карточки',
          ),
        );
      }
      return next(err);
    });
};

// в постмане карточки другого пользователя не удаляются + в автотестах тоже
module.exports.deleteCard = (req, res, next) => {
  const userId = req.user._id;
  const { cardId } = req.params;

  // сначала ищем карточку и владельца
  Card.findById(cardId)
    .orFail(new PathError('Карточка по указанному _id не найдена.'))
    .then((card) => {
      if (card.owner.toString() !== userId.toString()) {
        return next(new RightsError('Отсутствуют права'));
      }

      // если нашли, то удаляем
      return Card.findByIdAndRemove(cardId)
        .then(() => {
          res.status(200).send(card);
        })
        .catch((err) => next(err));
    })

    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new ValidationError(
            'Переданы некорректные данные для удаления карточки.',
          ),
        );
      }

      return next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new PathError('Карточка по указанному _id не найдена.'))
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new ValidationError(
            'Переданы некорректные данные для постановки лайка',
          ),
        );
      }

      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,

    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new PathError('Карточка по указанному _id не найдена.'))
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new ValidationError('Переданы некорректные данные для снятия лайка'),
        );
      }

      return next(err);
    });
};

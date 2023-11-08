const ValidationError = require('../errors/validation-errors');
const PathError = require('../errors/path-errors');
const Card = require('../models/card');

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

module.exports.deleteCard = (req, res, next) => {
  const userId = req.user._id;
  const { cardId } = req.params;

  // сначала ищем карточку и владельца
  Card.findById(cardId)
    .then((card) => {
      if (card.owner.toString() !== userId.toString()) {
        return res.status(403).send({ message: 'Отсутствуют права' });
      }

      // если нашли, то удаляем
      return Card.findByIdAndRemove(cardId)
        .orFail(new PathError())
        .then(() => {
          res.status(200).send(card);
        })
        .catch((err) => {
          if (err instanceof PathError) {
            return next(
              new PathError('Карточка по указанному _id не найдена.'),
            );
          }

          return next(err);
        });
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
    .orFail(new PathError())
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

      if (err instanceof PathError) {
        return next(new PathError('Карточка по указанному _id не найдена.'));
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
    .orFail(new PathError())
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(
          new ValidationError('Переданы некорректные данные для снятия лайка'),
        );
      }

      if (err instanceof PathError) {
        return next(new PathError('Карточка по указанному _id не найдена.'));
      }

      return next(err);
    });
};

const User = require("../models/user");

module.exports.getUsers = (req, res) => {
  User.find({})
  .then(users => res.send(users))
  .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.createUser = (req, res) => {
  const { name, about } = req.body;

  User.create({ name, about })
    .then(user => {
      res.send(user);
    })
    .catch(err => {
      console.error('Ошибка при создании пользователя:', err);
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.userId)
  .then(user => res.send(user))
  .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
}
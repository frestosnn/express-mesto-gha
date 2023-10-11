const router = require("express").Router(); // создали роутер
const { getCards, createCard, deleteCard } = require("../controllers/cards");

router.get("/", getCards);
router.post("/", createCard);
router.delete("/:cardId", deleteCard);

module.exports = router;

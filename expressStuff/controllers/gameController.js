// this middleware is responsible for initaiting the game
module.exports.playGame = (req, res) => {
  // render ing the game page automatically, starts the cleint
  res.status(200).render("gameTemplate");
};

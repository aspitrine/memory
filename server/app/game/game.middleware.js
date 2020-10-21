const models = require('../../models')

/**
 * Récupère les games et les retournes dans le router
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const getAllGames = async (req, res) => {
  try {
    const games = await models.Game.findAll();
    res.send(games);
  } catch (e) {
    res.status(500).send({
      error: "Erreur durant la récupération des jeux",
    });
  }
}

/**
 * Sauvegarde la partie envoyée depuis le front et retourne l'objet de la BDD créé
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const createGame = async (req, res) => {
  const reqData = req.body;

  try {
    const game = await models.Game.create(reqData);
    res.send(game);
  } catch (e) {
    res.status(500).send({
      error: "Erreur durant la sauvegarde du jeu",
    });
  }
}

module.exports = {
  getAllGames,
  createGame
}
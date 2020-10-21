const {getAllGames, createGame} = require('./game.middleware');

/**
 * Contient la définition des routes de notre jeu
 * @param router
 */
module.exports = (router) => {
  router.get('/api/game', getAllGames);
  router.post('/api/game', createGame);
}
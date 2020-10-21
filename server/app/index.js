const {getAllFiles} = require('../utils/file')

/**
 * Inclut toutes les routes définies dans les fichiers .route.js depuis ce dossier en passant le router en paramètre
 * @param router
 */
module.exports = (router) => {
  const files = getAllFiles(__dirname, '.route.js')
  for(const file of files) {
    require(file)(router)
  }
}
const {readdirSync, statSync} = require('fs');
const {join} = require('path');

/**
 * Retourne la liste des fichiers contenus dans le path de manière récursive
 * Possibilité de filtre sur le nom du fichier
 * @param path
 * @param filter
 * @param result
 * @returns {*[]}
 */
const getAllFiles = (path, filter = '', result = []) => {
  for(let f of readdirSync(path)) {
    const currentPath = join(path, f);

    if(statSync(currentPath).isDirectory()) {
      result = getAllFiles(currentPath, filter, result);
    } else if(currentPath.indexOf(filter) !== -1) {
      result.push(currentPath);
    }
  }

  return result;
};

module.exports = {
  getAllFiles
}
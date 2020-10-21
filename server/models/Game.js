const { Model } = require('sequelize');

/**
 * Définition de notre class Game avec ses propriétés
 * Va nous permettre d'intéragir avec la BDD
 * @type {Game}
 */
module.exports = class Game extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        time: DataTypes.INTEGER,
        isWin: DataTypes.BOOLEAN
      },
      {
        sequelize
      },
    );
  }
}
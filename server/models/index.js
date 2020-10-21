const Sequelize = require('sequelize');
const {getAllFiles} = require('../utils/file')
const {MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST} = process.env;

// Connexion à la BDD avec les variables d'environnement
const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  dialect: 'mysql'
});

// Récupère les models et lance l'initialisation des propriétés
const models = getAllFiles(__dirname, '.js')
  .filter(f => f !== __filename)
  .reduce((models, file) => {
    const model = require(file);
    models[model.name] = model.init(sequelize, Sequelize);
    return models
  }, {});

// Ajoute les associations pour chaque model
Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(modelName => models[modelName].associate(models));

module.exports = {
  ...models,
  sequelize,
  Sequelize
};

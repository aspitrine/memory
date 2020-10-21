const express = require('express');
const { resolve } = require("path");
const app = express();
const port = process.env.APP_PORT || 3000;
const publicDir = resolve(__dirname, './public/');
const router = express.Router();
const models = require('./models');

// définit les routes du dossier app dans le router
require('./app')(router);

(async () => {
  // Parse les données envoyées en post pour les récupérer dans le req.body
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // set toutes les url de notre router dans l'application express
  app.use(router);

  // Rend tous les fichiers situés dans le dossier "public"
  app.use(express.static(publicDir));

  // Lance le serveur sur le port spécifié
  app.listen(port, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`app started on port ${port}`);
    }
  });

  try {
    // Synchronisation des models sequelize et la BDD
    await models.sequelize.sync();
  } catch (e) {
    console.log('e', e);
  }
})();
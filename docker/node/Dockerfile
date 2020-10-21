# Image de base du docker
FROM node:14

# Copy du script permettant d'attendre la disponbilité d'un service
COPY ./docker/node/wait-for-it.sh /usr/bin/wait-for-it
RUN chmod +x /usr/bin/wait-for-it

# Définition du dossier de travail
WORKDIR /usr/src/app

# Copy du package json (avec le lock) pour installer les dépendances nodejs
COPY ./server/package*.json ./

RUN npm install --only=prod

# Copy du projet dans le workdir du docker
COPY ./server .

# Build du scss en css
RUN npm run scss

# Commande lancer au docker up, wait for it permet d'attendre que la BDD est prête
CMD wait-for-it -t 0 memory_database:3306 -- npm run start
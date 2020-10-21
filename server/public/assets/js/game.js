/**
 * Utilisation d'une fonction anonyme pour passer les dépendances dont nous avons besoin
 */
(($, Timer, Modal) => {
  /**
   * Classe qui va initialiser et lancer notre jeu memory
   */
  return new class Game {
    // Initialisation des "constantes"
    NB_CARDS = 10;
    TIME = 60 * 2; // 2 Minutes
    TIME_BEFORE_HIDE_CARD = 500; // En milliseconde

    // Initilisation des propriétés du jeu
    board = [];
    disabled = false;
    $game = $('.game__grid');
    $gameDashboard = $('.game__dashboard');
    $lastClickedCard = null;
    timer = new Timer(this.TIME, {
      onTimeOut: this.onLose.bind(this)
    });

    /**
     * Appeler à l'instanciation de notre classe
     */
    constructor() {
      // On attend que notre DOM soit totalement généré avant de lancer le jeu
      $(document).ready(this.init.bind(this))
    }

    /**
     * Méthode lançant l'initialisation de notre jeu avant le rendu dans le DOM
     */
    init() {
      this.initObserver();
      this.showLastGames();
    }

    /**
     * Méthode lançant l'initalisation de tous nos observers pour gérer le jeu
     */
    initObserver() {
      this.$game.on('click', '.game__grid-item', this.onClickItem.bind(this));
      this.$game.on('click', '.game__start', this.startGame.bind(this));
    }

    /**
     * Méthode appelée au click sur un élément de notre tableau
     * Gère l'affichage des cartes, le cas de victoire et de défaite
     * @param e event
     * @returns {Promise<void>}
     */
    async onClickItem(e) {
      // On récupère l'élément sur lequel on a cliqué
      const $clickedElm = $(e.currentTarget);
      // On appelle la méthode permettant de récupérer les informations sur l'élément cliqué
      const card = this.getClickedElementData($clickedElm, true);

      // On ne fait rien si le jeu est "désactivé" ou si la carte est déjà affichée
      if(this.disabled || card.show) {
        return;
      }

      // On affiche la carte
      this.toggleCard($clickedElm, true);

      // Si on à déjà cliqué sur une carte précédemment
      if(this.$lastClickedCard) {
        const lastClickedCard = this.getClickedElementData(this.$lastClickedCard);

        // Carte différente de la première
        if(card.number !== lastClickedCard.number) {
          // Méthode permettant de laisser un temps d'arrêt avant de retourner les cartes
          await this.toggleDisabled();

          // On cache les deux dernières cartes sur lesquelles on à cliqué
          this.toggleCard(this.$lastClickedCard, false);
          this.toggleCard($clickedElm, false);
        } else if(this.isWin()) {
          // Si toutes les cartes sont retournées on gagne
          this.onWin();
        }

        // On enlève la sauvegarde de la carte précédemment retournée
        this.$lastClickedCard = null;
      } else {
        // Sinon on sauvegarde la carte sur laquelle on a cliqué
        this.$lastClickedCard = $clickedElm;
      }
    }

    /**
     * Construction de notre plateau de jeu et affichage dans le DOM
     */
    startGame() {
      this.board = this.getBoardData();
      const boardHtml = this.getBoardHtml(this.board);
      this.$game.html(boardHtml);
      this.timer.start();
      this.$gameDashboard.hide();
    }

    /**
     * Si toutes les cartes du board son affichées retournent true
     * @returns boolean
     */
    isWin() {
      return this.board.reduce((result, card) => result ? card.show : result, true);
    }

    /**
     * Méthode appelée en cas de victoire
     * Va afficher le message de réussite
     */
    onWin() {
      const endedIn = this.timer.stop();
      this.saveGame({time: endedIn, isWin: true});
      new Modal(`Vous avez gagné en ${parseInt(endedIn / 1000)} secondes`, {
        onClose: this.showLastGames.bind(this)
      });
    }

    /**
     * Méthode appelée en cas de défaite
     * Va afficher le message d'échec
     */
    onLose(time) {
      this.disabled = true;
      new Modal(`Vous avez perdu ='(`, {
        onClose: this.showLastGames.bind(this)
      });
      this.saveGame({
        time,
        isWin: false
      })
    }

    /**
     * Retourne les données de la carte en fonction de l'élément
     * @param $elm jQuery element
     * @returns {number, show}
     */
    getClickedElementData($elm) {
      return this.board[$elm.index()];
    }

    /**
     * Retourne un tableau de jeu mélangé
     * Possibilité de gérer le nombre de cartes affichées
     * @param nbCard number
     * @returns {Array}
     */
    getBoardData(nbCard = this.NB_CARDS) {
      let board = [];

      // Ajoute dans le board deux nombres pour chaque carte afin de faire l'association
      for(let cardNumber = 0; cardNumber < nbCard; cardNumber++) {
        board.push({
          show: false,
          number: cardNumber
        }, {
          show: false,
          number: cardNumber
        })
      }

      // Mélange du tableau
      board = shuffle(board);
      return board;
    }

    /**
     * Affiche ou cache la carte en fonction du paramètre open
     * Met également à jour le tableau de jeu "board"
     * @param $elm jQuery element
     * @param open bool
     * @returns {number, show}
     */
    toggleCard($elm, open) {
      const card = this.getClickedElementData($elm);
      card.show = open;
      $elm.html(this.getCardItemHtml(card));
      return card;
    }

    /**
     * Désactive notre jeu durant TIME_BEFORE_HIDE_CARD avec une promise
     * La promise permet de savoir quand l'action est finie
     * @returns {Promise}
     */
    toggleDisabled() {
      return new Promise(resolve => {
        this.disabled = true;
        setTimeout(() => {
          this.disabled = false;
          resolve()
        }, this.TIME_BEFORE_HIDE_CARD)
      });
    }

    /**
     * Appelle le serveur pour sauvegarder la partie
     * @param time number
     * @param isWin boolean
     */
    saveGame({time = 0, isWin = false}) {
      $.ajax({
        url: '/api/game',
        method: 'POST',
        data: {
          time,
          isWin
        }
      })
    }

    /**
     * Affiche le dashboard et lance la récupération des dernières parties
     * Supprime le timer si il est présent
     */
    showLastGames() {
      this.$game.html(this.getBtnStartHtml());
      this.timer.removeTimer();
      this.$gameDashboard.show();

      $.ajax({
        url: '/api/game',
        method: 'GET',
        success: this.onSuccessGetLastGames.bind(this)
      })
    }

    /**
     * Formate et affiche les dernières parties
     * @param games
     */
    onSuccessGetLastGames(games) {
      const $gamesDashboard = $(this.getLastGameDashboardHtml(games));
      $('.game__dashboard-table-body').html($gamesDashboard)
    }

    /**
     * Génère le contenu du tableau depuis les games
     * @param games
     * @returns {string}
     */
    getLastGameDashboardHtml(games) {
      let html = '';

      for(const game of games) {
        const timeInSecond = parseInt(game.time / 1000)
        html += `<tr class="game__dashboard-table-body-line">
          <td>${timeInSecond} seconde${timeInSecond > 1 ? 's' : ''}</td>
          <td>${game.isWin ? 'Gagnée' : 'Perdu'}</td>
          <td>${(new Date(game.createdAt).toLocaleDateString())}</td>
        </tr>`
      }

      return html;
    }

    /**
     * retourne le html de notre carte en fonction de son état
     * @param card
     * @returns {string}
     */
    getCardItemHtml(card) {
      let htmlCard = '<div class="game__card">';

      if(card.show) {
        htmlCard += `<img alt="card" src="/assets/images/${card.number}.png" class="game__card-image"/>`;
      } else {
        htmlCard += '<div class="game__card-hidden">?</div>';
      }

      htmlCard += '</div>';

      return htmlCard;
    }

    /**
     * retourne le html de notre jeu
     * utilisée à son initialisation
     * @param board
     * @returns {string}
     */
    getBoardHtml(board = this.board) {
      let htmlBoard = '';
      for(const item of board) {
        htmlBoard += `<div class="game__grid-item">${this.getCardItemHtml(item)}</div>`
      }
      return htmlBoard
    }

    getBtnStartHtml() {
      return '<button class="game__start">Lancer la partie</button>';
    }
  }
})(jQuery, Timer, Modal)
const Timer = (($) => {
  return class Timer {
    timerInterval = null;

    /**
     * Définition des propriétés du timer
     * @param duration
     * @param options
     */
    constructor(duration, options = {
      onTimeOut: null
    }) {
      this.duration = duration * 1000;
      this.onTimeOut = options.onTimeOut;
    }

    /**
     * Lance le timer
     */
    start() {
      this.startTime = (new Date()).getTime();
      this.renderTime();

      // Déclanche l'intervalle mettant à jour l'affichage du timer
      this.timerInterval = setInterval(() => {
        if(this.isEnded()) {
          this.onTimerEnd();
        }
        this.renderTime();
      }, 500)
    }

    /**
     * Retourne true si le timer est fini
     * @returns {boolean}
     */
    isEnded() {
      return this.getCurrentTimeSpent() > this.duration;
    }

    /**
     * Arrête le timer et retourne le temps passé (en milliseconde)
     * @returns number
     */
    stop() {
      clearInterval(this.timerInterval);
      return this.getCurrentTimeSpent();
    }

    /**
     * Retourne le temps passé depuis le début du timer
     * @returns {number}
     */
    getCurrentTimeSpent() {
      const now = (new Date()).getTime();
      return now - this.startTime;
    }

    /**
     * Affiche la barre de progression
     */
    renderTime() {
      const timeSpent = this.getCurrentTimeSpent();
      const percentTimer = 100 - (timeSpent / this.duration) * 100;

      if(!this.$timer) {
        this.$timer = $(this.getTimerHtml());
        $('body').append(this.$timer);
      }
      this.$timer.children().first().width(`${percentTimer}%`);
    }

    /**
     * Quand le timer se termine, on arrête l'intervalle et on appelle la callback onTimeOut passée en paramètre
     */
    onTimerEnd() {
      clearInterval(this.timerInterval);
      if(this.onTimeOut) {
        const timeSpent = this.getCurrentTimeSpent();
        this.onTimeOut(timeSpent);
      }
    }

    /**
     * Retourne le html du timer
     * @returns {string}
     */
    getTimerHtml() {
      return `<div class="timer">
        <div class="timer__time"></div>
      </div>`;
    }

    /**
     * Retire le timer du DOM si il existe
     */
    removeTimer() {
      if(this.$timer) {
        this.$timer.remove();
        this.$timer = null;
      }
    }
  }
})($)
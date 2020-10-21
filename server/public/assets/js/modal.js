const Modal = (($) => {
  return class Modal {
    $body = $('body');

    /**
     * Définition des propriétés de la modal
     * @param {*} content 
     * @param {*} param1 
     */
    constructor(content = '', {
      onClose = null
    }) {
      this.content = content;
      this.onClose = onClose

      $(document).ready(this.init.bind(this));
    }

    /**
     * Initialisation de nos variables et ajout de la modal dans le dom
     */
    init() {
      this.$modal = $(this.getHtml(this.content))
      this.$body.append(this.$modal);
      this.initObserver();
    }

    /**
     * Initialisation des écouteurs d'événements
     */
    initObserver() {
      // Quand on clique sur le bouton de fermeture de la modal
      this.$modal.on('click', '.modal__close', this.close.bind(this));
    }

    /**
     * Ferme la modal (la supprime du dom)
     */
    close() {
      if(this.onClose) {
        this.onClose();
      }
      this.$modal.remove();
    }

    /**
     * Retourne le html de notre modal avec le contenu
     * @param content
     * @returns {string}
     */
    getHtml(content = '') {
      return `<div class="modal__mask">
        <div class="modal__wrapper">
          <div class="modal__container">
            <div class="modal__body">
              ${content}
            </div>
            <div class="modal__footer">
              <button class="modal__button modal__close">Ok</button>
            </div>
          </div>
        </div>
      </div>`;
    }
  }
})(jQuery)
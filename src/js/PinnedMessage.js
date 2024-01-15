export default class PinnedMessage {
  constructor(container) {
    this.container = container;
    this.pinnedMessage = null;

    this.unpinMessage = this.unpinMessage.bind(this);
  }

  createPinnedMessage(mes) {
    this.pinnedMessage = document.createElement('div');
    this.pinnedMessage.classList.add('pinned-message');
    this.pinnedMessage.innerHTML = `
      <div class="pinned-message__content">
        <h3>Pinned Message</h3>
      </div>
      <button type="button" class="pinned-message__unpin">
        <img src="./images/Cross.svg" />
      </button>
    `;
    this.container.append(this.pinnedMessage);
    this.pinnedMessage.addEventListener('click', () => {
      // const mesId = mes.getAttribute('data-id');
      // const el = this.container.querySelector(`[data-id="${mesId}"]`);
      mes.scrollIntoView({ behavior: "smooth" })
    });
    this.btnUnpin = this.pinnedMessage.querySelector('.pinned-message__unpin');
    this.btnUnpin.addEventListener('click', this.unpinMessage);
  }

  unpinMessage() {
    this.pinnedMessage.remove();
  }
}
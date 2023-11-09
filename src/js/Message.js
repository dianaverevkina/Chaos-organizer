class MessageView {
  renderMessage({ user, message }) {
        const isUser = user.name === 'user';
        const messageHTML = `
          <div class="message ${isUser ? 'message-user' : ''}" data-id="${message.id}">
            <div class="message__container">
              <div class="message__content">
                <p class="message__text">${message.text}</p>
                <p class="message__time">${message.date}</p>
              </div>
              <svg width="6" height="8" viewBox="0 0 6 8" fill="none" class="message__tail">
                <path d="M5.51475 6.81291C3.16611 5.49945 0 3.14549 0 6.97374e-06V8.00001L5.24113 8.00001C5.79778 8.00001 6.00058 7.08461 5.51475 6.81291Z"/>
              </svg>
            </div>
          </div>
        `;
        this.messages.insertAdjacentHTML('beforeend', messageHTML);
      }
}
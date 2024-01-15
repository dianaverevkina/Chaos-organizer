export default class Message {
  constructor({user, message, links, files}) {
    this.user = user;
    this.message = message;
    this.links = links;
    this.files = files;
  }

  // Заменяем текстовые ссылки на кликабельные
  replaceLinks(text) {
    // Регулярное выражение для поиска ссылок
    const regex = /(\bhttps?:\/\/\S+\b)/g;

    // Замена всех ссылок в сообщении на элементы <a>
    const textWithLinks = text.replace(regex, '<a href="$&" class="message__link">$&</a>');

    return textWithLinks;
  }

  // Шаблон для сообщений
  createMessageTemplate(block, messagesContainer, load) {
    const { id, date } = this.message;
    const isUser = this.user.name === 'user';
    const messageEl = document.createElement('div');
    messageEl.setAttribute('data-id', id);
    const additionalClass = isUser ? 'message-user' : '';
    messageEl.classList.add('message', additionalClass);
    messageEl.innerHTML = `
      <div class="message__container">
        <div class="message__content">
          ${block}
          <div class="message__info">
            <span class="message__pinned">
              <img src="./images/Pinned.svg" />
            </span>
            <p class="message__time">${date}</p>
          </div>
        </div>
        <svg width="6" height="8" viewBox="0 0 6 8" fill="none" class="message__tail">
          <path d="M5.51475 6.81291C3.16611 5.49945 0 3.14549 0 6.97374e-06V8.00001L5.24113 8.00001C5.79778 8.00001 6.00058 7.08461 5.51475 6.81291Z"/>
        </svg>
      </div>
    `;

    if (load) {
      messagesContainer.prepend(messageEl);
    } else {
      messagesContainer.append(messageEl);
    }

    return messageEl;
  }

  // Рендерим текстовое сообщение
  renderMessage(messagesContainer, load) {
    let text;

    if (this.links.length >= 0) {
      text = this.replaceLinks(this.message.text);
    } else {
      text = this.message.text;
    }

    const block = `<p class="message__text">${text}</p>`;
    const mesEl = this.createMessageTemplate(block, messagesContainer, load);
  }

  // Создаем HTML элемент файл
  createFileEl(file, filesContainer) {
    const { id, type, path, fileName } = file;
    const el = document.createElement('div');
    const additionalClass = `${((type.includes('video') && 'message__video') || (file.type.includes('audio') && 'message__audio')) || 'message__img'}`;
    el.classList.add('message__file', additionalClass);
    el.setAttribute('data-id', id);

    if (file.type.includes('image')) {
      el.innerHTML = `<img src=${path} alt=${fileName}>`;
    }
    if (file.type.includes('video')) {
      el.innerHTML = `<video src=${path}><video />`;
    }
    if (file.type.includes('audio')) {
      el.innerHTML = `
        <p>${fileName}</p>
        <audio class="file-audio" src=${path} controls></audio>
      `;
    }

    filesContainer.append(el);
  }

  // Рендерим сообщение, содержащее файлы
  renderFile(messagesContainer, load) {
    const block = `
      <div class="message__block">
        <div class="message__files"></div>
        ${this.message.text && `<p class="message__text">${this.message.text}</p>`}
      </div>
    `;
    const messageEl = this.createMessageTemplate(block, messagesContainer, load);

    this.filesWrapper = messageEl.querySelector('.message__files');

    this.files.forEach((file) => this.createFileEl(file, this.filesWrapper));
  }
}
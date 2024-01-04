import ChatAPI from './api/ChatAPI';
import Popover from './Popover';

export default class Chat {
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }
    this.container = container;
    this.start = true;

    this.api = new ChatAPI();
    this.popover = new Popover();

    this.sendMessage = this.sendMessage.bind(this);
    this.createMessage = this.createMessage.bind(this);
    this.scrollMessages = this.scrollMessages.bind(this);
  }

  init() {
    this.bindToDOM();
    this.registerEvents();
    this.api.subscribeOnEvents(this.createMessage);
    // this.scrollChat();
  }

  bindToDOM() {
    this.chatContainer = this.container.querySelector('.chat__container');
    this.messages = this.container.querySelector('.messages');
    this.messagesContainer = this.container.querySelector('.messages__container');
    this.inputMessage = this.container.querySelector('[name="text-message"]');
    this.inputFiles = this.container.querySelector('[name="loader-files"]');
    this.btnSendMessage = this.container.querySelector('.btn-send-message');
    this.btnOpenSidebar = this.container.querySelector('.btn-more');
    this.btnAttachFile = this.container.querySelector('.btn-attach');
  }

  // Добавяем обработчики событий
  registerEvents() {
    this.btnOpenSidebar.addEventListener('click', (e) => this.showSidebar(e));
    this.inputMessage.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      this.sendMessage(e);
    });

    this.btnSendMessage.addEventListener('click', this.sendMessage);

    this.chatContainer.addEventListener('dragover', (e) => this.showPlaceholderForFile(e));

    this.chatContainer.addEventListener('drop', (e) => this.showPopoverWithPreviews(e));
    this.btnAttachFile.addEventListener('click', (e) => {
      e.preventDefault();

      this.inputFiles.value = '';
      this.inputFiles.dispatchEvent(new MouseEvent('click'));
    });
    this.inputFiles.addEventListener('change', (e) => {
      const { files } = e.target;
      if (files.length === 0) return;
      this.popover.showPopover(files);
    });
    this.addScrollEvent();
  }

  showSidebar(e) {
    e.preventDefault();
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('sidebar_hidden');
  }

  sendMessage(e) {
    e.preventDefault();
    const message = this.inputMessage.value;

    if (!message) return;

    const links = this.searchLinks(message);

    const data = {
      type: 'textMessage',
      user: {
        name: 'user',
      },
      message,
      links,
    };

    this.api.webSocket.send(JSON.stringify(data));
    this.inputMessage.value = '';
  }

  searchLinks(text) {
    const regex = /(\bhttps?:\/\/\S+\b)/g;
    const fragments = text.split(regex);

    const links = [];

    fragments.forEach((fragment) => {
      const isLink = /^https?:\/\//.test(fragment);

      if (!isLink) return;

      links.push(fragment);
    });

    return links;
  }

  replaceLinks(text) {
    // Регулярное выражение для поиска ссылок
    const regex = /(\bhttps?:\/\/\S+\b)/g;

    // Замена всех ссылок в сообщении на элементы <a>
    const textWithLinks = text.replace(regex, '<a href="$&" class="message__link">$&</a>');

    return textWithLinks;
  }
  
  scrollMessages() {
    const lastMessage = this.messagesContainer.querySelector('.message')
    const data = {
      type: 'load',
      user: {
        name: 'user',
      },
      index: lastMessage.dataset.id,
    };
  
    this.api.webSocket.send(JSON.stringify(data));
  }

  addScrollEvent() {
    this.messagesContainer.addEventListener('scroll', () => {
      if (this.messagesContainer.scrollTop === 0) {
        this.scrollMessages();
      }
    });
  }

  createMessage(data) {
    if (data.type === 'load') {
      console.log(data.messages)
      data.messages.forEach(mes => this.renderMessage({message: mes, user: data.user, links: [], type: data.type}));
      if (this.start) {
        this.scrollChat();
        this.start = false;
      }
      return;
    }
    if (data.type === 'textMessage') {
      console.log(data)
      this.renderMessage(data);
    }
    if (data.type === 'file') {
      console.log(data);
      this.renderImg(data);
    }

    this.scrollChat();
  }

  renderMessage({ user, message, links, type }) {
    const isUser = user.name === 'user';
    let text;

    if (links.length >= 0) {
      text = this.replaceLinks(message.text);
    } else {
      text = message.text;
    }

    const messageHTML = `
      <div class="message ${isUser ? 'message-user' : ''}" data-id="${message.id}">
        <div class="message__container">
          <div class="message__content">
            <p class="message__text">${text}</p>
            <p class="message__time">${message.date}</p>
          </div>
          <svg width="6" height="8" viewBox="0 0 6 8" fill="none" class="message__tail">
            <path d="M5.51475 6.81291C3.16611 5.49945 0 3.14549 0 6.97374e-06V8.00001L5.24113 8.00001C5.79778 8.00001 6.00058 7.08461 5.51475 6.81291Z"/>
          </svg>
        </div>
      </div>
    `;
    const place = type === 'load' ? 'afterbegin' : 'beforeend'; 
    this.messagesContainer.insertAdjacentHTML(place, messageHTML);
  }

  renderImg({ user, files, message }) {
    console.log(message.type)
    const isUser = user.name === 'user';
    // debugger;
    const messageEl = document.createElement('div');
    messageEl.setAttribute('data-id', message.id);
    const additionalClass = isUser ? 'message-user' : '';
    messageEl.classList.add('message', additionalClass);
    messageEl.innerHTML = `
      <div class="message__container">
        <div class="message__content">
          <div class="message__block">
            <div class="message__files"></div>
            ${message.text && `<p class="message__text">${message.text}</p>`}
          </div>
          <p class="message__time">${message.date}</p>
        </div>
        <svg width="6" height="8" viewBox="0 0 6 8" fill="none" class="message__tail">
          <path d="M5.51475 6.81291C3.16611 5.49945 0 3.14549 0 6.97374e-06V8.00001L5.24113 8.00001C5.79778 8.00001 6.00058 7.08461 5.51475 6.81291Z"/>
        </svg>
      </div>
    `;
    this.messagesContainer.append(messageEl);
    this.filesWrapper = messageEl.querySelector('.message__files');

    files.forEach((file) => {
      const el = document.createElement('div');
      el.classList.add('message__file', `${file.type.includes('video') && 'message__video'}`);
      el.setAttribute('data-id', file.id);
      el.innerHTML = file.type.includes('image') ? `<img src=${file.path} alt=${file.fileName}>` 
        : `<video src=${file.path}><video />`;
      this.filesWrapper.append(el);
    });
  }

  showPlaceholderForFile(e) {
    e.preventDefault();
    if (this.placeholderForFiles) return;
    this.placeholderForFiles = document.createElement('div');
    this.placeholderForFiles.classList.add('placeholder-for-files');
    this.placeholderForFiles.innerHTML = `
      <div class="placeholder-for-files__content">
        <div class="placeholder-for-files__img">
          <img src="./images/upload.png" alt="Drag and drop">
        </div>
        <p class="placeholder-for-files__text-drop"> Drag and Drop here</p>
      </div>
    `;

    this.chatContainer.append(this.placeholderForFiles);
  }

  showPopoverWithPreviews(e) {
    e.preventDefault();
    const { files } = e.dataTransfer;
    this.placeholderForFiles.remove();
    this.popover.showPopover(files);
  }

  // Автоматическое пролистывание чата вниз
  scrollChat() {
    this.messagesContainer.scrollBy({
      top: this.messages.scrollHeight,
      left: 0,
      behavior: 'smooth',
    });
  }
}

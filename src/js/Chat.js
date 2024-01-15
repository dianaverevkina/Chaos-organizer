import data from '@emoji-mart/data';
import { Picker } from 'emoji-mart';
import hljs from 'highlight.js';
import 'highlight.js/styles/a11y-light.css';
import ChatAPI from './api/ChatAPI';
import Popover from './Popover';
import Message from './Message';
import PinnedMessage from './PinnedMessage';

// Создайте экземпляр Emoji Mart Picker


export default class Chat {
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }
    this.container = container;
    this.start = true;

    this.picker = new Picker({ data, previewPosition: 'none', searchPosition: 'none', onEmojiSelect: this.addEmoji});

    this.api = new ChatAPI();
    this.popover = new Popover();

    this.sendMessage = this.sendMessage.bind(this);
    this.createMessage = this.createMessage.bind(this);
    this.scrollMessages = this.scrollMessages.bind(this);
    // this.addEmoji = this.addEmoji.bind(this);
  }

  init() {
    this.bindToDOM();
    this.registerEvents();
    this.api.subscribeOnEvents(this.createMessage);
    this.bottombarField.append(this.picker);
    this.pinnedMessage = new PinnedMessage(this.messagesContainer);
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
    this.btnEmoji = this.container.querySelector('.btn-emoji');
    this.bottombarField = this.container.querySelector('.bottombar__field');
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
    this.btnEmoji.addEventListener('click', (e) => {
      this.picker.classList.toggle('active');
      e.stopPropagation();
    });
    document.addEventListener('click', (e) => this.closeEmojiPicker(e));
    this.messagesContainer.addEventListener('contextmenu', (e) => {
      // e.preventDefault();
      const {target} = e;
      const mes = target.closest('.message');
      if (!mes) return;
      console.log(mes);
      e.preventDefault();
      const contextMenu = document.createElement('div');
      contextMenu.classList.add('message__context-menu');
      contextMenu.innerHTML = `
      <li class="message__pin">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M0.999909 24.0004C1.2651 24.0004 
      1.51942 23.895 1.70691 23.7074L8.32591 17.0884L9.57391 
      18.3804C10.5145 19.3744 11.811 19.9549 13.1789 19.9944C13.6349 
      19.9958 14.0878 19.919 14.5179 19.7674C15.1825 19.5386 15.7663 
      19.1218 16.1985 18.5676C16.6308 18.0134 16.8928 17.3457 16.9529 
      16.6454C17.0614 15.6313 16.9862 14.6059 16.7309 13.6184L16.5169 
      12.5764C16.4764 12.4098 16.4793 12.2356 16.5256 12.0704C16.5718 
      11.9053 16.6597 11.7548 16.7809 11.6334L18.3679 10.0454C18.4305 
      9.98259 18.5152 9.9467 18.6039 9.94544C18.635 9.93964 18.6672 
      9.94266 18.6967 9.95414C18.7262 9.96563 18.7519 9.98512 18.7709 
      10.0104C19.2732 10.5431 19.9489 10.8792 20.6768 10.9584C21.4046 
      11.0376 22.1368 10.8546 22.7419 10.4424C23.097 10.1893 23.3926 
      9.86186 23.6081 9.48284C23.8237 9.10383 23.9541 8.68238 23.9902 
      8.24784C24.0262 7.8133 23.9672 7.37612 23.817 6.96674C23.6669 
      6.55736 23.4294 6.18563 23.1209 5.87744L18.1999 0.954436C17.6946 
      0.436536 17.0234 0.11272 16.3035 0.0396015C15.5837 -0.0335172 14.861 
      0.148714 14.2619 0.554436C13.9068 0.807469 13.6111 1.13487 13.3954 
      1.51385C13.1798 1.89282 13.0493 2.31426 13.0131 2.7488C12.9769 
      3.18334 13.0359 3.62055 13.186 4.02996C13.336 4.43938 13.5735 4.81117 13.8819 5.11944L13.9579 5.19544C14.0152 5.25313 14.0473 5.33114 14.0473 5.41244C14.0473 5.49374 14.0152 5.57174 13.9579 5.62944L12.3579 7.22944C12.2352 7.35192 12.0827 7.44038 11.9154 7.48614C11.7482 7.53189 11.5719 7.53338 11.4039 7.49044L10.5869 7.28144C9.58196 7.01898 8.53789 6.94005 7.50491 7.04844C6.77227 7.12431 6.07659 7.40807 5.49988 7.86624C4.92318 8.32442 4.48948 8.93793 4.24991 9.63444C3.98847 10.3502 3.93692 11.1257 4.10132 11.8698C4.26573 12.6138 4.63924 13.2955 5.17791 13.8344L6.93591 15.6544L0.292909 22.2934C0.1531 22.4333 0.0578931 22.6115 0.0193256 22.8054C-0.019242 22.9994 0.000560977 23.2004 0.076231 23.3831C0.151901 23.5658 0.280041 23.722 0.44445 23.8318C0.60886 23.9417 0.802159 24.0004 0.999909 24.0004ZM6.13491 10.3004C6.2476 9.95975 6.45662 9.65904 6.73669 9.43471C7.01675 9.21037 7.35584 9.07203 7.71291 9.03644C7.94313 9.01247 8.17444 9.00046 8.40591 9.00044C8.97322 9.00046 9.53819 9.07339 10.0869 9.21744L10.9099 9.42744C11.4141 9.55501 11.9428 9.54975 12.4444 9.41217C12.946 9.2746 13.4033 9.0094 13.7719 8.64244L15.3719 7.04244C15.8036 6.60942 16.0461 6.0229 16.0461 5.41144C16.0461 4.79997 15.8036 4.21345 15.3719 3.78044L15.2959 3.70444C15.1924 3.60114 15.1127 3.47639 15.0627 3.33897C15.0126 3.20156 14.9932 3.05483 15.006 2.90914C15.0188 2.76344 15.0634 2.62232 15.1366 2.49572C15.2098 2.36912 15.31 2.26013 15.4299 2.17644C15.6433 2.04726 15.8947 1.99562 16.1417 2.03024C16.3887 2.06485 16.6162 2.18359 16.7859 2.36644L21.7099 7.29044C21.8134 7.39373 21.8931 7.51849 21.9432 7.6559C21.9932 7.79331 22.0126 7.94004 21.9998 8.08573C21.987 8.23143 21.9425 8.37255 21.8692 8.49915C21.796 8.62575 21.6958 8.73474 21.5759 8.81844C21.3602 8.94938 21.1056 9.00104 20.8559 8.96454C20.6062 8.92803 20.3771 8.80565 20.2079 8.61844C20.0022 8.40629 19.756 8.23752 19.4839 8.12211C19.2119 8.00669 18.9194 7.94695 18.6239 7.94644C18.0005 7.94927 17.4026 8.19458 16.9569 8.63044L15.3709 10.2174C15.0108 10.5778 14.7484 11.024 14.6084 11.5139C14.4684 12.0037 14.4555 12.5212 14.5709 13.0174L14.7899 14.0754C14.9917 14.8469 15.053 15.6483 14.9709 16.4414C14.947 16.7649 14.8286 17.0742 14.6303 17.3309C14.4321 17.5877 14.1628 17.7805 13.8559 17.8854C13.3444 18.0199 12.8052 18.0068 12.3008 17.8475C11.7964 17.6882 11.3474 17.3893 11.0059 16.9854L6.60591 12.4354C6.33154 12.1618 6.14136 11.8153 6.05788 11.4369C5.97441 11.0585 6.00114 10.6641 6.13491 10.3004Z" fill="#374957"/>
      </svg>
      <span>Pin</span>
      </li>
      `;
      contextMenu.style.top = `${e.clientY}px`;
      contextMenu.style.left = `${e.clientX}px`;
      

      // const removeContextMenu = () => {
      //   contextMenu.remove();
      //   document.removeEventListener('mousemove', handleMouseMove);
      // };

      // function handleMouseMove (event) {
      //   console.log(event.target);
      //   const isWithinContextMenu = event.target.closest('.message__context-menu');
      //   if (isWithinContextMenu) return;
      //   setTimeout(()=> {contextMenu.remove();}, 1000);
      //   this.messagesContainer.removeEventListener('mousemove', handleMouseMove);
      // };

      

      // this.messagesContainer.addEventListener('mousemove', handleMouseMove); 
      document.body.append(contextMenu);
      const pinMessage = contextMenu.querySelector('.message__pin');
      pinMessage.addEventListener('click', () => {
        this.pinnedMessage.createPinnedMessage(mes);
        const mesWhichPinned = mes.querySelector('.message__pinned');
        mesWhichPinned.classList.add('message__pinned_visible');
        contextMenu.style.display = 'none';
      })
    });
  }

  closeEmojiPicker(e) {
    const targetElement = e.target;
    if (targetElement !== this.picker && this.picker.classList.contains('active')) {
      this.picker.classList.remove('active');
    }
  }

  addEmoji = (emoji) => {
    this.inputMessage.value += emoji.native;
  };

  // Открываем Sidebar
  showSidebar(e) {
    e.preventDefault();
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('sidebar_hidden');
  }

  // При скролле контейнера с сообщениями подгружаем новые сообщения
  scrollMessages() {
    const lastMessage = this.messagesContainer.querySelector('.message')
    const data = {
      type: 'load',
      index: lastMessage.dataset.id,
    };
  
    this.api.webSocket.send(JSON.stringify(data));
  }

  // Добавляем событие скролла
  addScrollEvent() {
    this.messagesContainer.addEventListener('scroll', () => {
      if (this.messagesContainer.scrollTop === 0) {
        this.scrollMessages();
      }
    });
  }

  // Отправляем сообщение при нажатии Enter или кнопки с "самолетиком"
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

  // Поиск ссылок в текстовом сообщении
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

  // // Заменяем текстовые ссылки на кликабельные
  // replaceLinks(text) {
  //   // Регулярное выражение для поиска ссылок
  //   const regex = /(\bhttps?:\/\/\S+\b)/g;

  //   // Замена всех ссылок в сообщении на элементы <a>
  //   const textWithLinks = text.replace(regex, '<a href="$&" class="message__link">$&</a>');

  //   return textWithLinks;
  // }

  // Создаем сообщение в зависимости от типа
  createMessage(data) {
    if (data.type === 'load') {
      data.savedMessages.forEach(mes => {
        const message = new Message(mes);
        if (mes.type === 'textMessage') {
          message.renderMessage(this.messagesContainer, 'load');
        } else {
          message.renderFile(this.messagesContainer, 'load');
        }
      });
      if (this.start) {
        this.scrollChat();
        this.start = false;
      }
      return;
    }
    if (data.type === 'textMessage') {
      const message = new Message(data);
      message.renderMessage(this.messagesContainer);
    }
    if (data.type === 'file') {
      const message = new Message(data);
      message.renderFile(this.messagesContainer);
    }

    this.scrollChat();
  }

  // // Шаблон для сообщений
  // createMessageTemplate(user, block, message, load) {
  //   const { id, date } = message;
  //   const isUser = user.name === 'user';
  //   const messageEl = document.createElement('div');
  //   messageEl.setAttribute('data-id', id);
  //   const additionalClass = isUser ? 'message-user' : '';
  //   messageEl.classList.add('message', additionalClass);
  //   messageEl.innerHTML = `
  //     <div class="message__container">
  //       <div class="message__content">
  //         ${block}
  //         <p class="message__time">${date}</p>
  //       </div>
  //       <svg width="6" height="8" viewBox="0 0 6 8" fill="none" class="message__tail">
  //         <path d="M5.51475 6.81291C3.16611 5.49945 0 3.14549 0 6.97374e-06V8.00001L5.24113 8.00001C5.79778 8.00001 6.00058 7.08461 5.51475 6.81291Z"/>
  //       </svg>
  //     </div>
  //   `;

  //   if (load) {
  //     this.messagesContainer.prepend(messageEl);
  //   } else {
  //     this.messagesContainer.append(messageEl);
  //   }

  //   return messageEl;
  // }

  // // Рендерим текстовое сообщение
  // renderMessage(mes, load) {
  //   const { user, message, links } = mes;
  //   let text;

  //   if (links.length >= 0) {
  //     text = this.replaceLinks(message.text);
  //   } else {
  //     text = message.text;
  //   }

  //   // const regex = /`([\s\S]+?)`/g; // Регулярное выражение для поиска фрагментов кода внутри ```
  //   // text.replace(regex, '<pre style="white-space: normal"><code>$1</code></pre>');

  //   const block = `<p class="message__text">${text}</p>`;
  //   const mesEl = this.createMessageTemplate(user, block, message, load);
  //   // const codeText = mesEl.querySelectorAll('code');
  //   // codeText.forEach(code => hljs.highlightElement(code));
  // }

  // // Создаем HTML элемент файл
  // createFileEl(file, filesContainer) {
  //   const { id, type, path, fileName } = file;
  //   const el = document.createElement('div');
  //   const additionalClass = `${((type.includes('video') && 'message__video') || (file.type.includes('audio') && 'message__audio')) || 'message__img'}`
  //   el.classList.add('message__file', additionalClass);
  //   el.setAttribute('data-id', id);

  //   if (file.type.includes('image')) {
  //     el.innerHTML = `<img src=${path} alt=${fileName}>`;
  //   }
  //   if (file.type.includes('video')) {
  //     el.innerHTML = `<video src=${path}><video />`;
  //   }
  //   if (file.type.includes('audio')) {
  //     el.innerHTML = `
  //       <p>${fileName}</p>
  //       <audio class="file-audio" src=${path} controls></audio>
  //     `;
  //   }

  //   filesContainer.append(el);
  // }

  // // Рендерим сообщение, содержащее файлы
  // renderFile(mes, load) {
  //   const { user, files, message } = mes;
  //   const block = `
  //     <div class="message__block">
  //       <div class="message__files"></div>
  //       ${message.text && `<p class="message__text">${message.text}</p>`}
  //     </div>
  //   `;
  //   const messageEl = this.createMessageTemplate(user, block, message, load);

  //   this.filesWrapper = messageEl.querySelector('.message__files');

  //   files.forEach((file) => this.createFileEl(file, this.filesWrapper));
  // }

  // Показываем окно для загрузки файла
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

  // Показываем окно с превью файлов
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

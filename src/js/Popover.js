import ChatAPI from './api/ChatAPI';

export default class Popover {
  constructor() {
    this.popover = null;

    this.api = new ChatAPI();
  }

  // Показываем popover с превью файлов
  showPopover(files) {
    this.drawPopover();

    this.filesContainer = this.popover.querySelector('.popover__files');
    this.form = this.popover.querySelector('.form');
    this.inputFileDesc = this.popover.querySelector('[name="file-desc"]');
    this.btnClose = this.popover.querySelector('.popover__btn-close');

    this.addEvents();

    this.files = [...files];
    this.filesForSend = [];

    [...this.files].forEach((file) => this.createPreviewFile(file));
  }

  // Рендерим popover
  drawPopover() {
    this.popover = document.createElement('div');
    this.popover.classList.add('popover');
    this.popover.innerHTML = `
      <div class="popover__container">
        <button type="button" class="popover__btn-close">
          <img src="./images/Cross.svg" alt="">
        </button>
        <h2 class="popover__header">Send Photo</h2>
        <div class="popover__files"></div>

        <form class="popover__form form">
          <label class="form__field">
            <input type="text" name="file-desc" class="form__input" placeholder="Add a caption">
          </label>
          <button class="form__btn btn-send-file">Send</button>
        </form>
      </div>
    `;

    document.body.append(this.popover);
  }

  // Добавляем обработчики событий
  addEvents() {
    this.btnClose.addEventListener('click', (e) => {
      e.preventDefault();
      this.popover.remove();
      this.popover = null;
    });

    this.form.addEventListener('submit', (e) => this.sendFiles(e));
  }

  // Создаем элемент файла
  createFileEl(type, url, name) {
    switch (true) {
      case type.includes('image'):
        return `
          <div class="popover__file-img">
            <img src="${url}" alt="">
          </div>
        `;
      case type.includes('video'):
        return `
          <div class="popover__file-video">
            <video class="file-video" src="${url}" controls></video>
          </div>
        `;
      case type.includes('audio'):
        return `
          <div class="popover__file-audio">
            <p>${name}</p>
            <audio class="file-audio" src="${url}" controls></audio>
          </div>
        `;
      default:
        return null;
    }
  }

  defineDuration(type, el) {
    this.elementFile = el.querySelector(`.file-${type}`);
    this.elementFile.addEventListener('loadedmetadata', () => {
      console.log('Длительность:', this.elementFile.duration + ' секунд');
    });
  }

  // Создаем превью файла
  createPreviewFile(file) {
    console.log(file);
    const url = URL.createObjectURL(file);
    const { type, name, size } = file;

    const preview = document.createElement('div');
    preview.classList.add('popover__file-preview');
    preview.innerHTML = this.createFileEl(type, url, name);
  
    this.filesContainer.append(preview);

    const sendFile = {
      path: url,
      name,
      type,
      size,
    };

    this.filesForSend.push(sendFile);
  }

  // Отправляем файлы на сервер
  sendFiles(e) {
    e.preventDefault();
    this.popover.remove();
    this.popover = null;
    let caption = this.inputFileDesc.value;

    const data = {
      type: 'file',
      user: {
        name: 'user',
      },
      files: this.filesForSend,
      message: caption,
    };

    this.api.webSocket.send(JSON.stringify(data));
    caption = '';

    this.filesForSend = [];
  }
}

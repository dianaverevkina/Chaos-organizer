import ChatAPI from './api/ChatAPI';

export default class Popover {
  constructor() {
    this.popover = null;

    this.api = new ChatAPI();
  }

  showPopover(files) {
    this.drawPopover();

    this.filesContainer = this.popover.querySelector('.popover__files');
    this.form = this.popover.querySelector('.form');
    this.inputFileDesc = this.popover.querySelector('[name="file-desc"]');
    this.btnClose = this.popover.querySelector('.popover__btn-close');

    this.addEvents();

    this.files = [...files];
    this.filesForSend = [];

    [...this.files].forEach((file) => this.createImageFile(file));
  }

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

  addEvents() {
    this.btnClose.addEventListener('click', (e) => {
      e.preventDefault();
      this.popover.remove();
      this.popover = null;
    });

    this.form.addEventListener('submit', (e) => this.sendFiles(e));
  }

  // Создаем картинку
  createImageFile(file) {
    console.log(file);
    const url = URL.createObjectURL(file);

    const preview = document.createElement('div');
    preview.classList.add('popover__file-preview');
    preview.innerHTML = file.type.includes('image') ? `<img src="${url}" alt="">` 
      : `<video src="${url}" controls ><video />`;
  
    this.filesContainer.append(preview);

    // // debugger;
    const sendFile = {
      path: url,
      name: file.name,
      type: file.type,
      size: file.size,
    };

    this.filesForSend.push(sendFile);
  }

  sendFiles(e) {
    e.preventDefault();
    this.popover.remove();
    this.popover = null;
    let caption = this.inputFileDesc.value;
    // debugger;
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

import SidebarApi from './api/SidebarApi';

export default class Sidebar {
  constructor(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }
    this.container = container;

    this.api = new SidebarApi();
    this.tabs = this.container.querySelector('.tabs__container');
    this.storage = this.container.querySelector('.storage__container');
    this.bntCloseSidebar = container.querySelector('.btn-close-sidebar');

    this.addEvents();
  }

  // Добавляем обработчики событий
  addEvents() {
    this.bntCloseSidebar.addEventListener('click', (e) => this.closeSidebar(e));
    this.tabs.addEventListener('click', (e) => this.loadStorage(e));
  }

  // Закрываем sidebar
  closeSidebar(e) {
    e.preventDefault();
    this.container.classList.add('sidebar_hidden');
  }

  // Загружаем данные хранилища
  loadStorage(e) {
    e.preventDefault();

    const { target } = e;
    const tab = target.closest('.tabs__tab');

    if (!tab) return;
    const tabs = this.tabs.querySelectorAll('.tabs__tab');
    tabs.forEach((tabEl) => tabEl.classList.remove('tabs__tab_active'));

    tab.classList.add('tabs__tab_active');
    const { name } = tab.dataset;
    this.api.list(name, (response) => {
      this.storage.innerHTML = '';
  console.log(response)
      if (response.links) {
        response.links.forEach((link) => this.showLinks(link));
      }
      if (response.media) {
        if (!response.media) return;
        response.media.forEach((file) => this.showMedia(file));
      }
      if (response.files) {
        if (!response.files) return;
        response.files.forEach((file) => this.showFiles(file));
      }
      if (response.audio) {
        if (!response.audio) return;
        console.log(response)
        response.audio.forEach((file) => this.showAudio(file));
      }
    });
  }

  // Отображаем ссылки в хранилище
  showLinks(item) {
    const el = document.createElement('div');
    el.classList.add('storage__item');
    el.innerHTML = `
      <a href="${item.link}" class="storage__link">${item.link}</a>
      <p class="storage__date">${item.date}</p>
    `;

    this.storage.prepend(el);
  }

  // Отображаем медиа в хранилище
  showMedia(item) {
    this.storage.classList.add('storage-media');
    const el = document.createElement('div');
    el.classList.add('storage__item', 'storage__media');
    el.innerHTML = `
      <div class="storage__img">
        ${item.type.includes('video') ? `<video src=${item.path}><video />` : `<img src=${item.path} src=${item.path}/>`}
      </div>
    `;

    this.storage.prepend(el);
  }

  // Отображаем аудио файлы в хранилище
  showAudio(item) {
    console.log(item)
    const el = document.createElement('div');
    el.classList.add('storage__item');
    el.innerHTML = `
      <div class="storage__audio">
        <p>${item.fileName}</p>
        <audio src=${item.path} controls></audio>
      </div>
      <p class="storage__date">${item.date}</p>
    `;

    this.storage.prepend(el);
  }

  // Создаем элемент файла
  createFileElement(type, url, fileName) {
    const regExForFileExtension = /\.([^.]+)$/;
    const extension = fileName.match(regExForFileExtension)[1];

    if (type.includes('video')) {
      return `<video src=${url}><video />`;
    }
    if (type.includes('image')) {
      return `<img src=${url} />`;
    }
    if (type.includes('audio')) {
      return `<p class="storage__file-extension">${extension}</p>`;
    }
  }

  // Отображаем файлы в хранилище
  showFiles(item) {
    const el = document.createElement('a');
    el.classList.add('storage__item', 'storage__download');
    el.href = item.path;
    el.download = item.fileName;
    el.innerHTML = `
      
      <div class="storage__file">
       ${this.createFileElement(item.type, item.path, item.fileName)}
      </div>
      <div class="storage__file-desc">
        <p>${item.fileName}</p>
        <p>${item.size} . ${item.fullDate}</p>
      </div>
    `;

    this.storage.prepend(el);
  }
}

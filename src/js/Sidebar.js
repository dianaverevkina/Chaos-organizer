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

  addEvents() {
    this.bntCloseSidebar.addEventListener('click', (e) => this.closeSidebar(e));
    this.tabs.addEventListener('click', (e) => this.loadStorage(e));
  }

  closeSidebar(e) {
    e.preventDefault();
    this.container.classList.add('sidebar_hidden');
  }

  loadStorage(e) {
    e.preventDefault();
    // debugger;
    const { target } = e;
    const tab = target.closest('.tabs__tab');

    if (!tab) return;
    const tabs = this.tabs.querySelectorAll('.tabs__tab');
    tabs.forEach((tabEl) => tabEl.classList.remove('tabs__tab_active'));

    tab.classList.add('tabs__tab_active');
    const { name } = tab.dataset;
    this.api.list(name, (response) => {
      this.storage.innerHTML = '';
      console.log(response);
      if (response.links) {
        // debugger;
        response.links.forEach((link) => this.showLinks(link));
      }
      if (response.files) {
        response.files.forEach((file) => this.showMedia(file));
      }
    });
  }

  showLinks(item) {
    const el = document.createElement('div');
    el.classList.add('storage__item');
    el.innerHTML = `
      <a href="${item.link}" class="storage__link">${item.link}</a>
      <p class="storage__date">${item.date}</p>
    `;

    this.storage.prepend(el);
    // this.api.getLinkInfo(item);
  }

  showMedia(item) {
    this.storage.classList.add('storage-media');
    const el = document.createElement('div');
    el.classList.add('storage__item', 'storage__file');
    el.innerHTML = `
      <div class="storage__img">
        <img src="${item.path}" alt="${item.fileName}">
      </div>
    `;

    this.storage.prepend(el);
  }
}

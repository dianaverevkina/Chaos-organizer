import createRequest from './createRequest';

export default class SidebarApi {
  constructor() {
    this.url = 'http://localhost:3000';
  }

  // Отправляем запрос на получение данных хранилища
  list(tabName, callback) {
    createRequest({
      url: `${this.url}/${tabName}`,
      method: 'GET',
    })
      .then((result) => {
        callback(result);
      })
      .catch((e) => {
        console.error('Произошла ошибка: ', e);
      });
  }
}

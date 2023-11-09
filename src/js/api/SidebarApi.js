import createRequest from './createRequest';

export default class SidebarApi {
  constructor() {
    this.url = 'http://localhost:3000';
  }

  // Отправляем запрос на получение инстансов
  list(tabName, callback) {
    createRequest({
      url: `${this.url}/${tabName}`,
      method: 'GET',
    })
      .then((result) => {
        console.log(result); callback(result);
      })
      .catch((e) => {
        console.error('Произошла ошибка: ', e);
      });
  }
}

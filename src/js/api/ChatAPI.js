export default class ChatAPI {
  constructor() {
    this.url = 'http://localhost:3000';
    this.webSocket = new WebSocket('ws://localhost:3000/ws');
  }

  // Подписываемя на события websocket
  subscribeOnEvents(callback) {
    this.webSocket.addEventListener('open', () => console.log('open'));
    this.webSocket.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
      callback(data);
    });
  }
}

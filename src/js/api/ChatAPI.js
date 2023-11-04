import createRequest from './createRequest';

export default class ChatAPI {
  constructor() {
    this.url = 'https://chat-backend-ff5v.onrender.com';
  }

  async createUser(userName) {
    const url = `${this.url}/new-user`;
    const options = {
      url,
      method: 'POST',
      data: userName,
    };
    const result = await createRequest(options);
    return result;
  }
}

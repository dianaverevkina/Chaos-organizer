import Chat from './Chat';
import Sidebar from './Sidebar';

const root = document.querySelector('.messenger__container');
const sidebarEl = document.querySelector('.sidebar');

const messenger = new Chat(root);
const sidebar = new Sidebar(sidebarEl);

messenger.init();

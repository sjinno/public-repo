const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const path = require('path');

const URL_PATH = isDev
  ? 'http://localhost:3000'
  : `file://${path.join(__dirname, '../build/index.html')}`;

const PRELOAD_PATH = path.join(
  __dirname,
  isDev ? '../public/preload.js' : '../build/preload.js',
);

ipcMain.on('hello', (event, message) => {
  log.info(
    `Received "${message}" from child process.\nSaying "hi" back to child from main...`,
  );
  event.reply('reply', 'hi');
});

let mainWindow;

const createWindow = () => {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: PRELOAD_PATH,
    },
  });

  window.loadURL(URL_PATH);

  window.on('closed', () => {
    mainWindow = null;
  });

  return window;
};

app.on('ready', () => {
  if (!isDev) {
    autoUpdater.checkForUpdates();
  }

  log.info('Creating window...');
  mainWindow = createWindow();
});

app.on('window-all-closed', () => {
  log.info('Quiting the app...');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createWindow();
  }
});

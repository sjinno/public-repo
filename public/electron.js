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

// -----------------
// Auto update stuff
// -----------------
function sendStatusToWindow(message) {
  if (mainWindow) {
    mainWindow.webContents.send('auto-update', message);
  }
}

// https://www.electron.build/auto-update#event-checking-for-update
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

// https://www.electron.build/auto-update#event-update-available
// This is when you can prompt the user whether or not
// he or she wants to update the app.
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available');
  log.info('SHOHEI@electron.js:71 ##### VAR: "info.version" =', info.version);
  log.info(
    'SHOHEI@electron.js:72 ##### VAR: "info.releaseDate" =',
    info.releaseDate,
  );
});

// https://www.electron.build/auto-update#event-update-not-available
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available');
});

// https://www.electron.build/auto-update#event-error
autoUpdater.on('error', (err) => {
  sendStatusToWindow(`Error in auto-updater: ${err.toString()}`);
});

// https://www.electron.build/auto-update#event-download-progress
autoUpdater.on('download-progress', (downloadProgress) => {
  const { bytesPerSecond, percent, transferred, total } = downloadProgress;
  sendStatusToWindow(
    `Download speed: ${bytesPerSecond} - Downloaded ${percent}% (${transferred} + '/' + ${total} + )`,
  );
});

// https://www.electron.build/auto-update#event-update-downloaded
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded; will install now');
  autoUpdater.quitAndInstall();
});

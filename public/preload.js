const { contextBridge, ipcRenderer } = require('electron');

const API = {
  hello: () => {
    console.log('Sending "hello" to main process from child process...');
    ipcRenderer.send('hello', 'hello');
  },
  listenForReply: () => {
    ipcRenderer.on('reply', (_event, message) => {
      console.log(`Received "${message}" from main process.`);
    });
  },
};

contextBridge.exposeInMainWorld('api', API);

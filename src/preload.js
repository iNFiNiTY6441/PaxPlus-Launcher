// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const {ipcRenderer, contextBridge} = require('electron');


/* SEND MESSAGES FROM MAIN TO RENDERER */
ipcRenderer.on('message', function (evt, message) {
    window.postMessage(message, "*");
});

contextBridge.exposeInMainWorld('PAXPLUS', {

  openDialog() {
    ipcRenderer.send('kek');
  },

  finishFirstTimeSetup ( setupData ) {
    console.log(setupData)
    ipcRenderer.send('firstTime_finish',setupData);
  }

});

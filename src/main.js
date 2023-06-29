const { app, ipcMain, dialog, BrowserWindow } = require('electron');
const path = require('path');

const os = require("os");
const fs = require("fs");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    webPreferences: {
      preload: SETUP_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    resizable: false,
    frame:false
    
  });

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
  mainWindow.setMenu(null)

  // ipcMain.handle('dialog', (event, method, params) => {       
  //   dialog[method](params);
  // });

  ipcMain.on('kek', () => {
    console.log("KEK!")
  });

  ipcMain.on('firstTime_finish', (event, setupData) => {
    console.log("SETUP DONE")
    console.log(setupData);
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  });

  // and load the index.html of the app.
  mainWindow.loadURL(SETUP_WINDOW_WEBPACK_ENTRY);

  //mainWindow.webContents.send('message', {'SAVED': 'File Saved'});
  
};


async function startup_getUserConfig(){

  console.log("[STARTUP]: Getting userConfig");

  let userHome = os.homedir();

  let configPath = userHome+"/paxplus_launcher/userConfiguration.json"


  if ( !fs.existsSync( configPath ) ) {
    console.log("[STARTUP]: No userConfig!");
    await setup_firstTime()
  }


}

async function setup_firstTime() {

  dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  }, function (files) {
    if (files !== undefined) {
        // handle files
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async function(){

  //await startup_getUserConfig();

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

//onclick="openMenuPage(this,'servers')

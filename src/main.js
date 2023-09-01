const { app, ipcMain, dialog, BrowserWindow } = require('electron');

const LauncherCore = require('./classes/launcherCore.js');

const remoteDataEndpoint = "https://infinity6441.github.io/PaxPlus-Launcher-Remote";

var LAUNCHER_CORE = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}


const { session } = require('electron')



const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    },
    resizable: false,
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  mainWindow.setMenu(null)


  // OPEN ALL EXTERNAL HREF LINKS IN DEFAULT BROWSER INSTEAD OF THE ELECTRON APP
  var handleRedirect = (e, url) => {

    e.preventDefault();

    if(url != mainWindow.webContents.getURL()) {
      
      require('electron').shell.openExternal(url)
    }
  }
  
  mainWindow.webContents.on('will-navigate', handleRedirect)
  mainWindow.webContents.on('new-window', handleRedirect)

  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });
  

  return mainWindow;

  // LAUNCHER_CORE.init_0().catch(error => {
  //   console.log(error)
  //   LAUNCHER_CORE.showPage( "critical", { errorHeading: "FATAL INIT ERROR", errorMessage: "Contact support or reinstall launcher.\r\n"+error.message } );
  // });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async function(){

  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       'Content-Security-Policy': ['default-src \'self\'','script-src \'self\' \'none-285a6f8424\'','unsafe-inline \'true\'']
  //     }
  //   })
  // })

  let mainWindow = await createWindow();

  
  LAUNCHER_CORE = new LauncherCore( remoteDataEndpoint, mainWindow );
  LAUNCHER_CORE.showPage( "loading", { progress: 0.0, loadingText: "Starting core functions." } );
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

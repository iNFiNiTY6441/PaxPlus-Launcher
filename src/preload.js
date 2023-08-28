// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge, remote } = require('electron');


/* SEND MESSAGES FROM MAIN TO RENDERER */
// ipcRenderer.on('message', function (evt, message) {
//     window.postMessage(message, "*");
// });

contextBridge.exposeInMainWorld('LauncherCoreAPI', {

  isEOL( ) {
    return ipcRenderer.invoke('Core:IsEOL');
  },

  getNews(){
    return ipcRenderer.invoke('Core:GetNews');
  },

  getPatchVersion(){
    return ipcRenderer.invoke('Core:GetPatchVersion');
  },

  finishSetup(){
    return ipcRenderer.invoke('Core:finishSetup');
  },

  getNetmode( ) {
    return ipcRenderer.invoke('Core:GetNetmode');
  },

  isGameRunning(){
    return ipcRenderer.invoke('Core:IsGameRunning');
  },
  
  OpenFileDialog( title, basepath ) {
    return ipcRenderer.invoke('Core:OpenFileDialog', title, basepath );
  },

  SelectGameDirectory() {
    return ipcRenderer.invoke('Core:SelectGameDirectory');
  },

  ShowPage( page, queryParams ) {
    ipcRenderer.send('Core:ShowPage', page, queryParams );
  },

  LaunchGame( serverIP ) {
    //ipcRenderer.send('Core:LaunchGame', { "Testdata":"foobar"});
    return ipcRenderer.invoke('Core:LaunchGame', serverIP );
  },

  GetServers() {
    return ipcRenderer.invoke('Core:GetServers');
  },

  GetNetMode() {
    return ipcRenderer.invoke('Core:GetNetMode');
  },

  GetGameSettingsBase() {
    return ipcRenderer.invoke('Core:GetGameSettingsBase');
  },

  getUserConfigValue( category, option ) {
    return ipcRenderer.invoke('Core:GetUserConfigValue', category, option );
  },

  setUserConfigValue( category, option, value ) {
    return ipcRenderer.invoke('Core:SetUserConfigValue', category, option, value );
  },

  GetGameSetting( optionsSection, optionsKey ) {
    return ipcRenderer.invoke('Core:GetGameSetting', optionsSection, optionsKey );
  },

  SetGameSetting( section, key, value ) {
    return ipcRenderer.invoke('Core:SetGameSetting', section, key, value);
  },

  SaveGameSettings( section, key, value ) {
    return ipcRenderer.invoke('Core:SaveGameSettings');
  }

});

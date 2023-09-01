// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge, remote } = require('electron');

contextBridge.exposeInMainWorld('LauncherCoreAPI', {

    async initialize(){
        let res = await ipcRenderer.invoke('Core:Init');
        return 
    },

    attachLauncherState( callback ) {

        if ( callback && typeof callback === 'function' ) {

        ipcRenderer.on('LauncherStateUpdate', (event, newState) => callback( newState ) );

        }
        //return ipcRenderer.invoke('Core:GetLauncherState');
    },

    finishSetup(){
        return ipcRenderer.invoke('Core:finishSetup');
    },

    OpenFileDialog( title, basepath ) {
        return ipcRenderer.invoke('Core:OpenFileDialog', title, basepath );
    },

    ShowPage( page, queryParams ) {
        ipcRenderer.send('Core:ShowPage', page, queryParams );
    },

    LaunchGame( serverIP, gameClosedCallback ) {
        //ipcRenderer.send('Core:LaunchGame', { "Testdata":"foobar"});
        ipcRenderer.on('GameClosed', (event) => gameClosedCallback() );
        return ipcRenderer.invoke('Core:LaunchGame', serverIP );
    },

    GetServers: () => { return ipcRenderer.invoke('Core:GetServers') },
        

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

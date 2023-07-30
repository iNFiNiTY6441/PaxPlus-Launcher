const { ipcMain, dialog } = require('electron');

const path = require('path');
const axios = require('axios');
const fs = require('fs');

const ConfigManager = require('./configManager.js');
const RemoteDataManager = require('./remoteDataManager.js');
const IniFilePatcher = require('./iniFilePatcher.js');
const PatchManager = require('./patchManager.js');

// Launcher version, currently test / dummy value for testing
// 'latest' is 0.5.0
// 'support' are 0.4.2, 0.4.1, 0.3.5
// everything else will return as EOL
const LAUNCHER_VERSION = "0.4.2";


/**
 * Main launcher backend class
 * Handles all launcher operations for the main process & communicates with the render process
 */
class LauncherCore {


    constructor( remoteConfigBaseURL, mainWindow ) {

        // Main electron window of the launcher
        this.mainWindow = mainWindow;

        // Base URL to get all remote config & patch data from
        this.configEndpoint = remoteConfigBaseURL;

        // Launcher local config / working dir
        this.localStoragePath = path.join(process.env.USERPROFILE, 'Documents','PAXPLUS_LAUNCHER_TEST');

        // Game INI path
        this.iniPath = path.join(process.env.USERPROFILE, 'Documents','My Games','Hawken-PaxLauncherTest','HawkenGame', 'Config');

        // User config manager
        this.configManager = null;

        // Currently loaded game patch data / data manager
        this.patchData = null;

        // Game launcher main operating mode
        this.netMode = "ONLINE";

    }

    /**
     * Registers all IPC handlers from the LauncherCoreAPI preload contextbridge
     * 
     * Beware, missing handlers for events in preload will prevent building!
     */
    registerHandlers() {

        ///////////////////////////////// BASE FUNCTIONALITY ////////////////////////////////////


        ipcMain.handle('Core:OpenFileDialog', async ( title, basepath ) => {
            return await dialog.showOpenDialog({properties: ['openDirectory'], title:"Select PAX 'Hawken-PC-Shipping' Folder" });
        });

        /**
         * UNFINISHED
         */
        ipcMain.handle('Core:GetNetMode', ( event, launchData ) => {
            return this.netMode;
        });

        /**
         * Launches the game lol
         */
        ipcMain.on('Core:LaunchGame', async ( event, launchData ) => {
            this.launchGame();
        });

        /**
         * Provide serverlist to renderer
         */
        ipcMain.handle('Core:GetServers', async ( shouldBeFresh ) => {
            console.log("\r\n============ Core: GetServers =============");
            // Specifically load the serverdata from remote only
            await this.serverData.loadRemote();
            console.log("[GetServers]: Got %s servers", Object.keys( this.serverData.data ).length );
            return this.serverData.data;
        });

        ///////////////////////////////// USER CONFIG ////////////////////////////////////

        /**
         * Returns the current user configuration json
         */
        ipcMain.handle('Core:GetUserConfig', ( event, category, option ) => {
            return this.configManager.config;
        });

        /**
         * Get a specific value from a section of the launcher userconfig file
         */
        ipcMain.handle('Core:GetUserConfigValue', ( event, category, option ) => {
            return this.configManager.getOption( category, option );
        });
        
        /**
         * Set a specific value in a section of the userconfig file
         */
        ipcMain.handle('Core:SetUserConfigValue', ( event, category, option, value ) => {
            return this.configManager.setOption( category, option, value );
        });


        /////////////////////////////// GAME SETTINGS ////////////////////////////////////

        /**
         * Send remotely configured game setting layout JSON to renderer.
         * The JSON can be updated remotely and the options page is built from it.
         * Allows for the addition of new game ini option tweaks on the fly by doing a backend file update :)
         */
        ipcMain.handle('Core:GetGameSettingsBase', (event, val) => {
            console.log("\r\n=========== GetGameSettingsBase ===========")
            return this.settingsData.data;
        });
        
        /**
         * Retrieves game setting for the renderer. Will use custom userconfig settings if available, 
         * but falls back to the game ini files for the values if missing.
         */
        ipcMain.handle('Core:GetGameSetting', ( event, optionCategoryName, optionCfgName ) => {

            let settings = this.settingsData.data;
            
            let source = "(CFG)";
            let value = this.configManager.getOption( "game", optionCfgName );
            
            // Not in userconfig? Pull from game ini instead
            if ( value == null || value == undefined ) {

                source = "(INI)"
                
                // Load game ini & get the needed value
                let iniLoader = new IniFilePatcher( path.join( process.env.USERPROFILE, 'Documents', 'My Games', 'Hawken-PaxPlus', 'HawkenGame', 'Config', settings[optionCategoryName][optionCfgName].ini.file+".ini") );
                value = iniLoader.getValue( settings[optionCategoryName][optionCfgName].ini.section, settings[optionCategoryName][optionCfgName].ini.key );
                
            }
            console.log("[GetGameSetting]: %s %s = %s", source, optionCfgName, value)
            return value;
        });

        /**
         * Sets a launcher userconfig option from within the renderer
         */
        ipcMain.handle('Core:SetGameSetting', ( section, key, value ) => {

            console.log("SET "+ key+" to "+value);
            this.configManager.setOption( "game", key, value );
        });

        /**
         * Writes the in-memory userConfig to the userConfig file - saving the user settings.
         */
        ipcMain.handle('Core:SaveGameSettings', (event) => {
            console.log("//////////// SaveGameSettings /////////////")
            this.configManager.saveConfig()
        });
    }

    /**
     * Displays the loading page with the given loading percentage & message
     * @param {Float} progress Loading bar percentage
     * @param {*} message Loading text to display
     */

    showPage( page, queryParameters ) {

        let queryString = "";
        if ( queryParameters ) queryString = Object.keys(queryParameters).map(key => key + '=' + queryParameters[key]).join('&');

        this.mainWindow.loadURL( MAIN_WINDOW_WEBPACK_ENTRY+"#/"+page+"?"+queryString);
    }    

    /**
     * Queries the support status for the current launcher version.
     * Ensures that the launcher only retrieves patches that are compatible with the launcher version
     * 
     * There is a differentiation between "latest" & "supported" ( multiple versions can be in "support" )
     * This allows for easing in of update prompts to users
     * 
     * Versions that don't fall under either are considered EOL ( hard cutoff to prevent compatibility issues, killswitch too )
     * 
     */
    async getLifeCycleStatus() {

        const response = await axios.get( this.configEndpoint+"/launcherVersions.json" );
        
        if ( LAUNCHER_VERSION === response.data.latest ) return 'latest';
        if ( response.data.supported.indexOf( LAUNCHER_VERSION ) >= 0 ) return 'support';
        return 'eol';
    }

    /**
     * Updates the remote settings & patch data
     */
    async updateRemoteConfigs() {

        if ( !this.patchData || !this.settingsData ) {

            throw new Error("LauncherCore fatal: Missing core data");
        }

        await this.patchData.loadFrom( 'local', true );
        await this.settingsData.loadFrom( 'remote', true );
    }


    async launchGame( serverIP ) {

        this.showPage( "menu/loading", { progress: 0.0, loadingText: "Starting." } );

        let gameRunning = await this.patchManager.isGameRunning();

        // GAME RUNNING: CANCEL LAUNCH
        if ( gameRunning ) {
            
            return this.showPage( "menu/error", { errorHeading: "Game is already running.", errorMessage: "Please close the running instance and try again.", actionName:"OK", actionURL: "/menu/play" } );
        }

        let gameInstallationDirectory = this.configManager.getOption("launcher","gamePath");

        // Something is wrong with the game directory
        if ( !gameInstallationDirectory || !fs.existsSync( gameInstallationDirectory ) ) {

            return this.showPage( "menu/error", { errorHeading: "Invalid game directory.", errorMessage: "Try again or reset game folder in the options menu", actionName:"OK", actionURL: "/menu/play" } );
        }

        // INI directory doesn't exist
        if ( !fs.existsSync( this.iniPath ) ) {

            return this.showPage( "menu/error", { errorHeading: "Invalid game ini directory.", errorMessage: this.iniPath+" does not exist", actionName:"OK", actionURL: "/menu/play" } );
        }


        this.patchManager.setGamePath( gameInstallationDirectory );

        // UPDATE & SET PATCH DATA
        this.showPage( "menu/loading", { progress: 0.2, loadingText: "Loading patch data" } );
        //await this.patchData.loadFrom( 'remote', true );        
        await this.updateRemoteConfigs();
        this.patchManager.setPatchGoal( this.patchData.data );

        try {

            this.showPage( "menu/loading", { progress: 0.4, loadingText: "Patching game..." } );
            await this.patchManager.patchGame();

            // APPLY USER SETTINGS OVER PATCHED INIs
            let settings = this.settingsData.data;
            console.log("--------- Applying User Settings --------")

            for ( let page in settings ) {

                for ( let optionKey in settings[page] ) {
                    
                    let value = this.configManager.getOption( "game", optionKey );
                    if ( !value ) continue;

                    let filePath = path.join( this.iniPath, settings[page][optionKey].ini.file+".ini" );
                    let iniPatcher = new IniFilePatcher( filePath );

                    let iniKey = settings[page][optionKey].ini.key;

                    // If multiple keys need to be changed for this particular option
                    if ( iniKey.constructor === Array ) {

                        // Find the object that stores all key values in the listOptions array
                        let valuesObject = settings[page][optionKey].listOptions.find( listItem => listItem.name === value ).data;

                        // Loop through all keys in the ini key array
                        for ( let i in iniKey ) {

                            // Set all the keys to their corresponding values in the listOptions object array
                            iniPatcher.setValue( settings[page][optionKey].ini.section, iniKey[i], valuesObject[ iniKey[i] ] );
                            console.log("["+path.basename(filePath)+"] "+ iniKey[i]+" = "+valuesObject[ iniKey[i] ]);
                        }

                    } else {

                        // Single key is being set to single value, easiest setting scenario

                        iniPatcher.setValue( settings[page][optionKey].ini.section, iniKey, value )
                        console.log("["+path.basename(filePath)+"] "+ settings[page][optionKey].ini.key+" = "+value);
                    }

                    // WRITE INI CONFIG CHANGES  TO FILE
                    iniPatcher.saveConfig();
                }
            }
            
        } catch ( patchingError ) {

            let errorDisplayTitle = "Unable to patch game.";

            switch( patchingError.code ) {

                case "ENOENT":
                    errorDisplayTitle = "Missing game files."
                    break;

            }

            return this.showPage( "menu/error", { errorHeading: errorDisplayTitle, errorMessage: patchingError.message, actionName:"Proceed", actionURL: "/menu/play" } );
        }
        
        this.showPage( "menu/loading", { progress: 0.8, loadingText: "Starting game..." } );
        this.showPage( "menu/play");
    }
    
    /**
     * Performs initial launcher startup tasks such as checking for available patches & updates
     * @async
     */
    async initialize() {

        // Basic init
        console.log("\r\n============ Core: Initialize =============");
        this.registerHandlers();
        
        // Load / create default user config
        this.showPage( "loading", { progress: 0.2, loadingText: "User configuration." } );

        this.configManager = new ConfigManager( path.join( this.localStoragePath, 'userConfig.json' ) );
        console.log( "[CORE][INIT][1]: UserConfig loaded");
        
        // Get latest & all still supported launcher versions
        this.showPage( "loading", { progress: 0.4, loadingText: "Launcher version information." } );

        let supportStatus = await this.getLifeCycleStatus().catch( ( error ) => { return { error: error } } );

        // Can't check status
        if ( supportStatus.error ) {
            // BOOT INTO OFFLINE MODE FROM HERE
            return this.showPage( "error", { errorHeading: "Unable to contact masterserver.", errorMessage: supportStatus.error.message } );
        }

        console.log( "[CORE][INIT][2]: v%s - Lifecycle is '%s'", LAUNCHER_VERSION, supportStatus);

        // Get the game patch json
        this.showPage( "loading", { progress: 0.6, loadingText: "Game patch data." } );

        if ( supportStatus === 'latest' || supportStatus === 'support') {

            // Launcher is still compatible for remote patching: Get patch package
            this.patchData = new RemoteDataManager( this.configEndpoint+"/gamePatch.json", { localPath: this.localStoragePath } );

            // Settings preset data
            this.settingsData = new RemoteDataManager( this.configEndpoint+"/gameSettings.json", { localPath: this.localStoragePath } );

            // Attempt to pull newest patch & settings data from the remote endpoint, will fallback to local if possible
            await this.updateRemoteConfigs().catch( patchdataInitError => {

                // CRITICAL: Can't get patchdata from remote & no local fallback file exists!
                // Likely a first time setup without internet, cannot proceed
    	        this.showPage( "error", { errorHeading: "Not connected", errorMessage: "First time setup requires an internet connection." } );
                console.log( "[CORE][INIT][3]: ERROR - No local or remote patch data available!");
                return;
            })

            // Report data sources
            console.log( "[CORE][INIT][3]: Loaded patch %s from %s", this.patchData.data.meta.version, this.patchData.dataSource );
            console.log( "[CORE][INIT][3]: Loaded gameSettings from %s", this.settingsData.dataSource );

        } else {

            // TODO: Handle this
            // NO PATCHES: EOL!

            // SET LAUNCHER INTO OFFLINE MODE & DISPLAY PERMANENT ON SCREEN WARNING

        }
        
        let gameInstallationDirectory = this.configManager.getOption("launcher","gamePath");
        this.patchManager = new PatchManager( gameInstallationDirectory, this.iniPath, this.localStoragePath );

        // Get game servers
        this.showPage( "loading", { progress: 0.8, loadingText: "Setting masterserver." } );
        this.serverData = new RemoteDataManager( "http://paxhawken.ddns.net:9000/serverListings" );

        this.showPage( "loading", { progress: 1.0, loadingText: "Loading complete." } );

        console.log("/////////// CORE INIT COMPLETE ////////////");

        // PROCEED TO MENU OR FIRST TIME SETUP
        let configuredGamepath = this.configManager.getOption("launcher","gamePath");
        // let exePath = path.join( configuredGamepath, "Binaries","Win32","HawkenGame-Win32-Shipping.exe");

        if ( !configuredGamepath || configuredGamepath.length == 0 ) {

            this.showPage("welcome");

        } else {

            this.showPage("menu");
        }

        //this.mainWindow.webContents.send('message','NOTIFY')
        //this.mainWindow.webContents.send('mode_setOffline')
    }


}

module.exports = LauncherCore;
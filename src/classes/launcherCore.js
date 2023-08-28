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

const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
}).join('')


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
        this.localStoragePath = path.join(process.env.USERPROFILE, 'Documents','PAXPlus_Launcher');

        // Game INI path
        this.iniPath = path.join(process.env.USERPROFILE, 'Documents', 'My Games', 'Hawken', 'HawkenGame', 'Config');

        // User config manager
        this.configManager = null;

        // Currently loaded game patch data / data manager
        this.patchData = null;
        this.newsData = null;
        this.serverData = null;

        // Game launcher main operating mode
        this.netMode = 1;

    }

    
    getNetmode() {

        return this.netMode;
    }

    async getUserConfig() {

        if ( !this.configManager ) throw new Error("[getUserConfig]: FATAL! configManager not initialized.");
        if ( !this.configManager.config ) throw new Error("[getUserConfig]: FATAL! configManager has no config loaded.");

        return this.configManager.config;
    }

    async getNews() {

        if ( this.netMode != 0 ) return [];
        if ( this.newsData === null ) throw new Error("[getNews]: FATAL! newsData not initialized.");

        await this.newsData.loadFrom('remote');
        if ( !this.newsData.data ) return [];

        return this.newsData.data;
    }

    async getPatchVersion() {

        let version = "";

        if ( !this.patchData ) throw new Error("[getPatchVersion]: FATAL! patchData not initialized.");
        if ( !this.patchData.data ) throw new Error("[getPatchVersion]: FATAL! No patch data loaded.");

        if ( this.patchData.data.meta && this.patchData.data.meta.version ) version = this.patchData.data.meta.version;

        return version;
    }

    async getServers( getFresh = false ) {

        console.log("\r\n============ Core: GetServers =============");
        console.log("[GetServers]: Fresh? %s", getFresh );

         // Specifically load the serverdata from remote only
        await this.serverData.loadRemote();
       
        console.log("[GetServers]: Got %s servers", Object.keys( this.serverData.data ).length );
        return this.serverData.data;
    }

    async getUserConfigValue( category, option ) {

        if ( !this.configManager ) throw new Error("[getUserConfigValue]: FATAL! configManager not initialized.");

        return this.configManager.getOption( category, option );
    }

    async setUserConfigValue( category, option, value ) {

        if ( !this.configManager ) throw new Error("[setUserConfigValue]: FATAL! configManager not initialized.");

        return this.configManager.setOption( category, option, value );
    }

    async getGameSettingsBaseConfig() {

        console.log("\r\n=========== GetGameSettingsBase ===========")
        if ( !this.settingsData ) throw new Error("[getGameSettingsBaseConfig]: FATAL! settingsData not initialized.");
        return this.settingsData.data;
    }

    getGameSetting( optionCategoryName, optionCfgName ) {

        // FATAL: SettingsData manager / endpoint missing
        if ( !this.settingsData ) {
            throw new Error(`[GetGameSetting]: FATAL: settingsData manager not initialized!`);
        }

        // FATAL: No settingsData JSON
        if ( !this.settingsData.data || Object.keys( this.settingsData.data ).length === 0  ) {
            throw new Error(`[GetGameSetting]: FATAL: settingsData.data is empty!`);
        }

        // Data for this particular settings entry
        const setting = this.settingsData.data[optionCategoryName][optionCfgName];

        // Option is not in settings JSON
        if ( !setting ) throw new Error(`[GetGameSetting]: Option not in settings JSON: ${optionCfgName}`);

        
        // Default data source is userConfig
        let debug_dataSource = "(CFG)";

        // Attempt retrieving the setting value from launcher userCfg
        let value = this.configManager.getOption( "game", optionCfgName );

        // Requested value not in userCfg: 
        // Pull value from game ini file instead

        if ( value == null || value == undefined ) {

            // Load game ini & get the needed value
            let iniLoader = new IniFilePatcher( path.join( this.iniPath, `${setting.ini.file}.ini` ) );
            
            debug_dataSource = "(INI)"
    
            switch( setting.type ) {

                // Simplest: get value for key from ini
                default:    
                    value = iniLoader.getValue( setting.ini.section, setting.ini.key );
                    break;

                // Dropdown: Aggregate all values needed for the dropdown from ini and match with their listoption in settings json
                case 'list': 

                    // ERROR: Ini key data property MUST be array for list options!
                    if ( setting.ini.key.constructor !== Array ) {
                        throw new Error(`[GetGameSetting]: (list) Improper ini key data in settings JSON for option: ${optionCfgName}`);
                    }

                    const listOptions = setting.listOptions;

                    let iniData = {};

                    // Gather all values for needed keys into the iniData object for comparison
                    for ( let i in setting.ini.key ) {

                        let iniValue = iniLoader.getValue( setting.ini.section, setting.ini.key[i] );

                        // Parse numbers, to avoid string / number type mismatch for comparison
                        if ( !isNaN( iniValue ) ) iniValue = Number( iniValue );

                        iniData[setting.ini.key[i]] = iniValue;
                    }

                    // Search for a dropdown option that matches our ini values
                    for ( let j in listOptions ) {
                            
                        // If all values pulled from inis match the ones needed for this dropdown needed, give us the name of the dropdown option
                        if ( JSON.stringify( iniData ) == JSON.stringify( listOptions[j].data ) ) value = listOptions[j].name;
                    }
                    break;
                
                // Colors: Always stored in game inis as 3-key RGB% values, convert to hex for in-launcher use
                case 'color':

                    // ERROR: Ini key data property MUST be array for color options!
                    if ( setting.ini.key.constructor !== Array ) {
                        throw new Error(`[GetGameSetting]: (color) Improper ini key data in settings JSON for option: ${optionCfgName}`);
                    }
                    // ERROR: Not enough ini keys for RGB ( Should be 3, duh )
                    if ( setting.ini.key.length < 3 ) {
                        throw new Error(`[GetGameSetting]: (color) Ini key data in settings JSON is insufficient for RGBtoHex conversion for option: ${optionCfgName}`);
                    }

                    let rgbValues = [];

                    for ( const k in setting.ini.key ) {

                        let iniColorPercent = iniLoader.getValue( setting.ini.section, setting.ini.key[k] );
                        let colorValue = Math.floor( ( iniColorPercent / 100 ) * 255 )
                        rgbValues.push( colorValue );
                    }
                    value = rgbToHex( ...rgbValues );
                    break;
            }

        }

        console.log("[GetGameSetting]: %s %s = %s", debug_dataSource, optionCfgName, value );

        return value;
    }

    setGameSetting( key, value ) {

        if ( !this.configManager ) throw new Error("[setGameSetting]: FATAL! configManager not initialized.");
        if ( !this.configManager.config ) throw new Error("[setGameSetting]: FATAL! configManager has no config loaded.");
        return this.configManager.setOption( "game", key, value );
    }

    saveGameSettings() {

        if ( !this.configManager ) throw new Error("[saveGameSettings]: FATAL! configManager not initialized.");
        if ( !this.configManager.config ) throw new Error("[saveGameSettings]: FATAL! configManager has no config loaded.");

        console.log("//////////// SaveGameSettings /////////////")
        return this.configManager.saveConfig()
    }



    /**
     * Registers all IPC handlers from the LauncherCoreAPI preload contextbridge
     * 
     * Beware, missing handlers for events in preload will prevent building!
     */
    registerHandlers() {

        ///////////////////////////////// BASE FUNCTIONALITY ////////////////////////////////////

        // Open a file selector
        ipcMain.handle('Core:OpenFileDialog', async ( title, basepath ) => {
            return await dialog.showOpenDialog({ properties: ['openDirectory'], title:"Select PAX 'Hawken-PC-Shipping' Folder" });
        });

        // Open a file selector
        ipcMain.handle('Core:finishSetup', async ( title, basepath ) => {
            return await this.finishSetup();
        });

        // Launcher netmode
        ipcMain.handle('Core:GetNetmode', () => {
            return this.getNetmode();
        });

        // End of life
        ipcMain.handle('Core:IsEOL', async () => {
            return await this.getLifeCycleStatus() == 'eol';
        });

        // Launcher news
        ipcMain.handle('Core:GetNews', async () => {
            return this.getNews();
        });

        // Patch version
        ipcMain.handle('Core:GetPatchVersion', async () => {
            return this.getPatchVersion();
        });

        //Check if game is running
        ipcMain.handle('Core:IsGameRunning', async () => {
            return await this.patchManager.isGameRunning();
        });

        // Start the game launch sequence
        ipcMain.handle('Core:LaunchGame', async ( event, serverIP ) => {
            this.launchGame(serverIP);
        });

        // Server list
        ipcMain.handle('Core:GetServers', async ( event, shouldBeFresh ) => {
            return this.getServers( shouldBeFresh );
        });

        ///////////////////////////////// USER CONFIG ////////////////////////////////////

        // Get User config
        ipcMain.handle('Core:GetUserConfig', ( event, category, option ) => {
            return this.getUserConfig();
        });

        // Get a specific value from a section of the launcher userconfig file
        ipcMain.handle('Core:GetUserConfigValue', ( event, category, option ) => {
            return this.getUserConfigValue( category, option );
        });
        
        // Set a specific value in a section of the userconfig file
        ipcMain.handle('Core:SetUserConfigValue', ( event, category, option, value ) => {
            return this.setUserConfigValue( category, option, value );
        });

        /////////////////////////////// GAME SETTINGS ////////////////////////////////////

        /**
         * Send remotely configured game setting layout JSON to renderer.
         * The JSON can be updated remotely and the options page is built from it.
         * Allows for the addition of new game ini option tweaks on the fly by doing a backend file update :)
         */
        ipcMain.handle('Core:GetGameSettingsBase', (event, val) => {
            return this.getGameSettingsBaseConfig();
        });
        
        /**
         * Retrieves game setting for the renderer. Will use custom userconfig settings if available, 
         * but falls back to the game ini files for the values if missing.
         */
        ipcMain.handle('Core:GetGameSetting', ( event, optionCategoryName, optionCfgName ) => {
          try{
            return this.getGameSetting( optionCategoryName, optionCfgName );
          }catch(e){
            console.log(e)
          }
        });

        /**
         * Sets a launcher userconfig option from within the renderer
         */
        ipcMain.handle('Core:SetGameSetting', ( section, key, value ) => {
            return this.setGameSetting( key, value );
        });

        /**
         * Writes the in-memory userConfig to the userConfig file - saving the user settings.
         */
        ipcMain.handle('Core:SaveGameSettings', (event) => {
            return this.saveGameSettings();
        });
    }

    /**
     * Displays the loading page with the given loading percentage & message
     * @param {Float} progress Loading bar percentage
     * @param {*} message Loading text to display
     */

    showPage( page, queryParameters ) {

        // Improper showPage call
        if ( !page ) throw new Error(`[showPage]: No page specified!`);

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

        const response = await axios.get( this.configEndpoint+"/launcherVersions.json",{
            timeout: 4000,
            signal: AbortSignal.timeout(4000),
        }).catch( abortError => {
            console.log(abortError);
            return null;
        })
        
        if ( !response || !response.data ) return 'eol';

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

        await this.patchData.loadFrom( 'remote', true );
        await this.settingsData.loadFrom( 'remote', true );
    }


    async launchGame( serverIP ) {

        this.showPage( "menu/loading", { progress: 0.0, loadingText: "Starting." } );

        let gameRunning = await this.patchManager.isGameRunning();

        // GAME RUNNING: CANCEL LAUNCH
        if ( gameRunning ) {
            
            return this.showPage( "menu/error", { 
                errorHeading: "Game is already running.", 
                errorMessage: "Please close the running instance and try again.", 
                actionName:"OK", 
                actionURL: "/menu/play" 
            });
        }

        let gameInstallationDirectory = this.configManager.getOption("launcher","gamePath");

        // Something is wrong with the game directory
        if ( !gameInstallationDirectory || !fs.existsSync( gameInstallationDirectory ) ) {

            return this.showPage( "menu/error", { 
                errorHeading: "Invalid game directory.", 
                errorMessage: "Try again or reset game folder in the options menu", 
                actionName:"OK", 
                actionURL: "/menu/play" 
            });
        }

        // INI directory doesn't exist
        if ( !fs.existsSync( this.iniPath ) ) {

            return this.showPage( "menu/error", { 
                errorHeading: "Invalid game ini directory.", 
                errorMessage: this.iniPath+" does not exist", 
                actionName:"OK", 
                actionURL: "/menu/play" 
            });
        }


        this.patchManager.setGamePath( gameInstallationDirectory );

        // UPDATE & SET PATCH DATA
        this.showPage( "menu/loading", { progress: 0.2, loadingText: "Loading patch data" } );
        //await this.patchData.loadFrom( 'remote', true );        
        await this.updateRemoteConfigs();
        this.patchManager.setPatchGoal( this.patchData.data );


        try {
            // Perform upk & base ini patching
            this.showPage( "menu/loading", { progress: 0.4, loadingText: "Patching game..." } );
            await this.patchManager.patchGame();
            
            // Apply userCfg values over base-patched inis
            this.showPage( "menu/loading", { progress: 0.4, loadingText: "Applying user settings..." } );
            await this.patchManager.applyUserConfig( this.configManager, this.settingsData.data );
            
        } catch ( patchingError ) {

            let errorDisplayTitle = "Unable to patch game.";

            switch( patchingError.code ) {

                case "ENOENT":
                    errorDisplayTitle = "Missing game files."
                    break;
            }

            console.log( patchingError );

            return this.showPage( "menu/error", { 
                errorHeading: errorDisplayTitle, 
                errorMessage: patchingError.message, 
                actionName:"Proceed", 
                actionURL: "/menu/play" 
            });
        }
        
        this.showPage( "menu/loading", { progress: 0.8, loadingText: "Starting game..." } );



        let userGameArgs = this.configManager.getOption("launcher","gameStartupArgs");
        let gameArgs = [];

        if( serverIP ) gameArgs.push( serverIP );

        if ( userGameArgs && userGameArgs.length > 0 ) gameArgs = gameArgs.concat( userGameArgs.split(" "));
        
        await this.patchManager.startGame( gameArgs );
        this.showPage( "menu/play");
    }

    async finishSetup(){
        
        await this.init_1();
    }

    async init_0() {

        console.log("\r\n============ Core: INIT-0 =============");
        this.showPage( "loading", { progress: 0.0, loadingText: "Initializing..." } );
        this.registerHandlers();
        console.log( "[CORE][INIT_0][0]: IPC Handles registered.");

        this.showPage( "loading", { progress: 0.1, loadingText: "User configuration." } );
        this.configManager = new ConfigManager( path.join( this.localStoragePath, 'userConfig.json' ) );
        
        console.log( "[CORE][INIT_0][1]: UserConfig loaded.");

        // Check if game
        let gameInstallationDirectory = this.configManager.getOption("launcher","gamePath");
        console.log( "[CORE][INIT_0][2]: Game Path: "+gameInstallationDirectory );

        // Something is wrong with the game directory
        if ( !gameInstallationDirectory || !fs.existsSync( gameInstallationDirectory ) ) {

            console.log( "[CORE][INIT_0][3]: STARTING FIRST TIME SETUP");
            return this.showPage("welcome");
        }
        console.log( "[CORE][INIT_0][3]: ALL SYSTEMS GO, PROCEED TO INIT_1");
        await this.init_1();
    }

    async init_1() {

        // Basic init
        console.log("\r\n============ Core: INIT-1 =============");

        // Game install directory
        let gameInstallationDirectory = this.configManager.getOption("launcher","gamePath");

        // Default hawken ini directory
        this.iniPath = path.join(process.env.USERPROFILE, 'Documents', 'My Games', 'Hawken_PAXPlus', 'HawkenGame', 'Config');

        // Get DefaultEngine.ini
        let DefaultEngineIniPath = path.join( gameInstallationDirectory, "HawkenGame", "Config", "DefaultEngine.ini" );
        let DefaultEngine = new IniFilePatcher( DefaultEngineIniPath );

        // Make sure to use a paxplus ini folder
        await DefaultEngine.setValue("Windows.StandardUser", "MyDocumentsSubDirName", "Hawken_PAXPlus");
        await DefaultEngine.saveConfig();
        console.log( "[CORE][INIT_1][1]: SET INI FOLDER ");

        // Create patch manager
        this.patchManager = new PatchManager( gameInstallationDirectory, this.iniPath, this.localStoragePath );
        console.log( "[CORE][INIT_1][2]: Patch manager created." );
        console.log(this.iniPath)
        // IniFolder is empty
        if ( !fs.existsSync(this.iniPath) || fs.readdirSync(this.iniPath).length === 0 ) {
            console.log("HUHd")
            fs.mkdirSync(this.iniPath,{ recursive: true });
            this.showPage( "loading", { progress: 0.2, loadingText: "Performing first time setup" } );
            await this.patchManager.generateUserInis();

        }

        


        this.showPage( "loading", { progress: 0.2, loadingText: "Patching systems." } );

        

        console.log( "[CORE][INIT_1][3]: ALL SYSTEMS GO, PROCEED TO INIT_2");
        await this.init_2()

    }

    async init_2() {

        console.log("\r\n============ Core: INIT-2 =============");

        // Launcher is still compatible for remote patching: Get patch package
        this.patchData = new RemoteDataManager( this.configEndpoint+"/gamePatch.json", { localPath: this.localStoragePath } );
        this.settingsData = new RemoteDataManager( this.configEndpoint+"/gameSettings.json", { localPath: this.localStoragePath } );

        this.newsData = new RemoteDataManager( this.configEndpoint+"/news.json");
        this.serverData = new RemoteDataManager( "http://paxhawken.ddns.net:9000/serverListings" );

        // Get latest & all still supported launcher versions
        this.showPage( "loading", { progress: 0.4, loadingText: "Launcher version information." } );
        let supportStatus = await this.getLifeCycleStatus().catch( ( error ) => { return { error: error } } );

        // Can't check status
        if ( supportStatus.error ) {
            // BOOT INTO OFFLINE MODE FROM HERE
            return this.showPage( "error", { errorHeading: "Unable to contact masterserver.", errorMessage: supportStatus.error.message } );
        }

        console.log( "[CORE][INIT_2][2]: v%s - Lifecycle is '%s'", LAUNCHER_VERSION, supportStatus);

        switch ( supportStatus ) {

            default:
                return this.showPage( "error", { errorHeading: "Unable to evaluate launcher version.", errorMessage: "Lifecycle needs to be ( 'eol' | 'support' | 'latest' ), is none." } );
                break;

            case 'eol': 
                // BOOT INTO OFFLINE MODE FROM HERE
                this.netMode = -1;
                this.supportStatus = "eol";

                try {

                    this.patchData.loadFrom('local');
                    this.settingsData.loadFrom('local');

                } catch ( localLoadError ) {

                }
                return this.showPage("menu");
                break;

            case 'support': case 'latest':
                // Get the game patch json
                this.showPage( "loading", { progress: 0.6, loadingText: "Game patch data." } );
                // Attempt to pull newest patch & settings data from the remote endpoint, will fallback to local if possible
                await this.updateRemoteConfigs().catch( patchdataInitError => {

                    // CRITICAL: Can't get patchdata from remote & no local fallback file exists!
                    // Likely a first time setup without internet, cannot proceed
                    this.showPage( "error", { errorHeading: "Not connected", errorMessage: "First time setup requires an internet connection." } );
                    console.log( "[CORE][INIT_2][3]: ERROR - No local or remote patch data available!");
                    return;
                });
                // Report data sources
                console.log( "[CORE][INIT_2][3]: Loaded patch %s from %s", this.patchData.data.meta.version, this.patchData.dataSource );
                console.log( "[CORE][INIT_2][3]: Loaded gameSettings from %s", this.settingsData.dataSource );

                this.netMode = 0;
        }

        this.showPage( "loading", { progress: 1.0, loadingText: "Loading complete." } );

        console.log("/////////// CORE INIT COMPLETE ////////////");

        this.showPage("menu");
        //this.showPage("welcome");
    }
    
    /**
     * Performs initial launcher startup tasks such as checking for available patches & updates
     * @async
     */
    async initialize() {

    }


}

module.exports = LauncherCore;
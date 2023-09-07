const { ipcMain, dialog } = require('electron');
const { v4: uuidv4 } = require('uuid');

const path = require('path');
const fs = require('fs');

// Launcher classes
const ConfigManager = require('./configManager.js');
const RemoteDataManager = require('./remoteDataManager.js');
const IniFilePatcher = require('./iniFilePatcher.js');
const PatchManager = require('./patchManager.js');

// Default launcher state object
const { DefaultState } = require("../app/defaultLauncherState.js");

// Launcher attributes
const LAUNCHER_DEFAULT_ENDPOINT = "http://78.47.65.130:281";//"https://infinity6441.github.io/PaxPlus-Launcher-Remote";//
const LAUNCHER_VERSION = "1.0.0";//"0.9.5";
const LAUNCHER_UNIQUEID = uuidv4();

const LAUNCHER_HEADERS = {
    Authorization: "PAXPLUS4D5707DB",
    LauncherID: LAUNCHER_UNIQUEID,
    LauncherVersion: LAUNCHER_VERSION,
}

const LAUNCHER_OFFLINEPOLLINGRATE = 5000;

// Color conversion util
const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
}).join('');

/**
 * Main launcher backend class
 * Handles all launcher operations for the main process & communicates with the render process
 */
class LauncherCore {

    /**
     * Creates a new launcher core class instance, there should only ever be one at any given time.
     * 
     * @param {*} mainWindow Main electron application window for the launcher
     */

    constructor( mainWindow ) {

        // Main electron window of the launcher
        this.mainWindow = mainWindow;

        // Set initial state
        this.launcherState = DefaultState
        this.launcherState.version_launcher = LAUNCHER_VERSION;

        // Base URL to get all remote config & patch data from
        this.configEndpoint = LAUNCHER_DEFAULT_ENDPOINT;

        // Launcher local config / working dir
        this.localStoragePath = path.join(process.env.USERPROFILE, 'Documents','PAXPlus_Launcher');

        // Game INI path
        this.iniPath = path.join(process.env.USERPROFILE, 'Documents', 'My Games', 'Hawken_PAXPlus', 'HawkenGame', 'Config');

        // User config manager
        this.configManager = null;

        // Remote data instances
        this.remoteConfiguration = null;
        this.patchData = null;
        this.serverData = null;

        // Interval to refresh the remote data with
        this.remoteRefreshInterval = null;

        // Register IPC Handlers for renderer interaction
        this.registerHandlers();
    }

    /**
     * Registers all IPC handlers from the LauncherCoreAPI preload contextbridge
     */
    registerHandlers() {

        // Init launcher core
        ipcMain.handle('Core:Init', async () => {
            this.showPage( "loading", { progress: 0.0, loadingText: "Initializing..." } );
            return await this.init_0();
        });

        ///////////////////////////////// BASE FUNCTIONALITY ////////////////////////////////////

        // Open a file selector
        ipcMain.handle('Core:OpenFileDialog', async ( title, basepath ) => {
            return await dialog.showOpenDialog({ properties: ['openDirectory'], title:"Select PAX 'Hawken-PC-Shipping' Folder" });
        });

        // Open a file selector
        ipcMain.handle('Core:finishSetup', async ( title, basepath ) => {
            return await this.finishSetup();
        });

        // Start the game launch sequence
        ipcMain.handle('Core:LaunchGame', async ( event, serverIP ) => {
            return this.launchGame(serverIP);
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

        // Delete a specific userconfig key
        ipcMain.handle('Core:DeleteUserConfigValue', ( event, category, option, value ) => {
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
     * Updates the global launcher state in the renderer process
     */
    pushLauncherStateUpdate(){

        if ( !this.mainWindow || !this.mainWindow.webContents ) {

            throw new Error("[CORE][pushLauncherStateUpdate]: FATAL: mainWindow not loaded.");
        }

        console.log("     |- [STATE]: Pushed to renderer.\r\n")

        this.mainWindow.webContents.send('LauncherStateUpdate', this.launcherState );
    }

    /**
     * Determines whether the launcher is or should be 'offline'. 
     * This makes no statements as to why that is or should be, but rather just sums up certain criteria.
     * 
     * Allows for changing the conditions later on without having to rewrite most the launcherCore's functions :)
     * 
     * @returns {Boolean} Is the launcher offline
     */
    isOffline(){
        return this.launcherState.network_mode !== 0 || this.launcherState.support_status === 'eol';
    }

    getVersionSupportStatus( version = LAUNCHER_VERSION ){

        // Things are very very wrong
        if ( !this.remoteConfiguration ) {

            throw new Error("[CORE][getVersionSupportStatus]: FATAL: Missing core data: remoteConfiguration");
        }

        // No remote data was ever retrieved 
        if ( !this.remoteConfiguration.data ) return 'offline';

        // Malformed remote data / logic mismatch, presume EOL for this launcher
        if ( !this.remoteConfiguration.data.versions ) return 'eol';
        
        if ( this.remoteConfiguration.data.versions.latest === version ) return 'latest';
        if ( this.remoteConfiguration.data.versions.supported.indexOf( version ) >= 0 ) return 'support';
        return 'eol';
    }

    isVersionSupported( version = LAUNCHER_VERSION ) {
        return this.getVersionSupportStatus( version ) != 'eol';
    }

    /**
     * Handles the change of the remote config data. 
     * Will update critical launcher state values according to new remote config data.
     * Dispatches updated launcher state to the renderer.
     * 
     * @param {Object} configData Object with new config data
     */

    async onRemoteConfigUpdate( configData ) {

        // Invalid call guard
        if ( !configData || typeof configData != 'object' ) {

            throw new Error("[UPDATE_REMOTE][CONFIG]: ERROR: Function called without new data object.");
        }
        
        // Update launcher news
        this.launcherState.news = configData.news;

        let support = 'eol';
        if ( configData.versions.latest === LAUNCHER_VERSION ) support = 'latest';
        if ( configData.versions.supported.indexOf( LAUNCHER_VERSION ) >= 0 ) support = 'support';

        // Update support status
        this.launcherState.support_status = support;

        // Set offline mode & disable further remote fetching on end of life launchers
        if ( support === 'eol' ) {

            this.launcherState.network_mode = 1;
            clearInterval( this.remoteRefreshInterval );
        }

        // Update data fetching interval to match the preferred remote setting
        if ( configData.update_interval != this.launcherState.update_interval ) {

            console.log("[UPDATE_REMOTE][CONFIG]: Changing refresh interval from "+this.launcherState.update_interval+" to "+configData.update_interval );
            this.launcherState.update_interval = configData.update_interval;

            clearInterval( this.remoteRefreshInterval );
            this.remoteRefreshInterval = setInterval( () => { this.updateRemoteConfigs() }, configData.update_interval );
        }

        // Push state to renderer
        this.pushLauncherStateUpdate();
        console.log("[UPDATE_REMOTE][CONFIG]: Remote configuration updated");
    }

    /**
     * Handles the change of the remote patch data
     * Will update critical launcher state values according to new remote config data.
     * Dispatches updated launcher state to the renderer.
     * 
     * @param {Object} newPatchData Object containing the new patch package data
     */

    async onRemotePatchUpdate( newPatchData ) {

        // Invalid call guard
        if ( !newPatchData || typeof newPatchData != 'object' ) {

            throw new Error("[UPDATE_REMOTE][PATCH]: ERROR: Function called without new data object.");
        }

        // Update patch version
        this.launcherState.version_patch = newPatchData.meta.version;

        // Push state to renderer
        this.pushLauncherStateUpdate();
        console.log("[UPDATE_REMOTE][PATCH]: Updated to patch "+this.launcherState.version_patch);
    }

    /**
     * Handles the change of the remote settings page layout data.
     * Will update critical launcher state values according to new remote config data.
     * Dispatches updated launcher state to the renderer.
     * 
     * @param {Object} newSettingsData Object containing the new settings page config
     */

    async onRemoteSettingsUpdate( newSettingsData ) {

        // Invalid call guard
        if ( !newSettingsData || typeof newSettingsData != 'object' ) {

            throw new Error("[UPDATE_REMOTE][SETTINGS]: ERROR: Function called without new data object.");
        }

        // Update launcher settings page layout state
        this.launcherState.settings_layout = newSettingsData;

        // Push state to renderer
        this.pushLauncherStateUpdate();
        console.log("[UPDATE_REMOTE][SETTINGS]: Remote settings data updated");
    }

    /**
     * Fetches & updates all remote launcher data: Launcher config, Settings page config & Game patch package.
     * Will temporarily set launcher into offline mode by changing the network mode & keeping the remote update interval going.
     */

    async updateRemoteConfigs() {

        console.log("remoteupdate");
        console.log(this.launcherState.update_interval)

        // Things are very very wrong
        if ( !this.patchData || !this.settingsData || !this.remoteConfiguration ) {

            throw new Error("[CORE][updateRemoteConfigs]: LauncherCore fatal: Missing core data");
        }

        try {

            // Fetch new versions of remote data
            await this.remoteConfiguration.loadFrom('remote'); // RemoteConfiguration should have no local fallback to ensure masterserver connection
            await this.patchData.loadFrom( 'remote', true );
            await this.settingsData.loadFrom( 'remote', true );

            // Reset network mode in case we got the connection back
            if ( this.launcherState.network_mode != 0 ) {
                console.log("[CORE][updateRemoteConfigs]: GOING ONLINE: Masterserver connection restored.");
                this.launcherState.network_mode = 0;
                this.launcherState.support_status = this.getVersionSupportStatus();
                this.launcherState.update_interval = this.remoteConfiguration.data.update_interval || LAUNCHER_OFFLINEPOLLINGRATE;

                // Change to high remote data polling, to speed up reconnection
                clearInterval( this.remoteRefreshInterval );
                this.remoteRefreshInterval = setInterval( () => { this.updateRemoteConfigs() }, this.launcherState.update_interval );

                this.pushLauncherStateUpdate();
            }

            // Failed to fetch on remoteConfig / failed to fetch settings or patch data with no local fallback available
        } catch ( remoteConfigRetrievalError ) {
            
            // Set launcher into offline mode 
            console.log("[CORE][updateRemoteConfigs]: GOING OFFLINE: Failed retrieving remote launcher config.");
            this.launcherState.network_mode = -1;
            this.launcherState.support_status = 'offline'
            this.launcherState.update_interval = LAUNCHER_OFFLINEPOLLINGRATE;

            // Change to high remote data polling, to speed up reconnection
            clearInterval( this.remoteRefreshInterval );
            this.remoteRefreshInterval = setInterval( () => { this.updateRemoteConfigs() }, LAUNCHER_OFFLINEPOLLINGRATE );

            // Push to renderer
            this.pushLauncherStateUpdate();
        }

    }

    /**
     * Fetches the current launcher userConfig containing all user & launcher specific settings
     * @returns Launcher userConfig object
     */

    async getUserConfig() {

        // Called without manager init
        if ( !this.configManager ) {

            throw new Error("[getUserConfig]: FATAL! configManager not initialized.");
        }

        // No config present, not even default template: Something is severely wrong
        if ( !this.configManager.config ) {

            throw new Error("[getUserConfig]: FATAL! configManager has no config loaded.");
        }

        return this.configManager.config;
    }

    /**
     * Returns the value for a specific key under the specified section in the launchers userConfig.
     * 
     * @param {String} category userConfig section of the key
     * @param {String} option userConfig key in the section
     * @returns Value of the given key in the specified section
     */

    async getUserConfigValue( category, option ) {

        // Called without manager init
        if ( !this.configManager ) {

            throw new Error("[getUserConfigValue]: FATAL! configManager not initialized.");
        }

        return this.configManager.getOption( category, option );
    }

    /**
     * Sets the value for a specific key in a specified section of the launchers userConfig
     * 
     * @param {String} category userConfig section of the key
     * @param {String} option userConfig key to set the value of
     * @param {*} value Value to set
     */

    async setUserConfigValue( category, option, value ) {

        // Called without manager init
        if ( !this.configManager ) {
            
            throw new Error("[setUserConfigValue]: FATAL! configManager not initialized.");
        }

        return this.configManager.setOption( category, option, value );
    }

    /**
     * Deletes a specific key-value pair in a given section of the launcher userConfig
     * 
     * @param {String} category 
     * @param {String} option 
     */

    async deleteUserConfigValue( category, option) {

        // Called without manager init
        if ( !this.configManager ) {

            throw new Error("[setUserConfigValue]: FATAL! configManager not initialized.");
        }

        return this.configManager.deleteOption( category, option );
    }

    /**
     * Get the currently loaded patch version
     * @returns Version string of the patch
     */

    async getPatchVersion() {

        if ( !this.patchData ) {

            throw new Error("[getPatchVersion]: FATAL! patchData not initialized.");
        }

        if ( !this.patchData.data ) {

            throw new Error("[getPatchVersion]: FATAL! No patch data loaded.");
        }

        // If a patch is loaded
        if ( this.patchData.data.meta && this.patchData.data.meta.version ) {

            return this.patchData.data.meta.version;
        } 

        // No loaded patch
        return "";
    }

    /**
     * Fetches the current server listings data from the remote server list endpoint
     * @returns Server listings object
     */

    async getServers() {

        // Called without manager init
        if ( !this.serverData ) {

            throw new Error("[getServers]: FATAL! serverData not initialized.");
        }

        console.log("\r\n============ Core: GetServers =============");
        console.log("[GetServers]: Fetching listings...");

        try {

            // Specifically load the serverdata from remote only
            await this.serverData.loadRemote();
            console.log("[GetServers]: Got %s servers", Object.keys( this.serverData.data ).length );

        } catch ( serverRefreshError ) { // Failed fetching server list data

            console.log("[GetServers]: ERROR: Failed retrieving server list data");

            // Return to the main menu instead of the play screen to prevent a potential infinite fail loop
            this.showPage( "menu/error", { 
                errorHeading: `Failed fetching server list.`, 
                errorMessage: serverRefreshError.message, 
                actionName:"OK", 
                actionURL: "/menu" 
            });

        }
        
        return this.serverData.data;
    }

    /**
     * Fetches the game settings page layout & value configuration object from the remote data endpoint.
     * @returns Settings page configuration object
     */

    async getGameSettingsBaseConfig() {

        if ( !this.settingsData ) {

            throw new Error("[getGameSettingsBaseConfig]: FATAL! settingsData not initialized.");
        }

        console.log("\r\n=========== GetGameSettingsBase ===========");
        return this.settingsData.data;
    }

    /**
     * Fetches the currently set value for an option in the settings page config object.
     * Will try retrieving the data from the launcher userConfig first, but will fall back to the correct ini file otherwise.
     * 
     * @param {String} optionCategoryName Settings page config section of the option
     * @param {String} optionCfgName Key name of the option in the settings page config
     * @returns Currently set value for the game option
     */

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

            let iniLoader = null

            try {

                // Load game ini & get the needed value
                iniLoader = new IniFilePatcher( path.join( this.iniPath, `${setting.ini.file}.ini` ) )

            } catch ( iniLoadError ) {

                let err = { 
                    errorHeading: `Fatal settings error - restart launcher.`, 
                    errorMessage: iniLoadError.message, 
                    actionName:"OK", 
                    actionURL: "/menu/play" 
                };
                this.showPage( "menu/error", err );
                return null;
            }
            
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

                    // Convert from RGB% of 255 to R,G,B float values
                    for ( const k in setting.ini.key ) {

                        let iniColorPercent = iniLoader.getValue( setting.ini.section, setting.ini.key[k] );
                        let colorValue = Math.floor( ( iniColorPercent / 100 ) * 255 )
                        rgbValues.push( colorValue );
                    }
                    // Convert RGB float values to hex for passing to the color swatch component
                    value = rgbToHex( ...rgbValues );
                    break;
            }

        }

        console.log("[GetGameSetting]: %s %s = %s", debug_dataSource, optionCfgName, value );

        return value;
    }

    /**
     * Sets a game option in the launchers userConfig to the given value
     * @param {String} key Key name to set the option value under
     * @param {*} value Value to set the userConfig key to
     */

    setGameSetting( key, value ) {

        // Called without manager init
        if ( !this.configManager ) {

            throw new Error("[setGameSetting]: FATAL! configManager not initialized.");
        }
        if ( !this.configManager.config ) {

            throw new Error("[setGameSetting]: FATAL! configManager has no config loaded.");
        }

        return this.configManager.setOption( "game", key, value );
    }

    /**
     * Saves current in-memory user configuration to the userConfig file
     */

    saveGameSettings() {

        // Called without manager init
        if ( !this.configManager ) {

            throw new Error("[saveGameSettings]: FATAL! configManager not initialized.");
        }
        if ( !this.configManager.config ) {

            throw new Error("[saveGameSettings]: FATAL! configManager has no config loaded.");
        }

        console.log("//////////// SaveGameSettings /////////////")
        return this.configManager.saveConfig()
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
     * Patch the game if needed & launch
     * 
     * @param {String} serverIP (Optional) Server IP to connect to after game start
     */

    async launchGame( serverIP ) {


        let onScreenError = { 
            errorHeading: "Unable to patch game.", 
            errorMessage: "An unknown error occurred", 
            actionName:"OK", 
            actionURL: "/menu/play" 
        };

        this.showPage( "menu/loading", { progress: 0.0, loadingText: "Starting." } );

        let gameRunning = await this.patchManager.isGameRunning();

        // GAME RUNNING: CANCEL LAUNCH
        if ( gameRunning ) {
            
            onScreenError.errorHeading = "Game is already running.";
            onScreenError.errorMessage = "Please close the running instance and try again.";
            return this.showPage( "menu/error", onScreenError );
        }

        let gameInstallationDirectory = this.configManager.getOption("launcher","gamePath");

        // Something is wrong with the game directory
        if ( !gameInstallationDirectory || !fs.existsSync( gameInstallationDirectory ) ) {

            onScreenError.errorHeading = "Invalid game directory.";
            onScreenError.errorMessage = "Try again or reset game folder in the options menu";
            return this.showPage( "menu/error", onScreenError );
        }

        // INI directory doesn't exist
        if ( !fs.existsSync( this.iniPath ) ) {

            onScreenError.errorHeading = "Invalid game directory.";
            onScreenError.errorMessage = this.iniPath+" does not exist";
            return this.showPage( "menu/error", onScreenError );
        }

        this.patchManager.setGamePath( gameInstallationDirectory );
        this.patchManager.setIniPath( this.iniPath );

        // UPDATE & SET PATCH DATA
        this.showPage( "menu/loading", { progress: 0.2, loadingText: "Loading patch data" } );
        //await this.patchData.loadFrom( 'remote', true );        
        if ( !this.isOffline() ) await this.updateRemoteConfigs();
        this.patchManager.setPatchGoal( this.patchData.data );


        try {
            // Perform upk & base ini patching
            this.showPage( "menu/loading", { progress: 0.4, loadingText: "Patching game..." } );

            let shouldWipeMechs = this.configManager.getOption("launcher","clearmechsetups");
            if ( shouldWipeMechs == undefined || shouldWipeMechs == null ) shouldWipeMechs = true;

            await this.patchManager.patchGame( shouldWipeMechs );

            this.configManager.setOption( "launcher", "clearmechsetups", false );
            
            // Apply userCfg values over base-patched inis
            this.showPage( "menu/loading", { progress: 0.4, loadingText: "Applying user settings..." } );
            await this.patchManager.applyUserConfig( this.configManager, this.settingsData.data );
            
        } catch ( patchingError ) {

            let errorDisplayTitle = "Unable to patch game.";

            switch( patchingError.code ) {

                case "ENOENT":
                    errorDisplayTitle = "Missing game files."
                    break;
                
                case "EHASH":
                    errorDisplayTitle = "Missing vanilla backup files."
                    break;
            }

            console.log( patchingError );
            onScreenError.errorHeading = errorDisplayTitle;
            onScreenError.errorMessage = patchingError.message;
            onScreenError.actionName = "Proceed";
            return this.showPage( "menu/error", onScreenError );
        }
        
        this.showPage( "menu/loading", { progress: 0.8, loadingText: "Starting game..." } );

        this.launcherState.game_running = true;
        this.pushLauncherStateUpdate();


        let userGameArgs = this.configManager.getOption("launcher","gameStartupArgs");
        let gameArgs = [];

        if( serverIP ) gameArgs.push( serverIP );

        if ( userGameArgs && userGameArgs.length > 0 ) gameArgs = gameArgs.concat( userGameArgs.split(" "));

        this.showPage( "menu/play");

        let output = "";

        try {

            output = await this.patchManager.startGame( gameArgs );

        } catch ( gameLaunchError ) {

            let err = { 
                errorHeading: "Failed to launch game.", 
                errorMessage: "Please contact support. Exit code: "+output, 
                actionName:"OK", 
                actionURL: "/menu/play" 
            };

            if ( gameLaunchError == "3221225781") {

                err.errorMessage = "UE3Redist is missing. Please install it before launching."
            }
            return this.showPage( "menu/error", err );

        } finally {

            console.log("Game quit: ")
            console.log( output );

            this.launcherState.game_running = false;
            this.pushLauncherStateUpdate();
        }
        
    }

    /**
     * Callback handler for when the first time setup experience exits
     * Maybe do more things here later...
     */

    async finishSetup(){
        
        // Proceed to next init step
        await this.init_1();
    }

    /**
     * Launcher initialization: First stage
     * Loads the launcher userConfig & decides to either proceed or boot into the first time setup experience.
     * Will also reset userConfig if corrupt.
     * @returns Launcher state object after the initial boot stage
     */

    async init_0() {

        console.log("\r\n============ Core: INIT-0 =============");

        this.showPage( "loading", { progress: 0.1, loadingText: "User configuration." } );

        try {

            this.configManager = new ConfigManager( path.join( this.localStoragePath, 'userConfig.json' ) );
            
        } catch ( userConfigLoadError ) {

            console.log(userConfigLoadError);

            let err = { 
                errorHeading: `Launcher user configuration corrupt.`, 
                errorMessage: "Your settings have been reset.", 
                actionName:"ACKNOWLEDGE", 
                actionURL: "/welcome"
            };

            fs.rmSync(path.join( this.localStoragePath, 'userConfig.json' ));
            this.configManager = new ConfigManager( path.join( this.localStoragePath, 'userConfig.json' ) );

            return this.showPage( "error", err );

        } 
        console.log( "[CORE][INIT_0][1]: UserConfig loaded.");

        // Check if game
        let gameInstallationDirectory = this.configManager.getOption("launcher","gamePath");
        console.log( "[CORE][INIT_0][2]: Game Path: "+gameInstallationDirectory );

        // Something is wrong with the game directory, return to FTUE
        if ( !gameInstallationDirectory || !fs.existsSync( gameInstallationDirectory ) ) {
            this.configManager.setOption( "launcher", "clearmechsetups", true );
            return this.showPage("welcome");
        }
        
        console.log( "[CORE][INIT_0][3]: ALL SYSTEMS GO, PROCEED TO INIT_1");
        await this.init_1();
        return this.launcherState;
    }

    /**
     * Launcher initialization: Second stage
     * Patches DefaultEngine.ini to always point to the custom "Hawken_PAXPlus" Documents ini folder to prevent collisions with other hawken clients
     * Generates game ini files by silently running the game in server mode & will trigger the UE3Redist setup if the user is missing redistributables to run the game
     */
    async init_1() {

        // Basic init
        console.log("\r\n============ Core: INIT-1 =============");

        // Game install directory
        let gameInstallationDirectory = this.configManager.getOption("launcher","gamePath");

        // Default hawken ini directory
        this.iniPath = path.join(process.env.USERPROFILE, 'Documents', 'My Games', 'Hawken_PAXPlus', 'HawkenGame', 'Config');

        // Allow for custom documents directories on other drives / in other folders
        let customDocuments =  this.configManager.getOption("launcher","documentsPath");
        if ( customDocuments ) this.iniPath = path.join( customDocuments, 'My Games', 'Hawken_PAXPlus', 'HawkenGame', 'Config' );

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

            fs.mkdirSync(this.iniPath,{ recursive: true });
            this.showPage( "loading", { progress: 0.2, loadingText: "Performing first time setup. (This might take a up to a minute)" } );
            
            try {

                let setupResult = await this.patchManager.generateUserInis();
                console.log("[SETUPRESULT]: "+setupResult)

            } catch( errorCode ) {

                let installError = {
                    errorHeading: "Failed to run game for the first time: ",
                    errorMessage: "Setup exited with exit code "+errorCode
                }

                // Missing UE3 Redist
                if ( errorCode == "3221225781" ) {

                    // UE3Redist setup file missing
                    if ( !fs.existsSync( path.join( gameInstallationDirectory, "Binaries", "Redist", "UE3Redist.exe" ) ) ) {

                        installError.errorHeading = "Microsoft Visual C++ 2010 not installed";
                        installError.errorMessage = "Download and install Microsoft Visual C++ 2010 runtimes."
                        return this.showPage( "error", installError );

                    } else { // Setup exists, let's continue

                        installError.errorHeading = "UE3Redist not installed.";
                        installError.errorMessage = "Please run Binaries/Redist/UE3Redist.exe and restart the launcher."
                        this.showPage( "error", installError );

                        let result = dialog.showMessageBoxSync({ 
                            title:"Missing Unreal 3 redistributables",
                            message: "The PAX client requires Unreal Engine 3 redistributables to be installed. \r\nInstall now?",
                            type: "error",
                            buttons: ["Install","Cancel"],
                        });

                        // User hit cancel, cease all init
                        if ( result !== 0 ) return; 


                        let redistResult = null;

                        // Perform setup
                        try {

                            redistResult =  await this.patchManager.setupUE3Redist();

                            if ( redistResult !== 0 ) return;

                            // Retry first time setup
                            await this.init_1();

                        } catch ( redistError ) {

                            installError.errorHeading = "FATAL: Installation failed.";
                            installError.errorMessage = redistError.message
                            return this.showPage( "error", installError );
                        }


                    }

                    
                }
                
            }
            
        }

        this.showPage( "loading", { progress: 0.2, loadingText: "Patching systems." } );

        console.log( "[CORE][INIT_1][3]: ALL SYSTEMS GO, PROCEED TO INIT_2");
        return await this.init_2()

    }

    /**
     * Launcher initialization: Final Stage
     * Sets main launcher operating mode based on internet connectivity, locally saved data & version lifecycle status
     * Attempts to load the freshest settings, gamePatch & config data from the remote endpoint if available.
     * Attempts to load patch & settings data from locally saved copies, if offline
     */

    async init_2() {

        console.log("\r\n============ Core: INIT-2 =============");


        this.remoteConfiguration = new RemoteDataManager( this.configEndpoint+"/launcherConfig.json", { requestHeaders: LAUNCHER_HEADERS, onChange: (newData) => this.onRemoteConfigUpdate( newData )} );

        // Launcher is still compatible for remote patching: Get patch package
        this.patchData = new RemoteDataManager( this.configEndpoint+"/gamePatch.json", { localPath: this.localStoragePath, requestHeaders: LAUNCHER_HEADERS, onChange: (newData) => this.onRemotePatchUpdate( newData ) } );
        this.settingsData = new RemoteDataManager( this.configEndpoint+"/gameSettings.json", { localPath: this.localStoragePath, requestHeaders: LAUNCHER_HEADERS, onChange: (newData) => this.onRemoteSettingsUpdate( newData )} );


        this.showPage( "loading", { progress: 0.3, loadingText: "Launcher configuration." } );

        let remoteConfigError = null;
        await this.remoteConfiguration.loadFrom('remote', false ).catch( ( error ) => { remoteConfigError = error } );


        let offlineBoot = false;
        let offlineBootError = {
            errorHeading: "FATAL UNKNOWN BOOT ERROR",
            errorMessage: "Reinstall the launcher."
        }

        if ( remoteConfigError ) {

            console.log("ERROR OBTAINING REMOTE CONFIG")
            console.log(remoteConfigError)
            this.launcherState.network_mode = -1;
            this.launcherState.support_status = "offline";

            offlineBootError.errorHeading = "No internet connection";
            offlineBootError.errorMessage = "The first startup of the launcher requires an internet connection to download the patch data. Subsequent startups can be performed offline.";

            offlineBoot = true;
        } 

        if ( !remoteConfigError && !this.isVersionSupported() ) {

            console.log("VERSION IS EOL");
            console.log(remoteConfigError)

            this.launcherState.network_mode = 1;
            this.launcherState.support_status = 'eol';

            offlineBootError.errorHeading = "Launcher end of life.";
            offlineBootError.errorMessage = "You are trying to install a critically outdated launcher. Please download a newer version.";

            offlineBoot = true;
        }
        

        if ( offlineBoot ) {

            try {

                this.showPage( "loading", { progress: 0.6, loadingText: "Game patch data." } );
                await this.patchData.loadFrom( 'local', false );
                await this.settingsData.loadFrom( 'local', false );
                
            } catch ( localLoadError ) {

                return this.showPage( "error", offlineBootError );
            }

        } else {
            
            try { // Load settings & patch data remotely

                this.showPage( "loading", { progress: 0.6, loadingText: "Game patch data." } );
                await this.patchData.loadFrom( 'remote', true );
                await this.settingsData.loadFrom( 'remote', true );

                this.serverData = new RemoteDataManager( this.remoteConfiguration.data.masterserver_url+"/serverListings", {requestHeaders: LAUNCHER_HEADERS});
                
            } catch ( remoteFetchError ) {

                return this.showPage( "error", {
                    errorHeading: "Failed obtaining patch information",
                    errorMessage: "An error occurred acquiring the patch data from the server."
                });
            }

            this.launcherState.network_mode = 0;
            this.launcherState.support_status = this.getVersionSupportStatus();

        }

        console.log( "[CORE][INIT_2][3]: Loaded patch %s from %s", this.patchData.data.meta.version, this.patchData.dataSource );
        console.log( "[CORE][INIT_2][3]: Loaded gameSettings from %s", this.settingsData.dataSource );


        this.showPage( "loading", { progress: 1.0, loadingText: "Loading complete." } );

        console.log("/////////// CORE INIT COMPLETE ////////////");
        console.log("");
        console.log("[CORE][INIT_2][FINAL]: Fetching patch & settings data.")

        // Set initial state after startup
        this.launcherState.version_launcher = LAUNCHER_VERSION;
        this.launcherState.version_patch = await this.getPatchVersion();
        this.launcherState.settings_layout = await this.getGameSettingsBaseConfig();
        this.pushLauncherStateUpdate();

        // Load menu after dispatching state
        this.showPage("menu");
        
        // Schedule regular remote update intervals
        if ( !this.isOffline() ) {

            if ( !this.remoteRefreshInterval ) {

                this.remoteRefreshInterval = setInterval( () => { this.updateRemoteConfigs() }, this.launcherState.update_interval );
            }

        }
    }

}

module.exports = LauncherCore;
const fs = require('fs');
const path = require('path');
const util = require('util');
const { spawn, exec } = require('child_process');
const { createBackup, restoreBackup, getHash } = require('./fileUtils.js');


const binaryFilePatcher = require('./binaryFilePatcher');
const IniFilePatcher = require('./iniFilePatcher');
const MechsetupPatcher = require('./mechsetupPatcher.js');
const upkFilePatcher = require('./upkFilePatcher.js');


// const exec = require('child_process').exec;


/**
 * UTIL: Sleep for the specified of time
 * @param {Number} ms Time in MS to sleep for
 * @async
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isRunning(win, mac, linux){
    return new Promise(function(resolve, reject){
        const plat = process.platform
        const cmd = plat == 'win32' ? 'tasklist' : (plat == 'darwin' ? 'ps -ax | grep ' + mac : (plat == 'linux' ? 'ps -A' : ''))
        const proc = plat == 'win32' ? win : (plat == 'darwin' ? mac : (plat == 'linux' ? linux : ''))
        if(cmd === '' || proc === ''){
            resolve(false)
        }
        exec(cmd, function(err, stdout, stderr) {
            resolve(stdout.toLowerCase().indexOf(proc.toLowerCase()) > -1)
        })
    })
}

/**
 * Coordinates all game patch operations. 
 * Validates game file patch status and applies game patches from a json as a patch target.
 */
class PatchManager {

    /**
     * Creates a new instance of the PatchManager class
     * 
     * @param {String} gamePath Root folder path of the game 
     * @param {String} iniPath  Root folder path of the game ini files
     * @param {String} localStoragePath Path to store temporary patch data in ( usually the launcher settings directory )
     */
    constructor( gamePath, iniPath, localStoragePath ) {

        this.gamePath = gamePath;
        this.iniPath = iniPath;
        this.localStoragePath = localStoragePath;
    }

    /**
     * Sets the target game folder of the patchmanager
     * @param {String} gamePath Root folder path of the game
     */
    setGamePath( gamePath ) {
        this.gamePath = gamePath;
    }

    /**
     * Sets the target ini folder of the patchmanager
     * @param {String} gamePath Root folder path of the game ini files
     */
    setIniPath( iniPath ) {
        this.iniPath = iniPath;
    }

    /**
     * Sets the patch data containing all patch steps, required in order to patch the game
     * @param {Object} patchConfig 
     */
    setPatchGoal( patchConfig ) {

        this.patchConfig = patchConfig;
    }

    /**
     * Checks whether or not there is an instance of HawkenGame-Win32-Shipping already running
     * @returns {Boolean} Is an instance of HawkenGame-Win32-Shipping running?
     */
    async isGameRunning() {
        let isGameRunning = await isRunning("HawkenGame-Win32-Shipping");
        return isGameRunning;
    }

    /**
     * Starts the game as its own independent process
     * 
     * @param {Array} parameters Launch parameters for the game
     */
    async startGame( parameters = []){

        let exePath = path.join(this.gamePath,"Binaries","Win32" ,"HawkenGame-Win32-Shipping.exe");

        let command = `${exePath} ${parameters.join(" ")}`
        exec(command, function(err, stdout, stderr) {});
    }

    /**
     * Generates the game inis in 'My Documents' by silently running the game in server mode for 4 seconds
     */
    async generateUserInis(){

        const child = spawn(path.join(this.gamePath,"Binaries","Win32" ,"HawkenGame-Win32-Shipping.exe"), ["Server","Andromeda_DM"],{
            windowsHide: true,
            shell: false,
            stdio: false,
        });

        await sleep(4000);
        child.kill('SIGINT');
    }

    /**
     * Coordinates & performs all patch operations stored within the currently loaded patch config.
     * Patches the game completely.
     */
    async patchGame() {

        let isGameRunning = await this.isGameRunning();

        if ( isGameRunning ) throw new Error("Game is already running!");

        console.log("\r\n-------------- PATCHING GAME ---------------");

        for ( let i in this.patchConfig.operations ) {

            let patchOperation = this.patchConfig.operations[i];
            let actions = patchOperation.actions;

            let filePath = null

            if ( patchOperation.filePath ) filePath = path.join( this.gamePath, patchOperation.filePath );

            console.log(patchOperation)
            // Skip patching files that already have the correct hashes
            if ( filePath ) {

                let fileHashPatched = this.patchConfig.meta.targetHashes[patchOperation.filePath]
                let fileHashActual = await getHash( filePath );

                if ( fileHashPatched === fileHashActual ) {
                    console.log("SKIPPING "+patchOperation.operationType+" patch for "+patchOperation.filePath );
                    continue;
                }
            }
            
            switch ( patchOperation.operationType ) {

                case 'binaryFilePatcher':
                    console.log("binaryFilePatch")
                    await this.patchUnrealArchive( filePath, actions, patchOperation);
                    break;

                case 'iniFilePatcher':
                    
                    // Normal ini file path
                    console.log("iniFilePatch")
                    filePath = path.join( this.iniPath, patchOperation.file );
                    
                    console.log(patchOperation.file)
                    //Regenerate missing inis from defaults
                    //if ( patchOperation.file.startsWith("Hawken") && !fs.existsSync( filePath ) ) fs.copyFileSync( path.join( this.gamePath, "HawkenGame", "Config", patchOperation.file.replace("Hawken","Default") ), filePath );

                    // Change path for patching default inis
                    if ( patchOperation.file.startsWith("Default") ) filePath = path.join( this.gamePath, "HawkenGame", "Config", patchOperation.file );
                    await this.patchIniFile( filePath, patchOperation.actions );
                    break;

                case 'mechsetupPatcher':
                    filePath = path.join( this.gamePath, "HawkenGame", "MechSetup_default.txt" );
                    const mechsetupFile = new MechsetupPatcher( filePath );
                    await mechsetupFile.patchAllMechsetupData( JSON.parse( patchOperation.data ) );
                    await mechsetupFile.saveSetup();
                    break;

                case 'upkUtilsPatcher':

                    let unexpectedDataError = new Error("upkUtilsPatcher: FATAL: Patch data corrupt ",{code:"PATCH_CORRUPT"});

                    if ( !patchOperation.data ) {
                        unexpectedDataError.message += "(patchOperation.data)";
                        throw unexpectedDataError;
                    }
                    console.log("upkUtilsPaatcher")

                    filePath = path.join( this.gamePath, "HawkenGame", "CookedPC" );
                    let tempPatchFilePath = path.join( this.iniPath, "patch.txt");
                    await fs.writeFileSync( tempPatchFilePath, patchOperation.data );
                    const upkPatcher = new upkFilePatcher( filePath, tempPatchFilePath );

                    let result = await upkPatcher.patchUPK();
                    console.log(result.stdout);
                    break;

            }

        }
    }

    /**
     * Applies custom userCfg setting overrides (FOV, etc.) to the corresponding game inis.
     * Uses the settings page JSON for mapping the values to the ini files.
     * 
     * @param {ConfigManager} userConfigManager Launcher userCfg management class instance
     * @param {Object} settingsDataObject Settings page JSON
     * @async
     */
    async applyUserConfig( userConfigManager, settingsDataObject ) {

        let unexpectedDataError = new Error("applyUserConfig: FATAL: Core data corruption ", {code:"LAUNCHER_CORRUPT"});

        if ( !userConfigManager ) {
            unexpectedDataError.message += "(userConfigManager)";
            throw unexpectedDataError;
        }
        if ( !settingsDataObject || typeof settingsDataObject !== 'object' ) {
            unexpectedDataError.message += "(settingsDataObject)";
            throw unexpectedDataError;
        }
        
        console.log("--------- Applying User Settings --------")

        for ( let settingsSection in settingsDataObject ) {

            for ( let settingsKey in settingsDataObject[settingsSection] ) {

                // Fetch settings value from userCfg, skip applying this setting if no value is saved.
                const userCfgValue = userConfigManager.getOption( "game", settingsKey );
                if ( !userCfgValue ) continue;

                // All settings data for this particular game option
                const settingData = settingsDataObject[settingsSection][settingsKey];

                // Catch improper settings object
                if ( !settingData.ini || !settingData.ini.section || !settingData.ini.key || !settingData.ini.file ) {

                    throw new Error(`[applyUserConfig]: Missing ini configuration data for option '${settingsKey}'`);
                }

                // Open corresponding ini file
                const iniFilePath = path.join( this.iniPath, settingData.ini.file+".ini" );
                const iniFile = new IniFilePatcher( iniFilePath );

                // What key to patch in what section
                const iniSection = settingData.ini.section;
                const iniKey = settingData.ini.key;

                // Change write behavior depending on option type ( because value formats differ per type )
                switch ( settingData.type ) {

                    default:

                        // Single key is being set to single value, easiest setting scenario
                        iniFile.setValue( iniSection, iniKey, userCfgValue )
                        console.log(`[ ${settingData.ini.file} ][${iniSection}] ${settingData.ini.key} = ${userCfgValue}`);
                        break;

                    case 'color':

                        // Improper settings config
                        if ( iniKey.constructor !== Array || iniKey.length < 3 ) {
                            throw new Error(`[applyUserConfig]: Malformed settings object for option '${settingsKey}'`);
                        }

                        // Convert hex to RGB% when writingt colors to ini
                        const r = ( parseInt(userCfgValue.substr(1,2), 16) / 255 ) * 100;
                        const g = ( parseInt(userCfgValue.substr(3,2), 16) / 255 ) * 100;
                        const b = ( parseInt(userCfgValue.substr(5,2), 16) / 255 ) * 100;
                        
                        iniFile.setValue( iniSection, iniKey[0], r );
                        iniFile.setValue( iniSection, iniKey[1], g );
                        iniFile.setValue( iniSection, iniKey[2], b );

                        console.log(`[ ${settingData.ini.file} ] ${settingData.ini.key[0]} = ${r}`);
                        console.log(`[ ${settingData.ini.file} ] ${settingData.ini.key[1]} = ${g}`);
                        console.log(`[ ${settingData.ini.file} ] ${settingData.ini.key[2]} = ${b}`);
                        break;

                    case 'list':
                    	
                        // Improper settings config
                        if ( iniKey.constructor !== Array || !settingData.listOptions || settingData.listOptions.constructor !== Array ) {
                            throw new Error(`[applyUserConfig]: Malformed settings object for option '${settingsKey}'`);
                        }

                        // Find the object that stores all key values in the listOptions array
                        let valuesObject = settingData.listOptions.find( listItem => listItem.name === userCfgValue ).data;

                        // Loop through all keys in the ini key array
                        for ( let i in iniKey ) {

                            // Set all the keys to their corresponding values in the listOptions object array
                            iniFile.setValue( iniSection, iniKey[i], valuesObject[ iniKey[i] ] );
                            console.log(`[ ${settingData.ini.file} ][${iniSection}] ${iniKey[i]} = ${valuesObject[ iniKey[i] ]}`);
                        }
                        break;
                }

                // Write ini changes to file
                await iniFile.saveConfig();
            }
        }
    }

    /**
     * Patches an ini file at {filePath} with the section & key-value assignments contained in {actions}
     * 
     * @param {String} filePath Path of the ini file
     * @param {Array} actions Array of objects containing the ini section, key & value to patch
     * @async
     */
    async patchIniFile( filePath, actions ) {

        let unexpectedDataError = new Error("patchIniFile: FATAL: Patch data corrupt ", {code:"PATCH_CORRUPT"});

        if ( !filePath ) {
            unexpectedDataError.message += "(filePath)";
            throw unexpectedDataError;
        }
        if ( !actions || actions.constructor !== Array ) {
            unexpectedDataError.message += "(actions)";
            throw unexpectedDataError;
        }

        const iniFile = new IniFilePatcher( filePath );

        await actions.map( action => {
                        
            iniFile.setValue( action.section, action.key, action.value );
        });

        iniFile.saveConfig();
        console.log( `[INI][${path.basename( filePath )}] Patched.`);
    }

    /**
     * Performs a binary patch on a file
     * 
     * @param {String} filePath Path to the target file
     * @param {Array} replacements Array of objects containing the memory address, original sequence of bytes & bytes to change that sequence to
     * @param {Object} patchOperationData The complete object describing the patch operation, contains important metadata for the binary patch operation
     * @async
     */
    async patchUnrealArchive( filePath, replacements, patchOperationData ) {

        let unexpectedDataError = new Error("patchUnrealArchive: FATAL: Patch data corrupt ",{code:"PATCH_CORRUPT"});

        if ( !filePath ) {
            unexpectedDataError.message += "(filePath)";
            throw unexpectedDataError;
        }
        if ( !replacements || replacements.constructor !== Array ) {
            unexpectedDataError.message += "(replacements)";
            throw unexpectedDataError;
        }
        if ( !patchOperationData || patchOperationData.constructor !== Object ) {
            unexpectedDataError.message += "(patchOperationData)";
            throw unexpectedDataError;
        }
     
        // File missing? Let's try the backup
        if ( !fs.existsSync( filePath ) ) await restoreBackup( filePath );

        let fileHash = await getHash( filePath );
        console.log(fileHash)
        if ( fileHash === patchOperationData.patchAppliedHash ) {
            console.log( "[UPK]["+path.basename( filePath )+"] SKIP (Already patched)");
            return;
        }
        if ( fileHash != patchOperationData.requiredHash ) {
            console.log( "[UPK]["+path.basename( filePath )+"] RESTORE (Not baseline)");
            await restoreBackup( filePath );
        }
        
        await replacements.map( action => {
                        
            action.offset = parseInt( action.offset );
            if ( action.from ) action.from = Buffer.from( action.from );
            if ( action.to ) action.to = Buffer.from( action.to );
        });

        let filePatcher = new binaryFilePatcher( filePath, replacements, patchOperationData.fileOriginalSize );
        await filePatcher.decompress( filePath, patchOperationData.fileOriginalSize );
        console.log( "[UPK]["+path.basename( filePath )+"] DECOMPRESSED");
        await filePatcher.applyAllPatches();
        console.log( "[UPK]["+path.basename( filePath )+"] DONE!\r\n");
    }
}

module.exports = PatchManager;
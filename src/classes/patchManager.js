const fs = require('fs');
const path = require('path');
const util = require('util');

const { createBackup, restoreBackup, getHash } = require('./fileUtils.js');

const exec = require('child_process').exec;

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

const binaryFilePatcher = require('./binaryFilePatcher');
const IniFilePatcher = require('./iniFilePatcher');

/**
 * Coordinates all game patch operations. 
 * Validates game file patch status and applies game patches from a json as a patch target.
 */
class PatchManager {


    constructor( gamePath, iniPath, localStoragePath ) {

        this.gamePath = gamePath;
        this.iniPath = iniPath;
        this.localStoragePath = localStoragePath;
    }

    setGamePath( gamePath ) {
        this.gamePath = gamePath;
    }

    setIniPath( iniPath ) {
        this.iniPath = iniPath;
    }


    setPatchGoal( patchConfig ) {

        this.patchConfig = patchConfig;
    }


    isGamePatched() {

        for ( let i in this.patchConfig.operations ) {

            if ( this.patchConfig.operations[i].operationType != "binaryFilePatcher" ) continue;
            let filePath = path.join( this.gamePath, this.patchConfig.operations[i].filePath);

            if ( !this.isFilePatched( filePath, this.patchConfig.operations[i].patchAppliedHash ) ) return false;

        }

        return true;
    }

    async isGameRunning() {
        let isGameRunning = await isRunning("HawkenGame-Win32-Shipping");
        return isGameRunning;
    }

    async isFileOriginal( filePath, targetSize ) {


    }

    async patchGame() {

        let isGameRunning = await this.isGameRunning();

        if ( isGameRunning ) throw new Error("Game is already running!")

        console.log("\r\n-------------- PATCHING GAME ---------------");

        for ( let i in this.patchConfig.operations ) {

            let patchOperation = this.patchConfig.operations[i];
            let actions = patchOperation.actions;

            let filePath = null;
            
            switch ( patchOperation.operationType ) {

                case 'binaryFilePatcher':
                    filePath = path.join( this.gamePath, patchOperation.filePath );
                    await this.patchUnrealArchive( filePath, actions, patchOperation);
                break;

                case 'iniFilePatcher':
                    filePath = path.join( this.iniPath, patchOperation.file );
                    await this.patchIniFile( filePath, patchOperation.actions );
                break;
            }

        }

    }

    async applyUserConfigValues() {
        


    }

    async patchIniFile( filePath, actions ) {
        console.log("GOT "+filePath)
        let filePatcher = new IniFilePatcher( filePath );

        await actions.map( action => {
                        
            filePatcher.setValue( action.section, action.key, action.value );
        });

        filePatcher.saveConfig();
        console.log( "[INI]["+path.basename( filePath )+"] Patched.");
    }

    async patchUnrealArchive( filePath, replacements, patchOperationData ) {

        if ( !fs.existsSync( filePath ) ) await restoreBackup( filePath );

        let fileHash = await getHash( filePath);

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
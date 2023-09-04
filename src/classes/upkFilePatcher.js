const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);


const UPK_PATCH_TOOL= "./PatchUPK.exe";

class upkFilePatcher {

    /**
     * Creates a new instance of the upkFilePatcher class.
     * @constructor
     * @param {string} packageDirectory - Path to the game upk packages
     * @param {String} patchDataStorageDirectory - Directory to store the file containing the patch operations in
     * @param {String} patchData - The patch operations to perform
     */
    constructor( packageDirectory, patchDataStorageDirectory, patchData ) {
        this.upkDir = packageDirectory;
        this.tempDir = patchDataStorageDirectory;
        this.patchData = patchData;
    }

    /**
     * Sets / changes the patch operation data of the upkFilePatcher class
     * @param {String} patchdata - Patch operations text data for the upkPatcher
     */
    setPatchdata( patchdata ) {
        this.patchData = patchdata;
    } 

    /**
     * Sets / changes the upk package directory of the upkFilePatcher class
     * @param {String} upkDir - Game packages directory 
     */
    setUpkDirectory( upkDir ) {
        this.upkDir = upkDir
    }

    /**
     * Perform the upk patch with the set patch data
     * @param {*} upkDirectory 
     * @param {*} patchFilePath 
     * @returns 
     */
    async patchUPK( upkDirectory = this.upkDir, patchFilePath = this.tempDir ) {

        const patcherTool = path.basename(UPK_PATCH_TOOL);
        const patcherDirectory = path.dirname(UPK_PATCH_TOOL);
    
        let patchCommand = `${patcherTool} "${patchFilePath}" "${upkDirectory}"`
    
        let output = await exec(patchCommand, { cwd: patcherDirectory } ).catch( err => { 
            
            if ( err.code == "3221225781" ) {

                throw new Error("UE3 Redistributables are not installed. Please run Binaries/Redist/UE3Redist.exe ")
            }

            throw err;
        
        });

        return output;
    }
}

module.exports = upkFilePatcher;
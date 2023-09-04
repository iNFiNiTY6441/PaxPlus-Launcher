const fs = require('fs');

// Default JSON data for adding a new mech, based on pax+ berserker


let mechFilePath = __dirname + "\\" +require('/src/resources/defaultMechsetupEntry.json'); // fs.readFileSync('./src/resources/defaultMechsetupEntry.json')
const defaultMechEntry = JSON.parse(fs.readFileSync(mechFilePath) );

class MechsetupPatcher {

    constructor( filePath ) {

        this.filePath = filePath;
        this.config = this.loadSetup();
    }

    /**
     * Returns the names of the currently stored mechs.
     * 
     * @returns Array of MechNames of the mechs contained in the MechSetup data
     */

    getMechnames() {
        return Object.keys( this.config );
    }

    clearSetups() {

        this.config = {};
    }

    /**
     * Deletes a mech entry from the mechsetup storage by name
     * @param {String} mechName Mech entry to delete
     */
    deleteMech( mechName ) {

        delete this.config[mechName];
    }

    /**
     * Parses mechsetup data from the raw game file text format into a workable JSON format for patching
     * 
     * @param {*} rawText Raw text data from the game mechsetup file
     * @returns Mechsetup data in object format
     */

    parseSetupText( rawText ) {

        let setupObject = {};

        let lines = rawText.split("\r\n");

        let mechName = "";

        for ( let i = 0; i < lines.length; i++ ) {

            let key = lines[i].split("=")[0];
            let value = lines[i].split("=")[1];

            if ( key == "MechName" ) {

                mechName = value;
                continue;
            }

            if ( mechName == "" ) continue;

            if ( !setupObject[mechName] ) setupObject[mechName] = {};
            
            while ( setupObject[mechName][key] != undefined ) key = key+"._duplicate";

            setupObject[mechName][key] = value;
        }

        return setupObject;
    }

    /**
     * Patches the entire MechSetup config from a target patchdata object / json
     * 
     * @param {Object} patchObject Object containing all mechs and their data required for patching
     */

    patchAllMechsetupData( patchObject, cleanSlate = false  ) {

        // Remove setups that aren't present in patch data
        for ( let mechName in this.config ) {

            if ( Object.keys( patchObject ).indexOf( mechName ) == -1 ) {
                this.deleteMech( mechName );
                continue;
            }
        }

        for ( let mechName in patchObject ) {

            if ( !this.config[mechName] || cleanSlate === true ) {
                if ( cleanSlate ) console.log("Wiping mech to patch baseline: "+mechName);
                if ( !cleanSlate ) console.log("Adding new mech: "+mechName)
                this.config[mechName] = Object.assign({}, defaultMechEntry);
                this.config[mechName] = Object.assign(this.config[mechName], patchObject[mechName].initial );
            }

            this.config[mechName] = Object.assign(this.config[mechName], patchObject[mechName].persist );
        }
       //console.log(this.config)
    }

    /**
     * Converts an object containing MechSetup data (launcher format) into the TXT file format (game format)
     * 
     * @param {Object} setupObject Object containing the mechsetup data 
     * @returns MechSetup data in game-compatible text format
     */
    setupToText( setupObject ) {

        // Header: File version
        let setupText = ["Version=11"];

        // Header: How many mechs are contained in the file
        setupText.push("NumMechs="+Object.keys( setupObject ).length);

        for ( let mechName in setupObject ) {

            // Start mech segment with MechName
            setupText.push(`MechName=${mechName}`);

            for (let [key, value] of Object.entries(setupObject[mechName])) {

                // Undo renaming of keys that occur multiple times
                if ( key.indexOf("._duplicate") >= 0 ) {
                    key = key.split("._duplicate")[0];
                }
                //console.log(`${key}=${value}`)
                // Add key value pair to output text
                setupText.push(`${key}=${value}`);
            }
        
        }
        
        // MechSetup text format as used by the game
        return setupText.join("\r\n");
    }

    /**
     * Loads mechsetup data from the game file
     * 
     * @returns Mechsetup data in object / launcher format
     */
    loadSetup() {

        let rawFile = fs.readFileSync(this.filePath, 'utf-8');
        return this.parseSetupText( rawFile );
    }

    /**
     * Saves launcher mechsetup data to the game file
     */
    saveSetup() {

        let setupText = this.setupToText( this.config );
        fs.writeFileSync(this.filePath, setupText);
    }
}



module.exports = MechsetupPatcher;
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
     * Patches MechSetup value entries for a given mech. 
     * Will add a new mech entry if the mech to be patched is not yet in MechSetup.
     * 
     * @param {String} mechName MechName property of the mech to patch
     * @param {Object} patchObject Object containing the key-value pairs for the mechsetup patch
     */

    patchMech( mechName, patchObject ) {

        // Add mech if non existant
        if ( Object.keys( this.config ).indexOf( mechName ) == -1 ) {
            
            // Default mech entry based on pax+ berserker
            this.config[mechName] = defaultMechEntry;
        }

        for ( let key in patchObject ) {
            console.log(key)

            // Don't add new keys to mechsetup object, if they aren't already present
            if ( Object.keys( this.config[mechName] ).indexOf( key ) == -1 ) continue;

            // Set key to patched value
            this.config[mechName][key] = patchObject[key];
        }
    }

    /**
     * Parses mechsetup data from the raw game file text format into a workable JSON format for patching
     * 
     * @param {*} rawText Raw text data from the game mechsetup file
     * @returns Mechsetup data in object format
     */

    parseSetupText( rawText ){

        let setupObject = {};

        let mechChunks = rawText.split(/MechName=/g);
        
        for ( let i = 1; i < mechChunks.length; i++ ) {
            
            let mechConfigLines = mechChunks[i].split(/\r\n/g);
            let mechName = mechConfigLines[0];

            setupObject[mechName] = {};

            for ( let j = 1; j < mechConfigLines.length; j++ ) {

                let key = mechConfigLines[j].split(/=/g)[0];
                let value = mechConfigLines[j].split(/=/g)[1];

                if ( !key || key.length == 0 ) continue;

                // Rename duplicate keys to prevent data merging in setup object
                while ( setupObject[mechName][key] != undefined ) {

                    key = key+"._duplicate"
                }

                setupObject[mechName][key] = value;
            }
        }

        return setupObject;
    }


    /**
     * Patches the entire MechSetup config from a target patchdata object / json
     * 
     * @param {Object} patchObject Object containing all mechs and their data required for patching
     */

    patchAllMechsetupData( patchObject ) {

        // Remove setups that aren't present in patch data

        for ( let mechName in this.config ) {

            if ( Object.keys( patchObject ).indexOf( mechName ) == -1 ) {
                this.deleteMech( mechName );
                continue;
            }
        }

        for ( let mechName in patchObject ) {

            // NEW MECH
            if ( Object.keys( this.config ).indexOf( mechName ) == -1 ) {

                this.config[mechName] = defaultMechEntry;
                console.log("NEW MECH: "+mechName);
                console.log(patchObject[mechName].initial)
                this.patchMech( mechName , patchObject[mechName].initial );
            } 
            console.log(patchObject[mechName].persist)
            this.patchMech( mechName , patchObject[mechName].persist );

        }


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
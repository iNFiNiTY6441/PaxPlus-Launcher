const fs = require('fs');
const path = require('path');
const winattr = require('winattr');

const DOCUMENTS_BASE_PATH = path.join(process.env.USERPROFILE, 'Documents');
const INI_CONFIGS_PATH = path.join(DOCUMENTS_BASE_PATH, 'My Games', 'Hawken', 'HawkenGame', 'Config');

/**
 * Custom ini parsing implementation, not the shortest but the safest, going line by line.
 * Supports reading duplicate ini keys as arrays.
 * Does not support creating nested keys in the parsed object.
 * 
 * @param {String} iniText The ini text to parse
 * @returns {Object} The parsed ini data as an object
 */
function custom_parse( iniText ) {

    let iniObject = {};

    let lines = iniText.split("\r\n");
    let currentSection = '';

    for ( let line of lines ) {

        let sectionMatch = line.match(/\[.*\]$/gm);
        if ( sectionMatch ) {
            currentSection = sectionMatch[0].slice(1,-1);
            iniObject[currentSection] = {};
            continue;
        }

        let key = line.match(/^[^=]*/g);
        let value = line.match(/\=(.*)/g);

        if ( !key || !value ) continue;

        key = key[0].trim();
        value = value[0].trim().slice(1);

        if ( Object.keys(iniObject[currentSection]).indexOf( key ) == -1 ) {
            iniObject[currentSection][key] = value;
            continue;
        }

        if (iniObject[currentSection][key].constructor === Array) {
            iniObject[currentSection][key].push( value ); 
            continue;
        } 
        
        iniObject[currentSection][key] = [ iniObject[currentSection][key], value ] //array   
    }

    return iniObject;
}
/**
 * Custom ini object stringify implementation.
 * Writes arrays as multiple sequential occurrences of the same key.
 * @param {Object} iniObject The parsed ini object to stringify
 * @returns {String} The ini text
 */
function custom_stringify( iniObject ) {

    let iniLines = [];

    for ( let section in iniObject ) {

        iniLines.push(`[${section}]`);

        for ( let key in iniObject[section] ) {

            if ( iniObject[section][key].constructor === Array ) {

                for ( let i=0; i < iniObject[section][key].length; i++ ) {
                    iniLines.push(`${key}=${iniObject[section][key][i]}`);
                }

            } else {
                iniLines.push(`${key}=${iniObject[section][key]}`);
            }
        }

        iniLines.push("");
    }
    
    return iniLines.join("\r\n");
}

/**
 * A class for patching INI files.
 * 
 * Example usage:
 * 
 * const IniFilePatcher = require('./iniFilePatcher');
 * const HAWKEN_GAME_INI_PATH = `${IniFilePatcher.INI_CONFIGS_PATH}\\HawkenGame.ini`;
 * 
 * const SECTION_ROBOTS = 'Robots.R_PlayerController_Base';
 * 
 * const hawkenGameIni = new IniFilePatcher(HAWKEN_GAME_INI_PATH);
 * 
 * hawkenGameIni.setValue(SECTION_ROBOTS, 'CockpitLagFactor', 0.0);
 * hawkenGameIni.setValue(SECTION_ROBOTS, 'FOV_Override', 90.0);
 * hawkenGameIni.setValue(SECTION_ROBOTS, 'CameraShakeLevel', 0.0);
 * 
 * hawkenGameIni.saveConfig();
 */
class IniFilePatcher {
    /**
     * Creates an instance of IniFilePatcher.
     * @param {string} filePath - The path to the INI file.
     */
    constructor(filePath) {
        this.filePath = filePath;
        this.config = this.loadConfig();
    }

    /**
     * Loads the INI file and returns its parsed contents.
     * @returns {Object} - The parsed contents of the INI file.
     */
    loadConfig() {
        const iniString = fs.readFileSync(this.filePath, 'utf-8');
        return custom_parse(iniString);
    }

    /**
     * Saves the current configuration to the INI file.
     */
    saveConfig() {

        let iniString = custom_stringify(this.config);

        // Windows Read-only: Unlock the file before writing
        winattr.setSync( this.filePath, {readonly:false});

        // Write ini text to file
        fs.writeFileSync(this.filePath, iniString);

        // Windows Read-only: Lock the file to prevent the game from being stingy about it
        winattr.setSync( this.filePath, {readonly:true});
    }

    /**
     * Gets the value of a key in a section of the INI file.
     * @param {string} section - The section of the INI file.
     * @param {string} key - The key in the section of the INI file.
     * @returns {*} - The value of the key in the section of the INI file.
     */
    getValue(section, key) {

        return this.config[section][key];
    }

    /**
     * Sets the value of a key in a section of the INI file.
     * @param {string} section - The section of the INI file.
     * @param {string} key - The key in the section of the INI file.
     * @param {*} value - The value to set for the key in the section of the INI file.
     */
    setValue(section, key, value) {
        if(!this.config[section]) this.config[section] = {};
        this.config[section][key] = value;
        return
    }

    /**
     * Deletes a key in a section of the INI file.
     * @param {string} section - The section of the INI file.
     * @param {string} key - The key in the section of the INI file.
     * @returns {boolean} - Whether the key was successfully deleted.
     */
    deleteValue(section, key) {
        delete this.config[section][key];
        return;
    }
}

IniFilePatcher.INI_CONFIGS_PATH = INI_CONFIGS_PATH;

module.exports = IniFilePatcher;

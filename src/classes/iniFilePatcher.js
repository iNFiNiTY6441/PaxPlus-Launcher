const fs = require('fs');
const ini = require('ini');
const path = require('path');

const DOCUMENTS_BASE_PATH = path.join(process.env.USERPROFILE, 'Documents');
const INI_CONFIGS_PATH = path.join(DOCUMENTS_BASE_PATH, 'My Games', 'Hawken', 'HawkenGame', 'Config');

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
        return ini.parse(iniString);
    }

    /**
     * Saves the current configuration to the INI file.
     */
    saveConfig() {
        const iniString = ini.stringify(this.config);
        fs.writeFileSync(this.filePath, iniString);
    }

    /**
     * Gets the value of a key in a section of the INI file.
     * @param {string} section - The section of the INI file.
     * @param {string} key - The key in the section of the INI file.
     * @returns {*} - The value of the key in the section of the INI file.
     */
    getValue(section, key) {
        const sectionParts = section.split('.');
        let currentSection = this.config;

        for (const sectionPart of sectionParts) {
            if (!currentSection[sectionPart]) {
                return undefined;
            }
            currentSection = currentSection[sectionPart];
        }

        return currentSection[key];
    }

    /**
     * Sets the value of a key in a section of the INI file.
     * @param {string} section - The section of the INI file.
     * @param {string} key - The key in the section of the INI file.
     * @param {*} value - The value to set for the key in the section of the INI file.
     */
    setValue(section, key, value) {
        const sectionParts = section.split('.');
        let currentSection = this.config;

        for (const sectionPart of sectionParts) {
            if (!currentSection[sectionPart]) {
                currentSection[sectionPart] = {};
            }
            currentSection = currentSection[sectionPart];
        }

        currentSection[key] = value;
    }

    /**
     * Deletes a key in a section of the INI file.
     * @param {string} section - The section of the INI file.
     * @param {string} key - The key in the section of the INI file.
     * @returns {boolean} - Whether the key was successfully deleted.
     */
    deleteValue(section, key) {
        const sectionParts = section.split('.');
        let currentSection = this.config;

        for (const sectionPart of sectionParts) {
            if (!currentSection[sectionPart]) {
                return false;
            }
            currentSection = currentSection[sectionPart];
        }

        if (currentSection.hasOwnProperty(key)) {
            delete currentSection[key];
            return true;
        }

        return false;
    }
}

IniFilePatcher.INI_CONFIGS_PATH = INI_CONFIGS_PATH;

module.exports = IniFilePatcher;

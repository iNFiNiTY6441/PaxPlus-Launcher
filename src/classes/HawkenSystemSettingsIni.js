const IniFilePatcher = require('./iniFilePatcher');

const HAWKEN_SYSTEM_SETTINGS_INI_PATH = `${IniFilePatcher.INI_CONFIGS_PATH}\\HawkenSystemSettings.ini`;

const SECTION_SYSTEM_SETTINGS = 'SystemSettings';

const KEY_MOTION_BLUR = 'MotionBlur';
const KEY_BLOOM = 'Bloom';
const KEY_AMBIENT_OCCLUSION = 'AmbientOcclusion';
const KEY_RESOLUTION_X = 'ResX';
const KEY_RESOLUTION_Y = 'ResY';

/**
 * Represents an INI file patcher for the HawkenSystemSettings.ini file.
 * @extends IniFilePatcher
 */
class HawkenSystemSettingsIni extends IniFilePatcher {
    /**
     * Creates a new instance of the `HawkenSystemSettingsIni` class.
     * @param {string} [filePath=HAWKEN_SYSTEM_SETTINGS_INI_PATH] - The path to the HawkenSystemSettings.ini file.
     */
    constructor(filePath = HAWKEN_SYSTEM_SETTINGS_INI_PATH) {
        super(filePath);
    }

    /**
     * Sets the value of the MotionBlur key in the SystemSettings section.
     * @param {string} value - The value to set.
     */
    setMotionBlur(value) {
        this.setValue(SECTION_SYSTEM_SETTINGS, KEY_MOTION_BLUR, value);
    }

    /**
     * Sets the value of the Bloom key in the SystemSettings section.
     * @param {string} value - The value to set.
     */
    setBloom(value) {
        this.setValue(SECTION_SYSTEM_SETTINGS, KEY_BLOOM, value);
    }

    /**
     * Sets the value of the AmbientOcclusion key in the SystemSettings section.
     * @param {string} value - The value to set.
     */
    setAmbientOcclusion(value) {
        this.setValue(SECTION_SYSTEM_SETTINGS, KEY_AMBIENT_OCCLUSION, value);
    }

    /**
     * Sets the value of the ResX key in the SystemSettings section.
     * @param {string} value - The value to set.
     */
    setResolutionX(value) {
        this.setValue(SECTION_SYSTEM_SETTINGS, KEY_RESOLUTION_X, value);
    }

    /**
     * Sets the value of the ResY key in the SystemSettings section.
     * @param {string} value - The value to set.
     */
    setResolutionY(value) {
        this.setValue(SECTION_SYSTEM_SETTINGS, KEY_RESOLUTION_Y, value);
    }

    /**
     * Gets the value of the MotionBlur key in the SystemSettings section.
     * @returns {string} The value of the MotionBlur key.
     */
    getMotionBlur() {
        return this.getValue(SECTION_SYSTEM_SETTINGS, KEY_MOTION_BLUR);
    }

    /**
     * Gets the value of the Bloom key in the SystemSettings section.
     * @returns {string} The value of the Bloom key.
     */
    getBloom() {
        return this.getValue(SECTION_SYSTEM_SETTINGS, KEY_BLOOM);
    }

    /**
     * Gets the value of the AmbientOcclusion key in the SystemSettings section.
     * @returns {string} The value of the AmbientOcclusion key.
     */
    getAmbientOcclusion() {
        return this.getValue(SECTION_SYSTEM_SETTINGS, KEY_AMBIENT_OCCLUSION);
    }

    /**
     * Gets the value of the ResX key in the SystemSettings section.
     * @returns {string} The value of the ResX key.
     */
    getResolutionX() {
        return this.getValue(SECTION_SYSTEM_SETTINGS, KEY_RESOLUTION_X);
    }

    /**
     * Gets the value of the ResY key in the SystemSettings section.
     * @returns {string} The value of the ResY key.
     */
    getResolutionY() {
        return this.getValue(SECTION_SYSTEM_SETTINGS, KEY_RESOLUTION_Y);
    }
}

module.exports = HawkenSystemSettingsIni;

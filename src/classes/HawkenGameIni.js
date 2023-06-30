const IniFilePatcher = require('./iniFilePatcher');

const HAWKEN_GAME_INI_PATH = `${IniFilePatcher.INI_CONFIGS_PATH}\\HawkenGame.ini`;

const SECTION_ROBOTS = 'Robots.R_PlayerController_Base';
const KEY_COCKPIT_LAG_FACTOR = 'CockpitLagFactor';
const KEY_FOV_OVERRIDE = 'FOV_Override';
const KEY_CAMERA_SHAKE_LEVEL = 'CameraShakeLevel';

/**
 * Class representing the HawkenGame.ini file.
 * @extends IniFilePatcher
 */
class HawkenGameIni extends IniFilePatcher {

    /**
     * Creates an instance of HawkenGameIni.
     * @param {string} [filePath=HAWKEN_GAME_INI_PATH] - The path to the HawkenGame.ini file.
     */
    constructor(filePath = HAWKEN_GAME_INI_PATH) {
        super(filePath);
    }

    /**
     * Sets the CockpitLagFactor value in the HawkenGame.ini file.
     * @param {number} value - The value to set for CockpitLagFactor.
     */
    setCockpitLagFactor(value) {
        this.setValue(SECTION_ROBOTS, KEY_COCKPIT_LAG_FACTOR, value);
    }

    /**
     * Sets the FOV_Override value in the HawkenGame.ini file.
     * @param {number} value - The value to set for FOV_Override.
     */
    setFOVOverride(value) {
        this.setValue(SECTION_ROBOTS, KEY_FOV_OVERRIDE, value);
    }

    /**
     * Sets the CameraShakeLevel value in the HawkenGame.ini file.
     * @param {number} value - The value to set for CameraShakeLevel.
     */
    setCameraShakeLevel(value) {
        this.setValue(SECTION_ROBOTS, KEY_CAMERA_SHAKE_LEVEL, value);
    }

    /**
     * Gets the CockpitLagFactor value from the HawkenGame.ini file.
     * @returns {number} The CockpitLagFactor value.
     */
    getCockpitLagFactor() {
        return this.getValue(SECTION_ROBOTS, KEY_COCKPIT_LAG_FACTOR);
    }

    /**
     * Gets the FOV_Override value from the HawkenGame.ini file.
     * @returns {number} The FOV_Override value.
     */
    getFOVOverride() {
        return this.getValue(SECTION_ROBOTS, KEY_FOV_OVERRIDE);
    }

    /**
     * Gets the CameraShakeLevel value from the HawkenGame.ini file.
     * @returns {number} The CameraShakeLevel value.
     */
    getCameraShakeLevel() {
        return this.getValue(SECTION_ROBOTS, KEY_CAMERA_SHAKE_LEVEL);
    }
}

module.exports = HawkenGameIni;

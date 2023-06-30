const IniFilePatcher = require('./iniFilePatcher');

const HAWKEN_ENGINE_INI_PATH = `${IniFilePatcher.INI_CONFIGS_PATH}\\HawkenEngine.ini`;

const SECTION_EDITOR_ENGINE = 'Engine.Engine';
const KEY_SMOOTH_FRAME_RATE = 'bSmoothFrameRate';
const KEY_MIN_SMOOTHED_FRAME_RATE = 'MinSmoothedFrameRate';
const KEY_MAX_SMOOTHED_FRAME_RATE = 'MaxSmoothedFrameRate';

/**
 * Represents the HawkenEngine.ini file and provides methods to modify its values.
 * @extends IniFilePatcher
 */
class HawkenEngineIni extends IniFilePatcher {
    /**
     * Creates a new instance of the `HawkenEngineIni` class.
     * @param {string} [filePath=HAWKEN_ENGINE_INI_PATH] - The path to the HawkenEngine.ini file.
     */
    constructor(filePath = HAWKEN_ENGINE_INI_PATH) {
        super(filePath);
    }

    /**
     * Sets the value of the `bSmoothFrameRate` key in the `UnrealEd.EditorEngine` section.
     * @param {boolean} value - The new value of the `bSmoothFrameRate` key.
     */
    setSmoothFrameRate(value) {
        this.setValue(SECTION_EDITOR_ENGINE, KEY_SMOOTH_FRAME_RATE, value);
    }

    /**
     * Sets the value of the `MinSmoothedFrameRate` key in the `UnrealEd.EditorEngine` section.
     * @param {number} value - The new value of the `MinSmoothedFrameRate` key.
     */
    setMinSmoothedFrameRate(value) {
        this.setValue(SECTION_EDITOR_ENGINE, KEY_MIN_SMOOTHED_FRAME_RATE, value);
    }

    /**
     * Sets the value of the `MaxSmoothedFrameRate` key in the `UnrealEd.EditorEngine` section.
     * @param {number} value - The new value of the `MaxSmoothedFrameRate` key.
     */
    setMaxSmoothedFrameRate(value) {
        this.setValue(SECTION_EDITOR_ENGINE, KEY_MAX_SMOOTHED_FRAME_RATE, value);
    }

    /**
     * Gets the value of the `bSmoothFrameRate` key in the `UnrealEd.EditorEngine` section.
     * @returns {boolean} The current value of the `bSmoothFrameRate` key.
     */
    getSmoothFrameRate() {
        return this.getValue(SECTION_EDITOR_ENGINE, KEY_SMOOTH_FRAME_RATE);
    }

    /**
     * Gets the value of the `MinSmoothedFrameRate` key in the `UnrealEd.EditorEngine` section.
     * @returns {number} The current value of the `MinSmoothedFrameRate` key.
     */
    getMinSmoothedFrameRate() {
        return this.getValue(SECTION_EDITOR_ENGINE, KEY_MIN_SMOOTHED_FRAME_RATE);
    }

    /**
     * Gets the value of the `MaxSmoothedFrameRate` key in the `UnrealEd.EditorEngine` section.
     * @returns {number} The current value of the `MaxSmoothedFrameRate` key.
     */
    getMaxSmoothedFrameRate() {
        return this.getValue(SECTION_EDITOR_ENGINE, KEY_MAX_SMOOTHED_FRAME_RATE);
    }
}

module.exports = HawkenEngineIni;

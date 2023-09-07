const { assert } = require('console');
const fs = require('fs');
const path = require('path');
 
const DEFAULT_CONFIG_PATH = __dirname + "\\" +require('/src/resources/config/defaultConfig.json');//"/src/resources/defaultConfig.json";//'../resources/defaultConfig.json';
/**
 * A class representing a configuration manager.
 */
class ConfigManager {
    /**
     * Creates a new instance of ConfigManager.
     * @param {string} configPath - The path to the user configuration file.
     * @param {string} [defaultConfigPath=DEFAULT_CONFIG_PATH] - The path to the default configuration file.
     */
    constructor(configPath, defaultConfigPath = DEFAULT_CONFIG_PATH) {
        this.configPath = configPath;
        this.defaultConfigPath = defaultConfigPath;
        this.config = {};
        
        assert( this.configPath != undefined && this.configPath != null, "[CFG_MGR]: configPath is null or undefined!" );
        assert( this.defaultConfigPath != undefined && this.defaultConfigPath != null, "[CFG_MGR]: configPath is null or undefined!" );

        // console.log( "[CFG_MGR]: configPath is "+this.config);
        // console.log( "[CFG_MGR]: defaultConfigPath is "+this.defaultConfigPath);

        if (!fs.existsSync(this.configPath)) {

            // Create directory for file if it doesn't exists ( copy complains otherwise )
            let folder = path.dirname( this.configPath );

            assert( this.defaultConfigPath != undefined && this.defaultConfigPath != null, "[CFG_MGR]: configPath FOLDER is null or undefined!" );

            if ( !fs.existsSync( folder ) ) fs.mkdirSync( folder );

            // If the user configuration file does not exist, copy the default configuration.
            fs.copyFileSync(this.defaultConfigPath, this.configPath);
        }
        this.loadConfig();
    }

    /**
     * Loads the configuration from the user configuration file.
     */
    loadConfig() {
        let rawData = fs.readFileSync(this.configPath);
        this.config = JSON.parse(rawData);
    }

    /**
     * Saves the configuration to the user configuration file.
     */
    saveConfig() {
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    }

    /**
     * Sets an option in the configuration.
     * @param {string} category - The category of the option.
     * @param {string} option - The name of the option.
     * @param {any} value - The value of the option.
     */
    setOption(category, option, value) {
        if (!this.config[category]) {
            this.config[category] = {};
        }
        this.config[category][option] = value;
        this.saveConfig();
    }

    /**
     * 
     * @param {*} category 
     * @param {*} option 
     */
    deleteOption(category, option) {
        
        if ( this.config[category][option] ) {

            delete this.config[category][option]
            this.saveConfig();
        }
        
    }

    /**
     * Gets an option from the configuration.
     * @param {string} category - The category of the option.
     * @param {string} option - The name of the option.
     * @returns {any} The value of the option.
     */
    getOption(category, option) {
        if (this.config[category]) {
            return this.config[category][option];
        }
        return null;
    }
}

module.exports = ConfigManager;
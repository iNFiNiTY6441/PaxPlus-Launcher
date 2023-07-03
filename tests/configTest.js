
// Import the required modules
const ConfigManager = require('../src/classes/configManager');
const fs = require('fs');
const path = require('path');

// Set the paths for the configuration files
const defaultConfigPath = path.join(__dirname, '../src/resources/defaultConfig.json');
const userConfigPath = path.join(__dirname, 'userConfig.json');

// Create a new instance of ConfigManager
let configManager = new ConfigManager(userConfigPath, defaultConfigPath);

// Log the default configurations
const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath));
console.log("Default Configurations: ", defaultConfig);

// Set some options
configManager.setOption('launcher', 'language', 'French');
configManager.setOption('game', 'resolution', '1280x720');

// Log the updated user configurations
const updatedUserConfig = JSON.parse(fs.readFileSync(userConfigPath));
console.log("Updated User Configurations: ", updatedUserConfig);

// Get some options
let language = configManager.getOption('launcher', 'language');
let resolution = configManager.getOption('game', 'resolution');

console.log(`The launcher language is set to: ${language}`);
console.log(`The game resolution is set to: ${resolution}`);

// Create a second Manager to check the newly created file
configManager = new ConfigManager(userConfigPath, defaultConfigPath);

// Get same options from new file to verify they were saved
language = configManager.getOption('launcher', 'language');
resolution = configManager.getOption('game', 'resolution');

console.log(`The launcher language is set to: ${language}`);
console.log(`The game resolution is set to: ${resolution}`);
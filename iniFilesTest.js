const HawkenEngineIni = require("./src/classes/HawkenEngineIni");
const HawkenGameIni = require("./src/classes/HawkenGameIni");
const HawkenSystemSettingsIni = require("./src/classes/HawkenSystemSettingsIni");



// HawkenGameIni
const hawkenGameIni = new HawkenGameIni();
console.log("\nHawkenGameIni TEST:")
console.log('Initial Cockpit Lag Factor:', hawkenGameIni.getCockpitLagFactor());
console.log('Initial FOV Override:', hawkenGameIni.getFOVOverride());
console.log('Initial Camera Shake Level:', hawkenGameIni.getCameraShakeLevel());

hawkenGameIni.setCockpitLagFactor(0.5);
hawkenGameIni.setFOVOverride(90);
hawkenGameIni.setCameraShakeLevel(2);

console.log('Modified Cockpit Lag Factor:', hawkenGameIni.getCockpitLagFactor());
console.log('Modified FOV Override:', hawkenGameIni.getFOVOverride());
console.log('Modified Camera Shake Level:', hawkenGameIni.getCameraShakeLevel());

hawkenGameIni.saveConfig();

// HawkenSystemSettingsIni
const hawkenSystemSettingsIni = new HawkenSystemSettingsIni();
console.log("\nHawkenSystemSettingsIni TEST:")
console.log('Initial Motion Blur:', hawkenSystemSettingsIni.getMotionBlur());
console.log('Initial Bloom:', hawkenSystemSettingsIni.getBloom());
console.log('Initial Ambient Occlusion:', hawkenSystemSettingsIni.getAmbientOcclusion());
console.log('Initial Resolution X:', hawkenSystemSettingsIni.getResolutionX());
console.log('Initial Resolution Y:', hawkenSystemSettingsIni.getResolutionY());

hawkenSystemSettingsIni.setMotionBlur(true);
hawkenSystemSettingsIni.setBloom(false);
hawkenSystemSettingsIni.setAmbientOcclusion(true);
hawkenSystemSettingsIni.setResolutionX(1680);
hawkenSystemSettingsIni.setResolutionY(1020);

console.log('Modified Motion Blur:', hawkenSystemSettingsIni.getMotionBlur());
console.log('Modified Bloom:', hawkenSystemSettingsIni.getBloom());
console.log('Modified Ambient Occlusion:', hawkenSystemSettingsIni.getAmbientOcclusion());
console.log('Modified Resolution X:', hawkenSystemSettingsIni.getResolutionX());
console.log('Modified Resolution Y:', hawkenSystemSettingsIni.getResolutionY());

hawkenSystemSettingsIni.saveConfig();

// HawkenEngineIni
const hawkenEngineIni = new HawkenEngineIni();
console.log("\nHawkenEngineIni TEST:")
console.log('Initial Smooth Frame Rate:', hawkenEngineIni.getSmoothFrameRate());
console.log('Initial Min Smoothed Frame Rate:', hawkenEngineIni.getMinSmoothedFrameRate());
console.log('Initial Max Smoothed Frame Rate:', hawkenEngineIni.getMaxSmoothedFrameRate());

hawkenEngineIni.setSmoothFrameRate(true);
hawkenEngineIni.setMinSmoothedFrameRate(30);
hawkenEngineIni.setMaxSmoothedFrameRate(60);

console.log('Modified Smooth Frame Rate:', hawkenEngineIni.getSmoothFrameRate());
console.log('Modified Min Smoothed Frame Rate:', hawkenEngineIni.getMinSmoothedFrameRate());
console.log('Modified Max Smoothed Frame Rate:', hawkenEngineIni.getMaxSmoothedFrameRate());

hawkenEngineIni.saveConfig();

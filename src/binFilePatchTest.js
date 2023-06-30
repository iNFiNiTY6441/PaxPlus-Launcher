const binaryFilePatcher = require("./classes/binaryFilePatcher.js");
const { replacements, relativePath, baseFileSizeInBytes} = require("./bin_files_info/robotsU.js");

console.log("🚀 ~ file: patchtest.js:6 ~ relativePath:", relativePath)
console.log("🚀 ~ file: patchtest.js:4 ~ replacements:", replacements)

let robotsUFile = new binaryFilePatcher("./testData/Robots.u", replacements, baseFileSizeInBytes);

async function processFile() {
    try {
        await robotsUFile.init();
        // await robotsUFile.decompress(); UNTESTED
        await robotsUFile.applyAllPatches();
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

processFile();

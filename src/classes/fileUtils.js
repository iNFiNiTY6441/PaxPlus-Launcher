const fs = require('fs');

/**
 * Creates a backup of the specified file.
 * @async
 * @param {string} fileName - The name of the file to backup.
 * @param {string} filePath - The path to the file to backup.
 * @returns {Promise<string>} - The path to the backup file.
 */
async function createBackup(fileName, filePath) {
    const backupFilePath = `${fileName}.backup`;
    fs.copyFile(filePath, backupFilePath);
    return backupFilePath;
}

module.exports = { createBackup };
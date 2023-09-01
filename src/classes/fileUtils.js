const fs = require('fs');
const path = require('path');
const util = require('util');
const stat = util.promisify(fs.stat);
const crypto = require('crypto');

const BACKUPS_FOLDER_PATH = ".../../HawkenGame/backup";

/**
 * Creates a backup of the specified file.
 * @async
 * @param {string} fileName - The name of the file to backup.
 * @param {string} filePath - The path to the file to backup.
 * @returns {Promise<string>} - The path to the backup file.
 */
async function createBackup(fileName, filePath, backupsFolderPath = BACKUPS_FOLDER_PATH) {
    const backupFilePath = `${backupsFolderPath}\\${fileName}.backup`;
    fs.copyFileSync(filePath, backupFilePath);
    return backupFilePath;
}

async function restoreBackup( filePath ) {

    let backupFile = `${filePath}.backup`;
    fs.renameSync( backupFile, filePath );
}

async function isSize( filePath, targetSize ) {

    let fileInfo = await stat(filePath);
    return fileInfo.size === targetSize;
}

async function getHash( filePath ) {
    
    let file = fs.readFileSync( filePath );

    let hash = crypto.createHash("md5");
    hash.setEncoding('hex');
    hash.write( file )
    hash.end();
    let md5sum = hash.read();
    console.log("HASHING "+md5sum)
    return md5sum;
}


module.exports = { createBackup, restoreBackup, isSize, getHash };
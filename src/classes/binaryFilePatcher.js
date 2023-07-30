const fs = require('fs');
const path = require('path');
const util = require('util');
const { createBackup, restoreBackup, isSize } = require('./fileUtils');
const open = util.promisify(fs.open);
const read = util.promisify(fs.read);
const write = util.promisify(fs.write);
const close = util.promisify(fs.close);
const stat = util.promisify(fs.stat);
const copyFile = util.promisify(fs.copyFile);
const exec = util.promisify(require('child_process').exec);


const UPK_DECOMPRESSOR_TOOL_PATH = "./decompress.exe";
const DECOMPRESSED_FOLDER_PATH = "./unpacked";

/**
 * A class for patching binary files.
 * 
 * Example usage:
 * 
 * const binaryFilePatcher = require("./classes/binaryFilePatcher.js");
 * const replacements = [
 *  { offset: 0x00638BB2, from: [0x05], to: [0x02] },
 *  { from: [0x05], to: [0x02] },
 *  { offset: 0x00638BB2, to: [0x02] },
 * ]
 * 
 * let robotsUFile = new binaryFilePatcher("./testData/Robots.u", replacements, 123_456_789);
 * 
 * async function processFile() {
 *    try {
 *      await robotsUFile.init();
 *      await robotsUFile.applyAllPatches();
 *   } catch (error) {
 *     console.error('Error occurred:', error);
 *  }
 * }
 * 
 * processFile();
 * 
 */
class binaryFilePatcher {

    /**
     * Creates a new instance of the binaryFilePatcher class.
     * @constructor
     * @param {string} binFilePath - The path to the binary file to patch.
     * @param {Array} replacements - An array of replacement objects.
     */
    constructor( binFilePath, replacements, fileOriginalSize ) {
        this.filePath = binFilePath;
        this.replacements = replacements;
        this.fileOriginalSize = fileOriginalSize;
    }

    /**
     * Initializes the binary file patcher.
     * @async
     */
    async init() {
        console.log("INIT!!")
        this.baseData = open(this.filePath, 'r+');
    }

    /**
     * Adds a replacement object to the list of replacements.
     * @param {number} offset - The offset in the file to replace.
     * @param {Array} bytesFrom - The bytes to replace.
     * @param {Array} bytesTo - The bytes to replace with.
     */
    addReplacement( offset, bytesFrom, bytesTo ) {
        this.replacements.push({offset:offset, from:  Buffer.from(bytesFrom), to: Buffer.from(bytesTo)});
    }

    /**
     * Adds a replacement object to the list of replacements.
     * @param {number} offset - The offset in the file to replace.
     * @param {Array} bytesTo - The bytes to replace with.
     */
    addReplacement( offset, bytesTo ) {
        this.replacements.push({offset:offset, to: Buffer.from(bytesTo)});
    }

    /**
     * Adds a replacement object to the list of replacements.
     * @param {Array} bytesFrom - The bytes to replace.
     * @param {Array} bytesTo - The bytes to replace with.
     */
    addReplacement( bytesFrom, bytesTo ) {
        let offset = this.baseData.indexOf(Buffer.from(bytesFrom));
        if ( offset == -1 || offset > this.baseData.length ) throw new RangeError(`BytePattern out of bounds for '${this.filePath}'`);

        this.addReplacement(offset, bytesFrom, bytesTo);
    }

    /**
     * Applies the replacements to the binary file.
     * @async
     */
    async applyAllPatches(){
        let fileDescriptor;
        try {
            fileDescriptor = await open(this.filePath, 'r+');
            for (const replacement of this.replacements) {
                const buffer = Buffer.alloc(replacement.to.length);
                await read(fileDescriptor, buffer, 0, replacement.to.length, replacement.offset);

                if (replacement.from.length !== replacement.to.length) {
                    console.error(`Replacement length mismatch for '${this.filePath}'`);
                    if(replacement.comment) console.error( replacement.comment )
                    console.log(`Expected ${replacement.from.length} but got ${replacement.to.length}`);
                }
                
                if (replacement.from) {
                    if (!buffer.equals(replacement.from)) {
                        console.error("\r\n=-=-=-=-=-=-=-=- BINARY PATCH ERROR =-=-=-=-=-=-=-=-")
                        console.error(`Replacement mismatch for '${path.basename(this.filePath)}'`);
                        if(replacement.comment) console.error( "("+replacement.comment+")\r\n" )
                        console.error("Expected:");
                        console.error( replacement.from );
                        console.error("Got:")
                        console.error(buffer);
                        console.error("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\r\n")
                    } else {
                        console.log("    |-> "+ replacement.comment );
                    }
                }
                await write(fileDescriptor, replacement.to, 0, replacement.to.length, replacement.offset);
            }
        } catch (err) {
            console.error('File could not be opened:', err);
            process.exit(1);
        } finally {
            if (fileDescriptor !== undefined) {
                close(fileDescriptor);
            }
        }
    }

    async decompress() {
        this.decompress(this.filePath, this.fileOriginalSize);
    }
    
    /**
     * Decompresses a UPK file using the decompression tool.
     * @param {string} filePath - The path to the UPK file to decompress.
     * @param {number} fileOriginalSize - The original size of the UPK file.
     */
    async decompress(filePath, fileOriginalSize) {

        let fileName = path.basename(filePath);

        let isOriginalFile = await isSize( filePath, fileOriginalSize );

        if ( isOriginalFile ) {

            await createBackup(fileName, filePath, path.dirname( this.filePath) );

            const decompressorFilename = path.basename(UPK_DECOMPRESSOR_TOOL_PATH);
            const decompressorPath = path.dirname(UPK_DECOMPRESSOR_TOOL_PATH);
            let decompressCommand = `${decompressorFilename} "${filePath}"`;
    
            decompressCommand = `decompress.exe "${filePath}" -out="${path.join( path.dirname(filePath), "..", "unpacked" )}"`
    
            await exec(decompressCommand, {cwd: decompressorPath} ).catch( err => { throw new Error("Decompression failure. Make sure to place decompress.exe next to pax+.exe", { cause: err })});
    
            await fs.renameSync( path.join( path.dirname(filePath), "..", "unpacked", fileName), filePath  );
            console.log("DECOMP DONE")
        }
    }

    /**
     * Creates a backup of the specified file.
     * @async
     * @param {string} fileName - The name of the file to backup.
     * @param {string} filePath - The path to the file to backup.
     * @returns {Promise<string>} - The path to the backup file.
     */
    async createBackup(fileName, filePath) {
        createBackup(fileName, filePath);
    }
}

module.exports = binaryFilePatcher;
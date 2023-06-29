const fs = require("fs");

class binaryPatch {

    constructor( binFilePath ) {

        this.filePath = binFilePath;
        this.encoding = null;
        this.baseData = fs.readFileSync( this.filePath, this.encoding );
        this.patchData = {}
    }

    addChangeOffset( offset, byteArray ) {

        this.patchData[ offset.toString() ] = byteArray;
    }

    addChangePattern( bytePattern, byteArray ) {

        let offset = new Buffer(this.baseData).indexOf( bytePattern.join(""), 0, "hex" );

        console.log(offset)
        if ( offset == -1 || offset > this.baseData.length ) throw new RangeError("BytePattern out of bounds for '%s'", this.filePath );

        this.addChangeOffset( offset, byteArray )

    }

    apply(){

        let fileBuffer = this.baseData;

        for ( let patchOffset in this.patchData ) {
            
            let startOffset = parseInt( patchOffset );
            let patchBytes = this.patchData[ patchOffset ];

            for ( let x=0; x < patchBytes.length; x++ ) {

                fileBuffer[ startOffset+x ] = parseInt( patchBytes[x] , 16 );
            }

        }

        fs.writeFileSync( this.filePath, fileBuffer, this.encoding );
    }
}
module.exports = binaryPatch;
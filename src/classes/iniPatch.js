class iniPatch {

    constructor( iniFilePath ) {

        this.filePath = iniFilePath;
        this.encoding = "utf8";
        this.baseData = fs.readFileSync( this.filePath, this.encoding );
        this.patchData = {}
    }

    addChange( iniKey, iniValue ) {

        this.patchData[ iniKey ] = iniValue;
    }

    apply(){

        let iniLines = this.baseData.split("\r\n");

        for ( let line in iniLines ) {

            let iniKey = iniLines[line].split("=")[0];
            
            if ( Object.keys( this.patchData ).indexOf( iniKey ) >= 0 ) {

                iniLines[line] = iniKey+"="+iniValue;
            }
        }

        fs.writeFileSync( this.filePath, iniLines, this.encoding );
    }
}
module.exports = iniPatch;
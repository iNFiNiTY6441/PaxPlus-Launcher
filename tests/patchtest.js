const fs = require("fs");
const binaryPatch = require("./classes/binaryPatch.js");



let changeLANPacket = new binaryPatch( "<FILE TO PATCH>" );

changeLANPacket.addChangePattern( ["48", "61", "77", "6B", "65" ],["50","61","74","63","68","20","74","65","73","74"] );

//changeLANPacket.addChangeOffset( 64, ["50","61","74","63","68","20","74","65","73","74"] );

changeLANPacket.apply()

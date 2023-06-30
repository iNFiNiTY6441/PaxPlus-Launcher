const relativePath = "../../HawkenGame/CookedPC/Robots.u";
const baseFileSizeInBytes = 78_019.579;
const decompressedFileSizeInBytes = 144_748_383;

const replacements = [
    //Subtypes
    { offset: 0x00638BB2, from: Buffer.from([0x05]), to: Buffer.from([0x02]) }, //Change MechSubtype0 ability to Ballistic Barrage
    { offset: 0x006391F0, from: Buffer.from([0x01]), to: Buffer.from([0x05]) }, //Change MechSubtype4 secondary to Repair Torch    
    { offset: 0x006396DE, from: Buffer.from([0x05]), to: Buffer.from([0x03]) }, //Change MechSubtype7 ability to Weapons Coolant
    //Items
    { offset: 0x0054e573, from: Buffer.from([0xC0, 0x40]), to: Buffer.from([0xD0, 0x40]) }, //Increase MG turret damage to 6.5
    { offset: 0x0054e58D, from: Buffer.from([0x2C, 0x01]), to: Buffer.from([0x43, 0x46]) }, //Decrease Turret initial Health to 198
    { offset: 0x0054e5A9, from: Buffer.from([0x2C, 0x01]), to: Buffer.from([0x43, 0x46]) }, //Decrease Turret max Health to 198    
    { offset: 0x0054E6D2, from: Buffer.from([0x98, 0x3A]), to: Buffer.from([0x2C, 0xEC]) }, //Decrease Turret MaxTargetDistance to 11500

    { offset: 0x0055530A, from: Buffer.from([0x58, 0x02]), to: Buffer.from([0x3F, 0x02]) }, //Change Blockade Health to 575
    { offset: 0x00555328, from: Buffer.from([0x80, 0x3F]), to: Buffer.from([0x80, 0x3E]) }, //Change Blockade ShieldSize to 0.25x
    { offset: 0x00555344, from: Buffer.from([0x40, 0x40]), to: Buffer.from([0x80, 0x3F]) }, //Change Blockade Max Size to 1
    { offset: 0x00555360, from: Buffer.from([0x00, 0x40]), to: Buffer.from([0x40, 0x3F]) }, //Change Blockade ExpandTime to 0.75s
    { offset: 0x0055537C, from: Buffer.from([0xC0, 0x40]), to: Buffer.from([0x80, 0x3F]) }, //Change Blockade ContractTime to 1s
    { offset: 0x0055548B, from: Buffer.from([0xC8, 0x41]), to: Buffer.from([0x50, 0x41]) }, //Change Blockade Lifespan to 13s

    { offset: 0x0060C802, from: Buffer.from([0x13]), to: Buffer.from([0x00]) }, //Reduce Teleporter uses to 0

    { offset: 0x0060A6A2, from: Buffer.from([0x04]), to: Buffer.from([0x01]) }, //Reduce Combat Drone uses to 1
    { offset: 0x0060A4F4, from: Buffer.from([0xFA]), to: Buffer.from([0x02]) }, //Reduce Combat Drone inital health to 130
    { offset: 0x0060A50C, from: Buffer.from([0xFA]), to: Buffer.from([0x02]) }, //Reduce Combat Drone max health to 130

    { offset: 0x00683CB2, from: Buffer.from([0x34, 0x42]), to: Buffer.from([0x20, 0x42]) },//Decrease Rocket Turret Damage to 40
    { offset: 0x006841A8, from: Buffer.from([0x20, 0x42]), to: Buffer.from([0x0C, 0x42]) },//Decrease Seeker Turret Damage to 35

    { offset: 0x00687763, from: Buffer.from([0x5E, 0x01]), to: Buffer.from([0xC2, 0x01]) }, //Change Shield HP to 450

    //Mech Properties    
    { offset: 0x006690B9, from: Buffer.from([0x00, 0x00, 0xAF, 0x43]), to: Buffer.from([0x00, 0x00, 0x2F, 0x44]) }, //Increase R_Pawn ThrusterVerticalSpeed to 700
    { offset: 0x0066AD9F, from: Buffer.from([0x00, 0x00, 0xD2, 0x43]), to: Buffer.from([0x00, 0x80, 0x9D, 0x44]) } //Increase R_Pawn AccelRate to 1260
];

module.exports = { relativePath, replacements, baseFileSizeInBytes, decompressedFileSizeInBytes };
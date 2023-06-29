const relativePath = "../../HawkenGame/CookedPC/Robots.u";
const baseFileSizeInBytes = 78_019.579;
const decompressedFileSizeInBytes = 144_748_383;

const replacements = [
    { offset: 0x006391F0, from: Buffer.from([0x01]), to: Buffer.from([0x05]) },
    { offset: 0x00638BB2, from: Buffer.from([0x05]), to: Buffer.from([0x02]) },
    { offset: 0x006396DE, from: Buffer.from([0x05]), to: Buffer.from([0x03]) },
    { offset: 0x0060C802, from: Buffer.from([0x13]), to: Buffer.from([0x00]) },
    { offset: 0x0060A6A2, from: Buffer.from([0x04]), to: Buffer.from([0x01]) },
    { offset: 0x0060A4F4, from: Buffer.from([0xFA]), to: Buffer.from([0x02]) },
    { offset: 0x0060A50C, from: Buffer.from([0xFA]), to: Buffer.from([0x02]) },
    { offset: 0x00687763, from: Buffer.from([0x5E, 0x01]), to: Buffer.from([0xC2, 0x01]) },
    { offset: 0x006690B9, from: Buffer.from([0xAF, 0x43]), to: Buffer.from([0x2F, 0x44]) }
];

module.exports = { relativePath, replacements, baseFileSizeInBytes, decompressedFileSizeInBytes };
const noTrafficMockup = require('../blockGenerator/noTraffic.json');
const highTrafficMockup = require('../blockGenerator/highTraffic.json');

const emptyBlock = noTrafficMockup.blocks[0];
const nonEmptyBlock = highTrafficMockup.blocks[0];

module.exports = {
    emptyBlock,
    nonEmptyBlock,
};

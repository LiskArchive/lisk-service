const gateway = require('./services/gateway/app');
const core = require('./services/core/app');

const nop = () => {};

nop(gateway); nop(core);

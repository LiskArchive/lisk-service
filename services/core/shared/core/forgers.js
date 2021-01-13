/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
const coreApi = require('./compat');

const getForgers = async params => {
    const forgers = {
        data: [],
        meta: {},
    };

    const offset = params.offset || 0;
    const limit = params.limit || 10;
    const nextForgers = await coreApi.getForgers();
    forgers.data = nextForgers.data.slice(offset, offset + limit);

    forgers.meta.count = forgers.data.length;
    forgers.meta.offset = offset;
    forgers.meta.total = nextForgers.length;

    return forgers;
};

module.exports = {
    getForgers,
};

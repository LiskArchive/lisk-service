/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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

const parseToJSONCompatObj = obj => {
    const result = {};
    Object.entries(obj)
        .forEach(([k, v]) => {
            if (v instanceof Buffer) result[k] = Buffer(v).toString('hex');
            else if (typeof v === 'bigint') result[k] = Number(v);
            else if (typeof v === 'object' && v !== null) result[k] = parseToJSONCompatObj(v);
            else result[k] = v;
        });
    return result;
};

module.exports = {
    parseToJSONCompatObj,
};

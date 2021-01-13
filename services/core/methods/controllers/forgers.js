/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const { Utils } = require('lisk-service-framework');

const ObjectUtilService = Utils.Data;

const CoreService = require('../../shared/core');

const { isEmptyObject } = ObjectUtilService;


const getForgers = async params => {
    const forgers = await CoreService.getForgers(params);
    if (isEmptyObject(forgers)) return {};

    return {
        data: forgers.data,
        meta: forgers.meta,
    };
};

module.exports = {
    getForgers,
};

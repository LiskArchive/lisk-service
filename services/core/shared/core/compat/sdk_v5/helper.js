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
const { knex } = require('../../../database');

const getPublicKeyByAddress = async address => {
    const accountsDB = await knex('accounts');
    const [{ publicKey }] = await accountsDB.find({ address });
    return publicKey;
};

const getIndexedAccountByPublicKey = async publicKey => {
    const accountsDB = await knex('accounts');
    const account = await accountsDB.find({ publicKey });
    return account;
};

module.exports = {
    getPublicKeyByAddress,
    getIndexedAccountByPublicKey,
};

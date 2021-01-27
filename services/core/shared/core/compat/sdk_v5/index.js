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
const events = require('./events');

const {
    getBlocks,
    updateFinalizedHeight,
    getFinalizedHeight,
} = require('./blocks');

const {
    getAccounts,
    getMultisignatureGroups,
    getMultisignatureMemberships,
} = require('./accounts');

const {
    getNetworkStatus,
} = require('./network');

const {
    getTransactions,
} = require('./transactions');

const {
    getForgers,
} = require('./forgers');
const {
    peerStates,
    getPeers,
} = require('./peers');

const {
    getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,
} = require('./coreCache');

const nop = async () => { };

module.exports = {
    ...require('../sdk_v4'),
    ...require('./coreCache'),

    events,

    getBlocks,
    updateFinalizedHeight,
    getFinalizedHeight,

    getAccounts,
    getMultisignatureGroups,
    getMultisignatureMemberships,

    getNetworkStatus,

    getTransactions,

    peerStates,
    getPeers,

    getForgers,

    getCachedAccountByAddress,
	getCachedAccountByPublicKey,
	getCachedAccountBySecondPublicKey,
	getCachedAccountByUsername,

    getDelegates: nop,

};

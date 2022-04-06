/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const { requestRpc } = require('../utils/appContext');

const isGenesisBlockAlreadyIndexed = async () => requestRpc('indexer', 'isGenesisBlockIndexed');

const isGenesisAccountAlreadyIndexed = async () => requestRpc('indexer', 'isGenesisAccountsIndexed');

const getDelegatesAccounts = async () => requestRpc('indexer', 'getDelegateAccounts');

const getGenesisAccounts = async () => requestRpc('indexer', 'getGenesisAccounts');

const getMissingblocks = async (from, to) => requestRpc('indexer', 'getMissingBlocks', {
	from,
	to,
});

const getCurrentHeight = async () => requestRpc('indexer', 'getCurrentHeight');

const getGenesisHeight = async () => requestRpc('indexer', 'getGenesisHeight');

module.exports = {
	isGenesisBlockAlreadyIndexed,
	isGenesisAccountAlreadyIndexed,
	getDelegatesAccounts,
	getGenesisAccounts,
	getMissingblocks,
	getCurrentHeight,
	getGenesisHeight,
};

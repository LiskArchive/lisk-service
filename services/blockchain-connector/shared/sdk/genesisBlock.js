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
const { getGenesisHeight, getBlockByHeight } = require('./actions');

const getGenesisBlock = async () => {
	const block = await getBlockByHeight(await getGenesisHeight());
	const { header: { asset: { accounts, ...remAsset }, ...remHeader }, payload } = block;
	return {
		header: {
			asset: { ...remAsset, accounts: [] },
			...remHeader,
		},
		payload,
		meta: {
			isGenesisBlock: true,
			message: 'Fetch the genesis accounts with \'getNumberOfGenesisAccounts\' and \'getGenesisAccounts\' methods'
		},
	};
};

const getNumberOfGenesisAccounts = async () => {
	const block = await getBlockByHeight(await getGenesisHeight());
	const { header: { asset: { accounts } } } = block;
	return accounts.length;
};

const getGenesisAccounts = async (limit, offset) => {
	const block = await getBlockByHeight(await getGenesisHeight());
	const { header: { asset: { accounts } } } = block;
	const accountsSlice = accounts.slice(offset, limit);
	return accountsSlice;
};

module.exports = {
	getGenesisBlock,
	getNumberOfGenesisAccounts,
	getGenesisAccounts,
};

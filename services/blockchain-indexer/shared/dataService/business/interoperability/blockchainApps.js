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
const BluebirdPromise = require('bluebird');
const { DB: { MySQL: { getTableInstance } } } = require('lisk-service-framework');
const { getNetworkStatus } = require('../network');
const { requestConnector } = require('../../../utils/request');
const { LENGTH_NETWORK_ID, LENGTH_TOKEN_ID } = require('../../../constants');

const config = require('../../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysqlReplica;

const blockchainAppsTableSchema = require('../../../database/schema/blockchainApps');
const { getMainchainID } = require('./mainchain');

const getBlockchainAppsTable = () => getTableInstance(blockchainAppsTableSchema, MYSQL_ENDPOINT);

let lskTokenID;

const getLSKTokenID = async () => {
	if (!lskTokenID) {
		const mainchainID = await getMainchainID();
		lskTokenID = mainchainID.substring(0, LENGTH_NETWORK_ID).padEnd(LENGTH_TOKEN_ID, '0');
	}

	return lskTokenID;
};

const getBlockchainApps = async (params) => {
	// TODO: Update implementation when interoperability_getOwnChainAccount is available
	const blockchainAppsTable = await getBlockchainAppsTable();

	const blockchainAppsInfo = {
		data: [],
		meta: {},
	};

	// Initialize DB params
	params.whereIn = [];

	if (params.chainID) {
		const { chainID, ...remParams } = params;
		params = remParams;
		const chainIDs = chainID.split(',');

		params.whereIn.push({
			property: 'chainID',
			values: chainIDs,
		});
	}

	if (params.search) {
		const { search, ...remParams } = params;
		params = remParams;

		params.search = {
			property: 'chainName',
			pattern: search,
		};
	}

	if (params.status) {
		const { status, ...remParams } = params;
		params = remParams;
		params.whereIn.push({
			property: 'status',
			values: status.split(','),
		});
	}

	const total = await blockchainAppsTable.count(params);

	const dbBlockchainApps = await blockchainAppsTable.find(
		{ ...params, limit: params.limit || total },
		Object.getOwnPropertyNames(blockchainAppsTableSchema.schema),
	);

	const { data: { chainID } } = await getNetworkStatus();
	const { escrowedAmounts } = await requestConnector('getEscrowedAmounts');

	const tokenIdForLSK = await getLSKTokenID();
	blockchainAppsInfo.data = await BluebirdPromise.map(
		dbBlockchainApps,
		async blockchainAppInfo => {
			const escrow = escrowedAmounts.filter(e => e.escrowChainID === blockchainAppInfo.chainID);

			const escrowEntryForLSKTokenID = escrow.find(item => item.tokenID === tokenIdForLSK);
			const escrowedLSK = escrowEntryForLSKTokenID ? escrowEntryForLSKTokenID.amount : '0';

			return {
				...blockchainAppInfo,
				escrowedLSK,
				escrow: escrow.length ? escrow : [{
					tokenID: chainID.substring(0, LENGTH_NETWORK_ID).padEnd(LENGTH_TOKEN_ID, '0'),
					amount: '0',
				}],
			};
		},
		{ concurrency: dbBlockchainApps.length },
	);

	blockchainAppsInfo.meta = {
		count: blockchainAppsInfo.data.length,
		offset: params.offset,
		total,
	};

	return blockchainAppsInfo;
};

module.exports = {
	getBlockchainApps,

	// Testing
	getLSKTokenID,
};

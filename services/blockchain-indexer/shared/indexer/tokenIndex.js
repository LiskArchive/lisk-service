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
const {
	Queue,
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const dataService = require('../dataService');
const { requestConnector } = require('../utils/request');

const { isMainchain } = require('../chain');

const config = require('../../config');

const topLSKAddressesIndexSchema = require('../database/schema/topLSKAddresses');

const MYSQL_ENDPOINT = config.endpoints.mysql;

let liskTokenID;
const LOCAL_ID_LSK = '00000000';

const getTopLSKAddressesIndex = () => getTableInstance(
	topLSKAddressesIndexSchema.tableName,
	topLSKAddressesIndexSchema,
	MYSQL_ENDPOINT,
);

const getLiskBalanceByAddress = async (address) => {
	if (!liskTokenID) {
		const { chainID } = (await dataService.getNetworkStatus()).data;
		liskTokenID = chainID.concat(LOCAL_ID_LSK);
	}

	const response = await requestConnector(
		'getTokenBalance',
		{
			address,
			tokenID: liskTokenID,
		},
	);

	return response.availableBalance;
};

const updateLiskBalance = async (job) => {
	if (await isMainchain()) {
		const { address } = job.data;
		const balance = await getLiskBalanceByAddress(address);
		const topLSKAddressesDB = await getTopLSKAddressesIndex();
		await topLSKAddressesDB.upsert({ address, balance });
	}
};

const updateAddressBalanceQueue = Queue(config.endpoints.cache, 'updateAddressBalanceQueue', updateLiskBalance, 10);

module.exports = {
	updateAddressBalanceQueue,
};

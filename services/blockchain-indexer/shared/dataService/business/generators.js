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
// const BluebirdPromise = require('bluebird');
const { Utils } = require('lisk-service-framework');
const {
	// getIndexedAccountInfo,
	getBase32AddressFromHex,
} = require('../../utils/accountUtils');

const { getGenesisConfig } = require('../../constants');

const { requestConnector } = require('../../utils/request');

const ObjectUtilService = Utils.Data;
const { isProperObject } = ObjectUtilService;

const getGenerators = async () => {
	const generators = await requestConnector('getGenerators');
	generators.data = generators
		.map(generator => ({
			...generator,
			address: getBase32AddressFromHex(generator.address),
		}));

	// TODO: Update when generators list is available from SDK
	// generators.data = await BluebirdPromise.map(
	// 	generators.data,
	// 	async forger => {
	// 		const account = await getIndexedAccountInfo(
	// 			{ address: forger.address, limit: 1 },
	// 			['address', 'username', 'totalVotesReceived']);
	// 		forger.username = account && account.username
	// 			? account.username
	// 			: null;
	// 		forger.totalVotesReceived = account && account.totalVotesReceived
	// 			? Number(account.totalVotesReceived)
	// 			: null;
	// 		return forger;
	// 	},
	// 	{ concurrency: generators.data.length },
	// );
	return isProperObject(generators) && Array.isArray(generators.data) ? generators.data : [];
};

const getNumberOfGenerators = async () => {
	const genesisConfig = await getGenesisConfig();
	return genesisConfig.activeDelegates + genesisConfig.standbyDelegates;
};

module.exports = {
	getGenerators,
	getNumberOfGenerators,
};

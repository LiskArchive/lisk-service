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

const { getLisk32AddressFromHex } = require('../../utils/accountUtils');
const { getGenesisConfig } = require('../../constants');
const { requestConnector } = require('../../utils/request');
const { getNameByAddress } = require('../../utils/delegateUtils');

const getGenerators = async () => {
	const { list: generatorsList } = await requestConnector('getGenerators');
	const generators = await BluebirdPromise.map(
		generatorsList,
		async generator => ({
			address: getLisk32AddressFromHex(generator.address),
			name: await getNameByAddress(generator.address),
			nextAllocatedTime: generator.nextAllocatedTime,
		}));

	return generators;
};

const getNumberOfGenerators = async () => {
	const genesisConfig = await getGenesisConfig();
	return genesisConfig.activeDelegates + genesisConfig.standbyDelegates;
};

module.exports = {
	getGenerators,
	getNumberOfGenerators,
};

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
const { Logger } = require('lisk-service-framework');

const { getPosConstants } = require('./pos');
const { getIndexedAccountInfo } = require('../../utils/accountUtils');
const { requestConnector } = require('../../utils/request');
const { getNameByAddress } = require('../../utils/validatorUtils');

const logger = Logger();

let generatorsListCache = [];

const getGeneratorsInfo = async () => {
	const { list: generatorsList } = await requestConnector('getGenerators');
	const generators = await BluebirdPromise.map(
		generatorsList,
		async generator => {
			const { name, publicKey } = await getIndexedAccountInfo(
				{ address: generator.address, limit: 1 },
				['name', 'publicKey'],
			);

			return {
				...generator,
				name: name || await getNameByAddress(generator.address),
				publicKey,
			};
		});

	return generators;
};

const getNumberOfGenerators = async () => {
	const constants = await getPosConstants();
	return constants.numberActiveValidators + constants.numberStandbyValidators;
};

const reloadGeneratorsCache = async () => {
	try {
		generatorsListCache = await getGeneratorsInfo();
		logger.info(`Updated generators list with ${generatorsListCache.length} validators.`);
	} catch (err) {
		logger.warn(`Failed to load all generators due to: ${err.message}`);
		throw err;
	}
};

const getGenerators = async () => {
	if (generatorsListCache.length === 0) await reloadGeneratorsCache();
	return generatorsListCache;
};

module.exports = {
	reloadGeneratorsCache,
	getGenerators,
	getNumberOfGenerators,
};

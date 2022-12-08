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
const { Logger } = require('lisk-service-framework');
const { parseToJSONCompatObj } = require('../utils/parser');

const business = require('./business');

const logger = Logger();

let generatorsList = [];

const loadAllGenerators = async () => {
	try {
		generatorsList = await business.getGenerators();
		logger.info(`Updated generators list with ${generatorsList.length} delegates.`);
	} catch (err) {
		logger.warn(`Failed to load all generators due to: ${err.message}`);
		throw err;
	}
};

const getAllGenerators = async () => {
	if (generatorsList.length === 0) await loadAllGenerators();
	return generatorsList;
};

const getGenerators = async params => {
	const generators = {
		data: [],
		meta: {},
	};

	const { offset, limit } = params;

	generators.data = generatorsList.slice(offset, offset + limit);

	generators.meta.count = generators.data.length;
	generators.meta.offset = offset;
	generators.meta.total = generatorsList.length;

	return parseToJSONCompatObj(generators);
};

module.exports = {
	reloadGeneratorsCache: loadAllGenerators,
	getAllGenerators,
	getGenerators,
};

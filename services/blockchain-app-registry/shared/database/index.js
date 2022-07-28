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

const {
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../config');

const indexSchemas = {
	applications: require('./schema/applications'),
	tokens: require('./schema/tokens'),
};

const initializeSearchIndex = async () => {
	await BluebirdPromise.map(
		Object.keys(indexSchemas),
		key => getTableInstance(key, indexSchemas[key]),
		{ concurrency: 1 },
	);
};

const truncateTable = async () => {
	await BluebirdPromise.map(
		Object.keys(indexSchemas),
		async key => {
			const db = await getTableInstance(key, indexSchemas[key]);
			await db.rawQuery(`TRUNCATE TABLE ${key};`);
		},
		{ concurrency: 1 },
	);
};

const initDatabase = async () => {
	if (config.isTruncateTableEnable) await truncateTable();
	await initializeSearchIndex();
};

module.exports = {
	initDatabase,
};

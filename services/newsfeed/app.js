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
const postgres = require('./shared/postgres');

const request = {
	twitter: require('./shared/newsfeed/sources/twitter'),
};

const MILLISECONDS_IN_SECOND = 1000;

// Configuration
const config = require('./config');

const moleculer = require('./shared/moleculer');

moleculer.init(config);

// Postgres Database
Object.keys(config.postgresTables)
	.reduce((p, table) => p.then(() => postgres.initializeTable(table)), Promise.resolve())
	.then(() => {
		Object.values(config.sources).forEach(async (source) => {
			if (source.enabled === true) {
				await postgres.updateDataInDb(source, request[source.type]);
				setInterval(() => {
					postgres.updateDataInDb(source, request[source.type]);
				}, (source.interval * MILLISECONDS_IN_SECOND));
			}
		});
	});

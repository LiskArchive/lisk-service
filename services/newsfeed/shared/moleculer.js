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
const path = require('path');
const { ServiceBroker } = require('moleculer');
const requireAll = require('require-all');
const packageJson = require('../package.json');
const logger = require('./logger')();

const requireAllJs = relPath => requireAll({
	filter: /(.+)\.js$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: true,
	dirname: path.resolve(__dirname, relPath),
});

/*
* The most crucial parts of code can be written as:
*  - methods: client -> server, typically called on user request (ex. get.transactions)
*  - events: server -> client, subscribtions to notify users (ex. subscribe.transactions)
*  - jobs: Internal server routines run either frequently or on-demand (ex. Bull queue with crawler)
*/

const methods = requireAllJs('../methods');

const init = (config) => {
	const broker = new ServiceBroker({
		transporter: config.moleculer.transporter,
		requestTimeout: 5 * 1000,
		logger,
	});

	const moleculerConfig = {
		name: 'market',
		actions: {
			status() {
				return {
					status: 'OK',
					service: packageJson.name,
				};
			},
		},
	};

	Object.keys(methods).forEach((methodGroup) => {
		Array.isArray(methods[methodGroup])
			&& methods[methodGroup].forEach((item) => {
				moleculerConfig.actions[item.name] = async (ctx) => {
					const response = await item.controller(ctx.params);
					return response.status
						? { status: response.status, ...response.data }
						: response.data;
				};
				logger.info(`Registered method ${moleculerConfig.name}.${item.name}`);
			});
	});

	// Create a service
	broker.createService(moleculerConfig);

	// Start server
	broker.start().then(() => {
		logger.info(`Service started ${packageJson.name}`);
	});
};

module.exports = {
	init,
};

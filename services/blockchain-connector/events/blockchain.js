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
	appReadyController,
	appShutdownController,
	appNetworkReadyController,
	appNetworkEventController,
	appNewTransactionController,
	appChainForkedController,
	appChainValidatorsChangeController,
	appNewBlockController,
	appDeleteBlockController,
} = require('./controller/blockchain');

const sdkEvents = [
	{
		name: 'appReady',
		get description() { return `Event ${this.name}`; },
		controller: appReadyController,
	},
	{
		name: 'appShutdown',
		get description() { return `Event ${this.name}`; },
		controller: appShutdownController,
	},
	{
		name: 'appNetworkReady',
		get description() { return `Event ${this.name}`; },
		controller: appNetworkReadyController,
	},
	{
		name: 'appNetworkEvent',
		get description() { return `Event ${this.name}`; },
		controller: appNetworkEventController,
	},
	{
		name: 'appNewTransaction',
		get description() { return `Event ${this.name}`; },
		controller: appNewTransactionController,
	},
	{
		name: 'appChainForked',
		get description() { return `Event ${this.name}`; },
		controller: appChainForkedController,
	},
	{
		name: 'appChainValidatorsChange',
		get description() { return `Event ${this.name}`; },
		controller: appChainValidatorsChangeController,
	},
	{
		name: 'appNewBlock',
		get description() { return `Event ${this.name}`; },
		controller: appNewBlockController,
	},
	{
		name: 'appDeleteBlock',
		get description() { return `Event ${this.name}`; },
		controller: appDeleteBlockController,
	},
];

module.exports = sdkEvents;

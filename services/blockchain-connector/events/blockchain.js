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
	txpoolNewTransactionController,
	chainForkedController,
	chainValidatorsChangeController,
	chainNewBlockController,
	chainDeleteBlockController,
	systemNodeInfoEventController,
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
		name: 'txpoolNewTransaction',
		get description() { return `Event ${this.name}`; },
		controller: txpoolNewTransactionController,
	},
	{
		name: 'chainForked',
		get description() { return `Event ${this.name}`; },
		controller: chainForkedController,
	},
	{
		name: 'chainValidatorsChange',
		get description() { return `Event ${this.name}`; },
		controller: chainValidatorsChangeController,
	},
	{
		name: 'chainNewBlock',
		get description() { return `Event ${this.name}`; },
		controller: chainNewBlockController,
	},
	{
		name: 'chainDeleteBlock',
		get description() { return `Event ${this.name}`; },
		controller: chainDeleteBlockController,
	},
	{
		name: 'systemNodeInfo',
		get description() { return `Event ${this.name}`; },
		controller: systemNodeInfoEventController,
	},
];

module.exports = sdkEvents;

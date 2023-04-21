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
module.exports = {
	block: {
		schema: '=',
	},
	header: {
		schema: '=',
	},
	asset: {
		schema: '=',
	},
	transaction: {
		schema: '=',
	},
	event: {
		schema: '=',
	},
	standardEvent: {
		schema: '=',
	},
	ccm: {
		schema: '=',
	},
	events: ['data.events', {
		module: '=,string',
		name: '=,string',
		schema: '=',
	}],
	assets: ['data.assets', {
		module: '=,string',
		version: '=,string',
		schema: '=',
	}],
	commands: ['data.commands', {
		moduleCommand: '=,string',
		schema: '=',
	}],
	messages: ['data.messages', {
		moduleCommand: '=,string',
		param: '=,string',
		schema: '=',
	}],

};

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
	chainName: '=,string',
	chainID: '=,string',
	title: '=,string',
	description: '=,string',
	networkType: '=,string',
	isDefault: '=,boolean',
	status: '=,string',
	genesisURL: '=,string',
	projectPage: '=,string',
	appPage: '=,string',
	serviceURLs: ['serviceURLs', {
		http: '=,string',
		ws: '=,string',
	}],
	logo: {
		png: '=,string',
		svg: '=,string',
	},
	explorers: ['explorers', {
		url: '=,string',
		txnPage: '=,string',
	}],
	appNodes: ['appNodes', {
		url: '=,string',
		maintainer: '=,string',
	}],
	backgroundColor: '=,string',
};

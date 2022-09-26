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
	chainID: '=,string',
	chainName: '=,string',
	tokenID: '=,string',
	tokenName: '=,string',
	networkType: 'network,string',
	description: '=,string',
	logo: {
		png: '=,string',
		svg: '=,string',
	},
	symbol: '=,string',
	displayDenom: '=,string',
	baseDenom: '=,string',
	denomUnits: ['denomUnits', {
		denom: '=,string',
		decimals: '=,number',
		aliases: '=',
	}],
};

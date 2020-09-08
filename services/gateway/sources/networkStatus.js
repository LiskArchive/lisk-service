/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
	type: 'moleculer',
	params: {},
	method: 'core.network.status',
	definition: {
		broadhash: 'data.status.broadhash,string',
		height: 'data.status.height,number',
		networkHeight: 'data.status.networkHeight,number',
		epoch: 'data.constants.epoch,string',
		milestone: 'data.constants.milestone,string',
		nethash: 'data.constants.nethash,string',
		version: 'data.constants.version,string',
		supply: 'data.constants.supply,string',
		reward: 'data.constants.reward,string',
		fees: {
			send: 'data.constants.fees.send,string',
			vote: 'data.constants.fees.vote,string',
			secondSignature: 'data.constants.fees.secondSignature,string',
			delegate: 'data.constants.fees.delegate,string',
			multisignature: 'data.constants.fees.multisignature,string',
			dappRegistration: 'data.constants.fees.dappRegistration,string',
			dappWithdrawal: 'data.constants.fees.dappWithdrawal,string',
			dappDeposit: 'data.constants.fees.dappDepositl,string',
		},
	},
};

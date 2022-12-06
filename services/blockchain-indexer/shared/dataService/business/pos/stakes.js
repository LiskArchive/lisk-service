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
	getIndexedAccountInfo,
	getLisk32AddressFromPublicKey,
} = require('../../../utils/accountUtils');
const { getAddressByName } = require('../../../utils/validatorUtils');
const { parseToJSONCompatObj } = require('../../../utils/parser');
const { requestConnector } = require('../../../utils/request');

const normalizeStake = stake => parseToJSONCompatObj(stake);

const getStakes = async params => {
	const stakesReponse = {
		data: {
			stakes: [],
		},
		meta: {
			staker: {},
			count: 0,
		},
	};

	if (!params.address && params.name) {
		params.address = await getAddressByName(params.name);
	}

	if (!params.address && params.publicKey) {
		params.address = getLisk32AddressFromPublicKey(params.publicKey);
	}

	const response = await requestConnector('getStaker', { address: params.address });
	stakesReponse.data.stakes = await BluebirdPromise.map(
		response.sentStakes,
		async sentStake => {
			const stake = normalizeStake(sentStake);
			const { name = null } = await getIndexedAccountInfo({ address: stake.validatorAddress, limit: 1 }, ['name']);
			return {
				address: stake.validatorAddress,
				amount: stake.amount,
				name,
			};
		},
		{ concurrency: response.sentStakes.length },
	);

	// Populate staker account name
	const accountInfo = await getIndexedAccountInfo({ address: params.address, limit: 1 }, ['name']);
	stakesReponse.meta.staker = {
		address: params.address,
		name: accountInfo.name || null,
		publicKey: accountInfo.publicKey || null,
	};

	stakesReponse.meta.count = stakesReponse.data.stakes.length;

	return stakesReponse;
};

module.exports = {
	getStakes,
};

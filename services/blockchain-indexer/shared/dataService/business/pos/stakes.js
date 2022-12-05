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
const { getNameByAddress } = require('../../../utils/validatorUtils');

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

	// TODO: Remove if condition when proper error handling implemented in SDK
	if (!response.error) response.sentStakes
		.forEach(sentStake => stakesReponse.data.stakes.push(normalizeStake(sentStake)));

	// Prepare stakes array
	stakesReponse.data.stakes = await BluebirdPromise.map(
		stakesReponse.data.stakes,
		async stake => {
			const accountInfo = await getIndexedAccountInfo({ address: stake.validatorAddress, limit: 1 }, ['name']);
			const validatorName = accountInfo && accountInfo.name ? accountInfo.name
				: (await getNameByAddress(stake.validatorAddress));

			return {
				address: stake.validatorAddress,
				amount: stake.amount,
				name: validatorName,
			};
		},
		{ concurrency: stakesReponse.data.stakes.length },
	);

	// Populate staker account name
	const accountInfo = await getIndexedAccountInfo({ address: params.address, limit: 1 }, ['name']);
	stakesReponse.meta.staker = {
		address: params.address,
		name: accountInfo && accountInfo.name ? accountInfo.name : null,
		publicKey: accountInfo && accountInfo.publicKey ? accountInfo.publicKey : null,
	};

	stakesReponse.meta.count = stakesReponse.data.stakes.length;

	return stakesReponse;
};

module.exports = {
	getStakes,
};

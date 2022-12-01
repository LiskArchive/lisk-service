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

const { getIndexedAccountInfo } = require('../../../utils/accountUtils');
const { getAddressByName } = require('../../../utils/validatorUtils');
const { parseToJSONCompatObj } = require('../../../utils/parser');
const { requestConnector } = require('../../../utils/request');
const { getNameByAddress } = require('../../../utils/validatorUtils');

const normalizeStake = stake => parseToJSONCompatObj(stake);

const getStakes = async params => {
	const staker = {
		data: {
			account: {},
			stakes: [],
		},
		meta: {},
	};

	if (params.name) {
		params.address = await getAddressByName(params.name);
	}

	const response = await requestConnector('getStaker', { address: params.address });

	// TODO: Remove if condition when proper error handling implemented in SDK
	if (!response.error) response.sentStakes
		.forEach(sentStake => staker.data.stakes.push(normalizeStake(sentStake)));

	staker.data.stakes = await BluebirdPromise.map(
		staker.data.stakes,
		async stake => {
			const accountInfo = await getIndexedAccountInfo({ address: stake.validatorAddress, limit: 1 }, ['name']);
			stake.name = accountInfo && accountInfo.name ? accountInfo.name
				: (await getNameByAddress(stake.validatorAddress));
			return stake;
		},
		{ concurrency: staker.data.stakes.length },
	);

	const accountInfo = await getIndexedAccountInfo({ address: params.address, limit: 1 }, ['name']);
	staker.data.account = {
		address: params.address,
		name: accountInfo && accountInfo.name ? accountInfo.name : null,
		publicKey: accountInfo && accountInfo.publicKey ? accountInfo.publicKey : null,
	};

	const total = staker.data.stakes.length;
	staker.data.stakes = staker.data.stakes.slice(params.offset, params.offset + params.limit);

	staker.meta = {
		count: staker.data.stakes.length,
		offset: params.offset,
		total,
	};

	return staker;
};

module.exports = {
	getStakes,
};

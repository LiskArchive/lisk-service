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
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const {
	address: {
		getLisk32AddressFromPublicKey,
	},
} = require('@liskhq/lisk-cryptography');

const config = require('../../../../config');

const { requestConnector } = require('../../../utils/request');

const validatorsIndexSchema = require('../../../database/schema/validators');

const getValidatorsTable = () => getTableInstance(
	validatorsIndexSchema.tableName,
	validatorsIndexSchema,
	config.endpoints.mysql,
);

const getRewardsLocked = async params => {
	// Params must contain either address or name or publicKey
	if (!Object.keys(params).some(param => ['address', 'name', 'publicKey'].includes(param))) {
		throw new Error('One of params (address, name or publicKey) is required.');
	}

	const tokenID = '0400000000000000';

	// Process address
	let { address } = params;
	if (typeof address === 'undefined' && params.name) {
		const validatorsTable = await getValidatorsTable();

		const queryParams = {
			name: params.name,
			limit: 1,
		};

		[{ address }] = await validatorsTable.find(queryParams, ['address']);
	}
	if (typeof address === 'undefined' && params.publicKey) {
		address = getLisk32AddressFromPublicKey(Buffer.from(params.publicKey, 'hex'));
	}

	const { reward } = await requestConnector('getLockedRewards', { tokenID, address });

	let responseData = [{
		reward,
		tokenID,
	}];

	const totalResponseCount = responseData.length;

	responseData = responseData.slice(params.offset, params.offset + params.limit);

	const responseMeta = {
		count: responseData.length,
		offset: params.offset,
		total: totalResponseCount,
	};

	const response = {
		data: responseData,
		meta: responseMeta,
	};

	return response;
};

module.exports = {
	getRewardsLocked,
};

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
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../../../config');
const stakesIndexSchema = require('../../../database/schema/stakes');

const {
	updateAccountPublicKey,
	getIndexedAccountInfo,
	getLisk32AddressFromPublicKey,
} = require('../../../utils/accountUtils');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getStakesIndex = () => getTableInstance(
	stakesIndexSchema.tableName,
	stakesIndexSchema,
	MYSQL_ENDPOINT,
);

const getPoSStakers = async params => {
	const stakesTable = await getStakesIndex();
	const stakers = {
		data: { stakers: [] },
		meta: {},
	};

	if (params.address) {
		const { address, ...remParams } = params;
		params = remParams;

		params.validatorAddress = address;
	}

	if (params.publicKey) {
		const { publicKey, ...remParams } = params;
		params = remParams;

		params.validatorAddress = getLisk32AddressFromPublicKey(publicKey);

		// Index publicKey
		await updateAccountPublicKey(publicKey);
	}

	if (params.name) {
		const { name, ...remParams } = params;
		params = remParams;

		const { address } = await getIndexedAccountInfo({ name, limit: 1 }, ['address']);
		params.validatorAddress = address;
	}

	// If validatorAddress is unavailable, return empty response
	if (!params.validatorAddress) return stakers;

	// TODO: Use count method directly once support for custom column-based count added https://github.com/LiskHQ/lisk-service/issues/1188
	const [{ numStakers }] = await stakesTable.rawQuery(`SELECT COUNT(stakerAddress) as numStakers from ${stakesIndexSchema.tableName} WHERE validatorAddress='${params.validatorAddress}'`);

	const resultSet = await stakesTable.find(
		{
			validatorAddress: params.validatorAddress,
			limit: numStakers,
		},
		['stakerAddress', 'amount'],
	);
	if (resultSet.length) stakers.data.stakers = resultSet;

	stakers.data.stakers = await BluebirdPromise.map(
		stakers.data.stakers,
		async stake => {
			const { name = null } = await getIndexedAccountInfo({ address: stake.stakerAddress, limit: 1 }, ['name']);
			return {
				address: stake.stakerAddress,
				amount: stake.amount,
				name,
			};
		},
		{ concurrency: stakers.data.stakers.length },
	);

	stakers.data.stakers = stakers.data.stakers.slice(params.offset, params.offset + params.limit);

	const validatorAccountInfo = await getIndexedAccountInfo(
		{ address: params.validatorAddress, limit: 1 },
		['name', 'publicKey'],
	);
	stakers.meta.validator = {
		address: params.validatorAddress,
		name: validatorAccountInfo.name || null,
		publicKey: validatorAccountInfo.publicKey || null,
	};

	stakers.meta.count = stakers.data.stakers.length;
	stakers.meta.offset = params.offset;
	stakers.meta.total = numStakers;

	return stakers;
};

module.exports = {
	getPoSStakers,
};

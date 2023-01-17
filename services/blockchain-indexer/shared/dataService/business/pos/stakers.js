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
	getAccountsTable,
	getLisk32AddressFromPublicKey,
} = require('../../../utils/accountUtils');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getStakesIndex = () => getTableInstance(
	stakesIndexSchema.tableName,
	stakesIndexSchema,
	MYSQL_ENDPOINT,
);

const getStakers = async params => {
	const stakesTable = await getStakesIndex();
	const accountsTable = await getAccountsTable();
	const stakersResponse = {
		data: { stakers: [] },
		meta: {
			validator: {},
			count: 0,
			offset: params.offset,
			total: 0,
		},
	};

	if (params.address) {
		const { address, ...remParams } = params;
		params = remParams;

		params.validatorAddress = address;
		stakersResponse.meta.validator.address = address;
	}

	if (params.publicKey) {
		const { publicKey, ...remParams } = params;
		params = remParams;

		params.validatorAddress = getLisk32AddressFromPublicKey(publicKey);
		stakersResponse.meta.validator.address = params.validatorAddress;
		stakersResponse.meta.validator.publicKey = publicKey;

		// Index publicKey
		await updateAccountPublicKey(publicKey);
	}

	if (params.name) {
		const { name, ...remParams } = params;
		params = remParams;

		const { address } = await getIndexedAccountInfo({ name, limit: 1 }, ['address']);
		params.validatorAddress = address;
		stakersResponse.meta.validator.name = name;
	}

	// If validatorAddress is unavailable, return empty response
	if (!params.validatorAddress) return stakersResponse;

	// Search param is used to filter stakers by name. Prepare list of valid staker addresses
	// for the given search (staker name) param
	const allowedStakersAddressNameMap = {};
	const stakerAddressQueryFilter = {};
	if (params.search) {
		const stakerAccountsInfo = await accountsTable.find(
			{
				search: {
					property: 'name',
					pattern: params.search,
				},
			},
			['name', 'address'],
		);

		stakerAccountsInfo.forEach(accountInfo => {
			allowedStakersAddressNameMap[accountInfo.address] = accountInfo.name;
		});
		stakerAddressQueryFilter.whereIn = {
			property: 'stakerAddress',
			values: Object.keys(allowedStakersAddressNameMap),
		};
	}

	// Fetch list of stakes
	const stakes = await stakesTable.find(
		{
			...stakerAddressQueryFilter,
			validatorAddress: params.validatorAddress,
			limit: params.limit,
			offset: params.offset,
			sort: 'amount:desc',
			order: 'stakerAddress:asc', // Amount sorting tie-breaker
		},
		['stakerAddress', 'amount'],
	);

	// Populate stakers name and prepare response
	stakersResponse.data.stakers = await BluebirdPromise.map(
		stakes,
		async stake => {
			// Try to use cached staker name. Query DB if not found.
			let stakerName = allowedStakersAddressNameMap[stake.stakerAddress];
			if (!stakerName) {
				const accountInfo = await getIndexedAccountInfo({
					address: stake.stakerAddress,
					limit: 1,
				},
				['name'],
				);
				stakerName = accountInfo.name;
			}

			return {
				address: stake.stakerAddress,
				amount: stake.amount,
				name: stakerName,
			};
		},
		{ concurrency: stakes.length },
	);

	const validatorAccountInfo = await getIndexedAccountInfo(
		{ address: params.validatorAddress, limit: 1 },
		['name', 'publicKey'],
	);
	stakersResponse.meta.validator = {
		address: params.validatorAddress,
		name: validatorAccountInfo.name || null,
		publicKey: validatorAccountInfo.publicKey || null,
	};

	stakersResponse.meta.count = stakersResponse.data.stakers.length;
	stakersResponse.meta.offset = params.offset;
	stakersResponse.meta.total = await stakesTable.count({
		...stakerAddressQueryFilter,
		validatorAddress: params.validatorAddress,
	});

	return stakersResponse;
};

module.exports = {
	getStakers,
};

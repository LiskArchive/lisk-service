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
	DB: {
		MySQL: { getTableInstance },
	},
} = require('lisk-service-framework');

const config = require('../../../../config');
const stakesTableSchema = require('../../../database/schema/stakes');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');

const { getIndexedAccountInfo, getAccountsTable } = require('../../utils/account');
const { indexAccountPublicKey } = require('../../../indexer/accountIndex');

const MYSQL_ENDPOINT = config.endpoints.mysqlReplica;

const getStakesTable = () => getTableInstance(stakesTableSchema, MYSQL_ENDPOINT);

const getStakers = async params => {
	const stakesTable = await getStakesTable();
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

		const address = getLisk32AddressFromPublicKey(publicKey);
		// TODO: Remove once gateway param pairings check is updated
		if (params.validatorAddress && params.validatorAddress !== address) return stakersResponse;

		params.validatorAddress = address;
		stakersResponse.meta.validator.address = params.validatorAddress;
		stakersResponse.meta.validator.publicKey = publicKey;

		// Index publicKey
		indexAccountPublicKey(publicKey);
	}

	if (params.name) {
		const { name, ...remParams } = params;
		params = remParams;

		const { address } = await getIndexedAccountInfo({ name }, ['address']);
		// TODO: Remove once gateway param pairings check is updated
		if (params.validatorAddress && params.validatorAddress !== address) return stakersResponse;

		params.validatorAddress = address;
		stakersResponse.meta.validator.name = name;
	}

	// If validatorAddress is unavailable, return empty response
	if (!params.validatorAddress) return stakersResponse;

	// Search param is used to filter stakers by name. Prepare list of valid staker addresses
	// for the given search (staker name) param
	const stakerAddressNameMap = {};
	const stakerAddressQueryFilter = {};
	if (params.search) {
		const stakerAccountsInfo = await accountsTable.find(
			{
				orSearch: [
					{
						property: 'name',
						pattern: params.search,
					},
					{
						property: 'address',
						pattern: params.search,
					},
					{
						property: 'publicKey',
						pattern: params.search,
					},
				],
			},
			['name', 'address'],
		);

		stakerAccountsInfo.forEach(accountInfo => {
			stakerAddressNameMap[accountInfo.address] = accountInfo.name;
		});
		stakerAddressQueryFilter.whereIn = {
			property: 'stakerAddress',
			values: Object.keys(stakerAddressNameMap),
		};
	}

	// Fetch list of stakes
	const stakesQueryParams = Object.freeze({
		...stakerAddressQueryFilter,
		validatorAddress: params.validatorAddress,
		propBetweens: [{ property: 'amount', greaterThan: BigInt('0') }],
		limit: params.limit,
		offset: params.offset,
		sort: 'amount:desc',
		order: 'stakerAddress:asc', // Amount sorting tie-breaker
	});
	const stakes = await stakesTable.find(stakesQueryParams, ['stakerAddress', 'amount']);

	// Populate stakers name and prepare response
	stakersResponse.data.stakers = await BluebirdPromise.map(
		stakes,
		async stake => {
			// Try to use cached staker name. Query DB if not found.
			let stakerName = stakerAddressNameMap[stake.stakerAddress];
			if (!stakerName) {
				const accountInfo = await getIndexedAccountInfo({ address: stake.stakerAddress }, ['name']);
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

	const validatorAccountInfo = await getIndexedAccountInfo({ address: params.validatorAddress }, [
		'name',
		'publicKey',
	]);
	stakersResponse.meta.validator = {
		address: stakersResponse.meta.validator.address || params.validatorAddress,
		name: stakersResponse.meta.validator.name || validatorAccountInfo.name,
		publicKey: stakersResponse.meta.validator.publicKey || validatorAccountInfo.publicKey || null,
	};

	stakersResponse.meta.count = stakersResponse.data.stakers.length;
	stakersResponse.meta.offset = params.offset;
	stakersResponse.meta.total = await stakesTable.count(stakesQueryParams);

	return stakersResponse;
};

module.exports = {
	getStakers,
};

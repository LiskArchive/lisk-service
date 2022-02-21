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

// IMPORTANT: *****************************************************
//
// Requires a running Redis instance.
// Configure 'SERVICE_CORE_REDIS' if Redis is NOT RUNNING on 6379
//
// ****************************************************************

const { when } = require('jest-when');

const { getTxnMinFee } = require('../../shared/core/compat/sdk_v5/transactionsUtils');
const { transactions, minFees } = require('../constants/transactionsMinFee');
const transctionSchemas = require('../constants/schemas');

const getGenesisConfig = () => ({
	blockTime: 10,
	communityIdentifier: 'Lisk',
	maxPayloadLength: 15360,
	bftThreshold: 68,
	minFeePerByte: 1000,
	baseFees: [
		{
			moduleID: 5,
			assetID: 0,
			baseFee: '1000000000',
		},
	],
	rewards: {
		milestones: [
			'500000000',
			'400000000',
			'300000000',
			'200000000',
			'100000000',
		],
		offset: 1451520,
		distance: 3000000,
	},
	minRemainingBalance: '5000000',
	activeDelegates: 101,
	standbyDelegates: 2,
	delegateListRoundOffset: 2,
	unlockFixHeight: 16785878,
	transferFixHeight: 17557156,
	serializationFixHeight: 17557156,
});

const getTxnAssetSchema = ({ moduleID, assetID }) => {
	const [{ schema }] = transctionSchemas.transactionsAssets.filter(
		txSchema => (!moduleID && !assetID)
			|| txSchema.moduleID === moduleID
			|| txSchema.assetID === assetID,
	);
	return schema;
};

describe('Transactions Utils', () => {
	describe('Verify getTxnMinFee', () => {
		const getGenesisConfigMock = jest.fn();
		when(getGenesisConfigMock).mockReturnValue(getGenesisConfig());

		Object.entries(transactions).forEach(([txName, tx]) => {
			it(`For ${txName}`, async () => {
				const getTxnAssetSchemaMock = jest.fn();
				when(getTxnAssetSchemaMock)
					.calledWith(tx)
					.mockReturnValue(getTxnAssetSchema(tx));

				const minFee = await getTxnMinFee(tx, getTxnAssetSchemaMock, getGenesisConfigMock);
				expect(minFee).toBe(minFees[txName]);
			});
		});
	});
});

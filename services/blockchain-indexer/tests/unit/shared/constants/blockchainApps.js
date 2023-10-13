/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const mockedMainchainID = '04000000';

const mockedBlockchainAppsDatabaseRes = [
	{
		chainID: '04000001',
		chainName: 'enevti',
		status: 'registered',
		address: 'lskmh468rxx5kra2xq6x35z9o5haunamm8m3svzup',
		lastUpdated: '1694184350',
		lastCertificateHeight: '5377',
	},
];

const mockedBlockchainAppsValidResponse = {
	data: [
		{
			chainID: '04000001',
			chainName: 'enevti',
			status: 'registered',
			address: 'lskmh468rxx5kra2xq6x35z9o5haunamm8m3svzup',
			lastUpdated: '1694184350',
			lastCertificateHeight: '5377',
			escrowedLSK: '0',
			escrow: [
				{
					escrowChainID: '04000001',
					amount: '0',
					tokenID: '0400000000000000',
				},
			],
		},
	],
	meta: {
		count: 1,
		offset: 0,
		total: 1,
	},
};

const mockedEscrowedAmounts = {
	escrowedAmounts: [
		{
			escrowChainID: '04000001',
			amount: '0',
			tokenID: '0400000000000000',
		},
	],
};

const mockedNetworkStatus = {
	data: {
		version: '4.0.0-beta.5',
		networkVersion: '1.0',
		chainID: '04000000',
		lastBlockID: '30abcd4089a4cdc3641de579e2108d22fe03d1cccfddf7c8640507b1624c1e0a',
		height: 9896,
		finalizedHeight: 9883,
		syncing: false,
		unconfirmedTransactions: 0,
		genesisHeight: 0,
		genesis: {
			block: {
				fromFile: './config/genesis_block.blob',
			},
			blockTime: 10,
			bftBatchSize: 103,
			maxTransactionsSize: 15360,
			minimumCertifyHeight: 1,
			chainID: '04000000',
		},
		network: {
			version: '1.0',
			port: 7667,
			seedPeers: [],
		},
		moduleCommands: [
			'auth:registerMultisignature',
			'interoperability:submitMainchainCrossChainUpdate',
			'interoperability:initializeMessageRecovery',
			'interoperability:recoverMessage',
			'interoperability:registerSidechain',
			'interoperability:recoverState',
			'interoperability:terminateSidechainForLiveness',
			'legacy:reclaimLSK',
			'legacy:registerKeys',
			'pos:registerValidator',
			'pos:reportMisbehavior',
			'pos:unlock',
			'pos:updateGeneratorKey',
			'pos:stake',
			'pos:changeCommission',
			'pos:claimRewards',
			'token:transfer',
			'token:transferCrossChain',
		],
		registeredModules: [
			'auth',
			'dynamicReward',
			'fee',
			'interoperability',
			'legacy',
			'pos',
			'random',
			'token',
			'validators',
		],
		constants: {
			chainID: '04000000',
		},
	},
	meta: {
		lastUpdate: 1694526777,
		lastBlockHeight: 9896,
		lastBlockID: '30abcd4089a4cdc3641de579e2108d22fe03d1cccfddf7c8640507b1624c1e0a',
	},
};

module.exports = {
	mockedMainchainID,
	mockedBlockchainAppsValidResponse,
	mockedEscrowedAmounts,
	mockedBlockchainAppsDatabaseRes,
	mockedNetworkStatus,
};

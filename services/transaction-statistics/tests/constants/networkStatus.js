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
const networkStatus = {
	data: {
		version: '4.0.0-alpha.11',
		networkVersion: '1.0',
		chainID: '04000000',
		lastBlockID: 'dafb41aa2ad47c3824378959aba1c067370e163f0edbaa615138a4bfaa1a13d6',
		height: 15191,
		finalizedHeight: 15056,
		syncing: false,
		unconfirmedTransactions: 0,
		genesis: {
			block: {
				fromFile: './config/genesis_block.blob',
			},
			blockTime: 10,
			bftBatchSize: 103,
			maxTransactionsSize: 15360,
			chainID: '04000000',
		},
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
		network: {
			version: '1.0',
			port: 7667,
			seedPeers: [
				{
					ip: '127.0.0.1',
					port: 7667,
				},
			],
		},
	},
	meta: {
		lastUpdate: 1675938159,
		lastBlockHeight: 15191,
		lastBlockID: 'dafb41aa2ad47c3824378959aba1c067370e163f0edbaa615138a4bfaa1a13d6',
	},
};

module.exports = {
	networkStatus,
};

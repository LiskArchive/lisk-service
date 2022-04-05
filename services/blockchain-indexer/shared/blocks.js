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
const { getIndexedAccountInfo } = require('./utils/accountUtils');
const { getTxnMinFee } = require('./utils/transactionsUtils');
const { parseToJSONCompatObj } = require('./utils/jsonTools');

const { getCurrentHeight } = require('./constants');

const blockchainStore = require('./database/blockchainStore');
const { requestRpc } = require('./utils/appContext');

// Genesis height can be greater that 0
// Blockchain starts form a non-zero block height
const getGenesisHeight = () => blockchainStore.get('genesisHeight');

// The top final block
const getFinalizedHeight = () => blockchainStore.get('finalizedHeight');

const normalizeBlocks = async (blocks, includeGenesisAccounts = false) => {
	const normalizedBlocks = await BluebirdPromise.map(
		blocks.map(block => ({ ...block.header, payload: block.payload })),
		async block => {
			const account = block.generatorPublicKey
				? await getIndexedAccountInfo({ publicKey: block.generatorPublicKey.toString('hex'), limit: 1 }, ['address', 'username'])
				: {};
			block.generatorAddress = account && account.address ? account.address : null;
			block.generatorUsername = account && account.username ? account.username : null;
			block.isFinal = block.height <= (await getFinalizedHeight());
			block.numberOfTransactions = block.payload.length;

			block.size = 0;
			block.totalForged = BigInt(block.reward);
			block.totalBurnt = BigInt('0');
			block.totalFee = BigInt('0');

			await BluebirdPromise.map(
				block.payload,
				async (txn) => {
					txn.minFee = await getTxnMinFee(txn);
					block.size += txn.size;
					block.totalForged += txn.fee;
					block.totalBurnt += txn.minFee;
					block.totalFee += txn.fee - txn.minFee;
				},
				{ concurrency: 1 },
			);

			if (includeGenesisAccounts !== true) {
				const {
					accounts,
					initRounds,
					initDelegates,
					...otherAssets
				} = block.asset;

				block.asset = { ...otherAssets };
			}

			return parseToJSONCompatObj(block);
		},
		{ concurrency: blocks.length },
	);

	return normalizedBlocks;
};

const getBlockByHeight = async (height, includeGenesisAccounts = false) => {
	const response = await requestRpc('getBlockByHeight', { height });
	return normalizeBlocks([response], includeGenesisAccounts);
};

module.exports = {
	getGenesisHeight,
	getFinalizedHeight,
	normalizeBlocks,
	getCurrentHeight,
	getBlockByHeight,
};

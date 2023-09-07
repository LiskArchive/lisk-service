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
const {
	resolveReceivingChainID,
	getUniqueChainIDs,
} = require('../../../../shared/helpers/chain');

const {
	transactions,
} = require('../../../constants/transaction');

describe('Test chain utils', () => {
	const currentChainID = '04000000';

	it('should return current chainID in case of non-Token-TransferCrossChain', async () => {
		const receivingChainID = resolveReceivingChainID(transactions.tokenTransfer, currentChainID);
		expect(receivingChainID).toBe(currentChainID);
	});

	it('should return chainID from params in case of Token-TransferCrossChain', async () => {
		const receivingChainID = resolveReceivingChainID(
			transactions.tokenTransferCrossChain,
			currentChainID,
		);
		expect(receivingChainID).toBe(transactions.tokenTransferCrossChain.params.receivingChainID);
	});

	it('should throw error when called with undefined', async () => {
		expect(async () => resolveReceivingChainID(undefined)).rejects.toThrow(TypeError);
	});

	it('should throw error when called with null', async () => {
		expect(async () => resolveReceivingChainID(null)).rejects.toThrow(TypeError);
	});
});

describe('Test getUniqueChainIDs', () => {
	it('should return unique chainIDs', async () => {
		const txs = [
			{ sendingChainID: '04000000', receivingChainID: '04000001' },
			{ sendingChainID: '04000000', receivingChainID: '04000002' },
		];
		const expectedResponse = ['04000000', '04000001', '04000002'];
		const uniqueChainIDs = await getUniqueChainIDs(txs);
		expect(uniqueChainIDs).toEqual(expectedResponse);
	});

	it('should throw error when called with null', async () => {
		expect(getUniqueChainIDs(null)).rejects.toThrow();
	});

	it('should throw error when called with undefined', async () => {
		expect(getUniqueChainIDs(undefined)).rejects.toThrow();
	});
});

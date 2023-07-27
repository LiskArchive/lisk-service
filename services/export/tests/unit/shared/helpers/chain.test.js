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

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
	indexStatUpdateListener,
	indexingProgressListener,
	getIndexStatus,
} = require('../../../../shared/dataService/indexStatus');

describe('indexStatUpdateListener', () => {
	it('should update index stats', async () => {
		const mockIndexStats = {
			genesisHeight: 0,
			lastBlockHeight: 18779,
			lastIndexedBlockHeight: 13955,
			chainLength: 18780,
			numBlocksIndexed: 13956,
			percentageIndexed: 74.31,
			isIndexingInProgress: false,
		};

		// Call the function
		await indexStatUpdateListener(mockIndexStats);

		// Assert the result
		const indexStatus = await getIndexStatus();
		// eslint-disable-next-line no-restricted-syntax, guard-for-in
		for (const key in indexStatus) {
			expect(mockIndexStats[key]).toEqual(indexStatus.data[key]);
		}
	});
});

describe('indexingProgressListener', () => {
	it('should update indexing in progress status', async () => {
		// Call the function
		indexingProgressListener(2); // Assuming 2 jobs in progress

		// Assert the result
		const indexStatus = await getIndexStatus();
		expect(indexStatus.data.isIndexingInProgress).toBe(true);
	});

	it('should update indexing in progress status to false when no jobs are in progress', async () => {
		// Call the function
		indexingProgressListener(0); // No jobs in progress

		// Assert the result
		const indexStatus = await getIndexStatus();
		expect(indexStatus.data.isIndexingInProgress).toBe(false);
	});
});

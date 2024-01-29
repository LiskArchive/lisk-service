/*
 * LiskHQ/lisk-service
 * Copyright © 2024 Lisk Foundation
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
const { resolve } = require('path');

const mockedRequestFilePath = resolve(`${__dirname}/../../../../shared/helpers/request`);
const mockedHelpersPath = resolve(`${__dirname}/../../../../shared/helpers`);

describe('Test getIndexStatus method', () => {
	it('should return the index status', async () => {
		const mockIndexStatus = {
			data: {
				genesisHeight: 23390992,
				lastBlockHeight: 23827824,
				lastIndexedBlockHeight: 23395523,
				chainLength: 436833,
				numBlocksIndexed: 4532,
				percentageIndexed: 1.03,
				isIndexingInProgress: true,
			},
			meta: {
				lastUpdate: 1706251273,
			},
		};

		jest.mock(mockedRequestFilePath, () => {
			const actual = jest.requireActual(mockedRequestFilePath);
			return {
				...actual,
				requestIndexer() {
					return mockIndexStatus;
				},
			};
		});

		const { getIndexStatus } = require('../../../../shared/helpers/ready');
		const response = await getIndexStatus();

		expect(response).toEqual(mockIndexStatus);
	});
});

describe('Test checkIfIndexReadyForInterval method', () => {
	beforeEach(() => jest.resetModules());

	describe('when indexing is at 100 percent', () => {
		beforeEach(() => {
			const mockIndexStatus = {
				data: {
					genesisHeight: 23390992,
					lastBlockHeight: 23827887,
					lastIndexedBlockHeight: 23827887,
					chainLength: 436896,
					numBlocksIndexed: 436896,
					percentageIndexed: 100,
					isIndexingInProgress: false,
				},
				meta: {
					lastUpdate: 1706251915,
				},
			};

			jest.mock(mockedRequestFilePath, () => {
				const actual = jest.requireActual(mockedRequestFilePath);
				return {
					...actual,
					requestIndexer() {
						return mockIndexStatus;
					},
				};
			});
		});

		it('should return true interval is the day of re-genesis', async () => {
			const { checkIfIndexReadyForInterval } = require('../../../../shared/helpers/ready');
			const want = true;

			const got = await checkIfIndexReadyForInterval('2023-12-05:2023-12-05');
			expect(got).toEqual(want);
		});

		it('should return true interval starts on the day of re-genesis and is in the future', async () => {
			const { checkIfIndexReadyForInterval } = require('../../../../shared/helpers/ready');
			const want = true;

			const got = await checkIfIndexReadyForInterval('2023-12-05:2023-12-31');
			expect(got).toEqual(want);
		});

		it('should return true interval starts before the day of re-genesis and is in the future', async () => {
			const { checkIfIndexReadyForInterval } = require('../../../../shared/helpers/ready');
			const want = true;

			const got = await checkIfIndexReadyForInterval('2023-12-04:2023-12-31');
			expect(got).toEqual(want);
		});
	});

	describe('when indexing is below 100 percent', () => {
		beforeEach(() => {
			const mockIndexStatus = {
				data: {
					genesisHeight: 23390992,
					lastBlockHeight: 23827963,
					lastIndexedBlockHeight: 23631326,
					chainLength: 436972,
					numBlocksIndexed: 15523,
					percentageIndexed: 55,
					isIndexingInProgress: true,
				},
				meta: { lastUpdate: 1706252683 },
			};

			jest.mock(mockedRequestFilePath, () => {
				const actual = jest.requireActual(mockedRequestFilePath);
				return {
					...actual,
					requestIndexer() {
						return mockIndexStatus;
					},
				};
			});

			jest.mock(mockedHelpersPath, () => {
				const actual = jest.requireActual(mockedHelpersPath);
				return {
					...actual,
					getToday() {
						return '2024-01-26';
					},
					getBlocks() {
						// timestamp for block at height 23631326: Wednesday, January 3, 2024 7:59:20 AM
						return { data: [{ timestamp: 1704268760 }] };
					},
				};
			});
		});

		it('should return true when interval ends before the lastIndexedBlockHeight timestamp', async () => {
			const { checkIfIndexReadyForInterval } = require('../../../../shared/helpers/ready');
			const want = true;

			const got = await checkIfIndexReadyForInterval('2023-12-05:2023-12-31');
			expect(got).toEqual(want);
		});

		it('should return false when interval ends the same day but after the lastIndexedBlockHeight timestamp', async () => {
			const { checkIfIndexReadyForInterval } = require('../../../../shared/helpers/ready');
			const want = false;

			const got = await checkIfIndexReadyForInterval('2023-12-05:2024-01-03');
			expect(got).toEqual(want);
		});

		it('should return false when interval ends after the lastIndexedBlockHeight timestamp', async () => {
			const { checkIfIndexReadyForInterval } = require('../../../../shared/helpers/ready');
			const want = false;

			const got = await checkIfIndexReadyForInterval('2023-12-04:2024-01-26');
			expect(got).toEqual(want);
		});

		it('should return false when getBlocks does not return proper response', async () => {
			const mockIndexStatus = {
				data: {
					genesisHeight: 23390992,
					lastBlockHeight: 23827963,
					lastIndexedBlockHeight: 23631326,
					chainLength: 436972,
					numBlocksIndexed: 15523,
					percentageIndexed: 55,
					isIndexingInProgress: true,
				},
				meta: { lastUpdate: 1706252683 },
			};

			jest.mock(mockedRequestFilePath, () => {
				const actual = jest.requireActual(mockedRequestFilePath);
				return {
					...actual,
					requestIndexer() {
						return mockIndexStatus;
					},
				};
			});

			jest.mock(mockedHelpersPath, () => {
				const actual = jest.requireActual(mockedHelpersPath);
				return {
					...actual,
					getToday() {
						return '2024-01-26';
					},
					getBlocks() {
						return { error: true, message: 'mocked error' };
					},
				};
			});

			const { checkIfIndexReadyForInterval } = require('../../../../shared/helpers/ready');
			const want = false;

			const got = await checkIfIndexReadyForInterval('2023-12-05:2023-12-31');
			expect(got).toEqual(want);
		});
	});

	describe('when indexing is around 99.99 percent', () => {
		it('should return true when interval ends today and the indexing lags by 2 blocks', async () => {
			const mockIndexStatus = {
				data: {
					genesisHeight: 23390992,
					lastBlockHeight: 23828082,
					lastIndexedBlockHeight: 23828080,
					chainLength: 437091,
					numBlocksIndexed: 437089,
					percentageIndexed: 99.99,
					isIndexingInProgress: false,
				},
				meta: { lastUpdate: 1706253875 },
			};

			jest.mock(mockedRequestFilePath, () => {
				const actual = jest.requireActual(mockedRequestFilePath);
				return {
					...actual,
					requestIndexer() {
						return mockIndexStatus;
					},
				};
			});

			jest.mock(mockedHelpersPath, () => {
				const actual = jest.requireActual(mockedHelpersPath);
				return {
					...actual,
					getToday() {
						return '2024-01-26';
					},
					getBlocks() {
						// timestamp for block at height 23828080: Friday, January 26, 2024 7:24:10 AM
						return { data: [{ timestamp: 1706253850 }] };
					},
				};
			});

			const { checkIfIndexReadyForInterval } = require('../../../../shared/helpers/ready');
			const want = true;

			const got = await checkIfIndexReadyForInterval('2023-12-05:2024-01-26');
			expect(got).toEqual(want);
		});

		it('should return true when interval ends today and the indexing lags by 10 blocks', async () => {
			const mockIndexStatus = {
				data: {
					genesisHeight: 23390992,
					lastBlockHeight: 23828082,
					lastIndexedBlockHeight: 23828072,
					chainLength: 437091,
					numBlocksIndexed: 437081,
					percentageIndexed: 99.99,
					isIndexingInProgress: false,
				},
				meta: { lastUpdate: 1706253875 },
			};

			jest.mock(mockedRequestFilePath, () => {
				const actual = jest.requireActual(mockedRequestFilePath);
				return {
					...actual,
					requestIndexer() {
						return mockIndexStatus;
					},
				};
			});

			jest.mock(mockedHelpersPath, () => {
				const actual = jest.requireActual(mockedHelpersPath);
				return {
					...actual,
					getToday() {
						return '2024-01-26';
					},
					getBlocks() {
						// timestamp for block at height 23828072: Friday, January 26, 2024 7:22:50 AM
						return { data: [{ timestamp: 1706253770 }] };
					},
				};
			});

			const { checkIfIndexReadyForInterval } = require('../../../../shared/helpers/ready');
			const want = true;

			const got = await checkIfIndexReadyForInterval('2023-12-05:2024-01-26');
			expect(got).toEqual(want);
		});

		it('should return false when interval ends today and the indexing lags by 100 blocks', async () => {
			const mockIndexStatus = {
				data: {
					genesisHeight: 23390992,
					lastBlockHeight: 23828082,
					lastIndexedBlockHeight: 23827982,
					chainLength: 437091,
					numBlocksIndexed: 436991,
					percentageIndexed: 99.97,
					isIndexingInProgress: false,
				},
				meta: { lastUpdate: 1706253875 },
			};

			jest.mock(mockedRequestFilePath, () => {
				const actual = jest.requireActual(mockedRequestFilePath);
				return {
					...actual,
					requestIndexer() {
						return mockIndexStatus;
					},
				};
			});

			jest.mock(mockedHelpersPath, () => {
				const actual = jest.requireActual(mockedHelpersPath);
				return {
					...actual,
					getToday() {
						return '2024-01-26';
					},
					getBlocks() {
						// timestamp for block at height 23827982: Friday, January 26, 2024 7:07:50 AM
						return { data: [{ timestamp: 1706252870 }] };
					},
				};
			});

			const { checkIfIndexReadyForInterval } = require('../../../../shared/helpers/ready');
			const want = false;

			const got = await checkIfIndexReadyForInterval('2023-12-05:2024-01-26');
			expect(got).toEqual(want);
		});
	});
});

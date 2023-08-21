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
const mockedNFTSupportedFilePath = `${__dirname}/../../../../../../shared/utils/request`;

describe('getNFTSupported', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	it("should return isSupportAllNFTs:true when connector return '*' in collectionIDs", async () => {
		// Mock dependencies
		jest.mock(mockedNFTSupportedFilePath, () => {
			const actual = jest.requireActual(mockedNFTSupportedFilePath);
			return {
				...actual,
				requestConnector: async () => ['*'],
			};
		});

		const { getNFTSupported } = require('../../../../../../shared/dataService/business/nft');
		const response = await getNFTSupported();
		expect(response).toEqual({
			data: {
				isSupportAllNFTs: true,
				patternCollectionIDs: [],
				exactCollectionIDs: [],
			},
			meta: {},
		});
	});

	it("should return isSupportAllNFTs:false when connector does not return '*' in collectionIDs", async () => {
		// Mock dependencies
		jest.mock(mockedNFTSupportedFilePath, () => {
			const actual = jest.requireActual(mockedNFTSupportedFilePath);
			return {
				...actual,
				requestConnector: async () => ['00000000********', '00000001********', '0000000210000000', '0000000220000000'],
			};
		});

		const { getNFTSupported } = require('../../../../../../shared/dataService/business/nft');
		const response = await getNFTSupported();
		expect(response).toEqual({
			data: {
				isSupportAllNFTs: false,
				patternCollectionIDs: ['00000000********', '00000001********'],
				exactCollectionIDs: ['0000000210000000', '0000000220000000'],
			},
			meta: {},
		});
	});

	it('should throw error when connector returns null', async () => {
		// Mock dependencies
		jest.mock(mockedNFTSupportedFilePath, () => {
			const actual = jest.requireActual(mockedNFTSupportedFilePath);
			return {
				...actual,
				requestConnector: async () => null,
			};
		});

		const { getNFTSupported } = require('../../../../../../shared/dataService/business/nft');
		expect(getNFTSupported()).rejects.toThrow();
	});
});

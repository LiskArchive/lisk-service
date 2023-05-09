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
describe('Test isMainchain method', () => {
	const mockedFilePath = '../../../shared/dataService/business/network';
	beforeEach(() => jest.resetModules());

	it('should return false -> undefined chainID', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual('../../../shared/dataService/business/network');
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: undefined } };
				},
			};
		});

		const { isMainchain } = require('../../../shared/dataService');
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	it('should return false -> null chainID', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual('../../../shared/dataService/business/network');
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: null } };
				},
			};
		});

		const { isMainchain } = require('../../../shared/dataService');
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	it('should return true -> valid mainchain chainID', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual('../../../shared/dataService/business/network');
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: '04000000' } };
				},
			};
		});

		const { isMainchain } = require('../../../shared/dataService');
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(true);
	});

	it('should return false -> valid sidechain chainID', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual('../../../shared/dataService/business/network');
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: '04000001' } };
				},
			};
		});

		const { isMainchain } = require('../../../shared/dataService');
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	it('should return false -> invalid chainID', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual('../../../shared/dataService/business/network');
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: 'invalid' } };
				},
			};
		});

		const { isMainchain } = require('../../../shared/dataService');
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});
});

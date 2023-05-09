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
const config = require('../../../config');

const mockedFilePath = '../../../shared/dataService/business/network';

beforeEach(() => jest.resetModules());

describe('Test isMainchain method', () => {
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

describe('Test resolveMainchainServiceURL method', () => {
	it('should return devnet mainchain URL -> valid devnet mainchain chainID', async () => {
		const chainID = '04000000';
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual('../../../shared/dataService/business/network');
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID } };
				},
			};
		});

		const { resolveMainchainServiceURL } = require('../../../shared/dataService');
		const result = await resolveMainchainServiceURL();

		const { serviceURL } = config.networks.LISK.find(c => chainID === c.chainID);
		expect(result).toBe(serviceURL);
	});

	it('should return betanet mainchain URL -> valid devnet mainchain chainID', async () => {
		const chainID = '02000000';
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual('../../../shared/dataService/business/network');
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID } };
				},
			};
		});

		const { resolveMainchainServiceURL } = require('../../../shared/dataService');
		const result = await resolveMainchainServiceURL();

		const { serviceURL } = config.networks.LISK.find(c => chainID === c.chainID);
		expect(result).toBe(serviceURL);
	});

	it('should return undefined -> invalid chainID', async () => {
		jest.mock(mockedFilePath, () => {
			const actual = jest.requireActual('../../../shared/dataService/business/network');
			return {
				...actual,
				getNetworkStatus() {
					return { data: { chainID: 'invalid' } };
				},
			};
		});

		const { resolveMainchainServiceURL } = require('../../../shared/dataService');
		const result = await resolveMainchainServiceURL();
		expect(result).toBe(undefined);
	});
});

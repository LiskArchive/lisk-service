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
const dataService = require('../../../shared/dataService');
const { isMainchain } = require('../../../shared/chain');

describe('Test isMainchain method', () => {
	it('should return false -> undefined chainID', async () => {
		jest.spyOn(dataService, 'getNetworkStatus').mockReturnValue({ data: { chainID: undefined } });
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	it('should return false -> null chainID', async () => {
		jest.spyOn(dataService, 'getNetworkStatus').mockReturnValue({ data: { chainID: null } });
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(false);
	});

	// TODO: Include more negative testcases with invalid chainID and sidechain chainIDs

	it('should return true -> valid mainchain chainID', async () => {
		jest.spyOn(dataService, 'getNetworkStatus').mockReturnValue({ data: { chainID: '04000000' } });
		const result = await isMainchain();
		expect(typeof result).toBe('boolean');
		expect(result).toBe(true);
	});
});


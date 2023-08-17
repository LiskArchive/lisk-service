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
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const { getNFTs } = require('../../../../../../shared/dataService/business/nft');

describe('getNFTs', () => {
	it('should throw ValidationException when collectionID is provided without chainID', async () => {
		const params = { collectionID: '10000000' };
		await expect(getNFTs(params)).rejects.toThrow(ValidationException);
	});

	it('should throw ValidationException when index is provided without chainID and collectionID', async () => {
		const params = { index: 1 };
		await expect(getNFTs(params)).rejects.toThrow(ValidationException);
	});
});

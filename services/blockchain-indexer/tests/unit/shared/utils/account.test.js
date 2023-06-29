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

/* eslint-disable import/no-dynamic-require */
const path = require('path');

const acccountFilePath = path.resolve(`${__dirname}/../../../../shared/utils/account`);

// Mock the '@liskhq/lisk-cryptography' library
jest.mock('@liskhq/lisk-cryptography', () => ({
	address: {
		getLisk32AddressFromPublicKey: jest.fn().mockImplementation(() => 'mocked-address'),
	},
}));

describe('Account', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	describe('updateAccountPublicKey', () => {
		it('should generate Lisk32 address and perform upsert on accountsTable', async () => {
			const publicKey = 'mocked-public-key';

			// Mock the lisk-service-framework
			jest.mock('lisk-service-framework', () => {
				const actual = jest.requireActual('lisk-service-framework');
				return {
					...actual,
					Logger: jest.fn().mockImplementation(() => ({
						error: jest.fn(() => {
							throw new Error('Should not log error');
						}),
					})),
					MySQL: {
						getTableInstance: jest.fn(() => ({
							upsert: jest.fn(data => {
								expect(data).toEqual({
									address: 'mocked-address',
									publicKey,
								});
							}),
						})),
					},
				};
			});

			const { updateAccountPublicKey } = require(acccountFilePath);

			await updateAccountPublicKey(publicKey);
		});

		it('should log error when getTableInstance fails', async () => {
			const publicKey = 'mocked-public-key';

			// Mock the lisk-service-framework
			jest.mock('lisk-service-framework', () => {
				const actual = jest.requireActual('lisk-service-framework');
				return {
					...actual,
					Logger: jest.fn().mockImplementation(() => ({
						error: jest.fn((data) => {
							expect(data).toEqual('Error while updating account public key. Error: getTableInstance failed');
						}),
					})),
					MySQL: {
						getTableInstance: jest.fn().mockRejectedValue({ message: 'getTableInstance failed' }),
					},
				};
			});

			const { updateAccountPublicKey } = require(acccountFilePath);

			await updateAccountPublicKey(publicKey);
		});

		it('should log error when adding entry to database fails fails', async () => {
			const publicKey = 'mocked-public-key';

			// Mock the lisk-service-framework
			jest.mock('lisk-service-framework', () => {
				const actual = jest.requireActual('lisk-service-framework');
				return {
					...actual,
					Logger: jest.fn().mockImplementation(() => ({
						error: jest.fn((data) => {
							expect(data).toEqual('Error while updating account public key. Error: upsert failed');
						}),
					})),
					MySQL: {
						getTableInstance: jest.fn(() => ({
							upsert: jest.fn().mockRejectedValue({ message: 'upsert failed' }),
						})),
					},
				};
			});

			const { updateAccountPublicKey } = require(acccountFilePath);

			await updateAccountPublicKey(publicKey);
		});
	});
});

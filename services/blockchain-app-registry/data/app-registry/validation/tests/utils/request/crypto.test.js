/*
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
 */
const https = require('https');

const { getCertificateFromURL } = require('../../../src/utils/request/certificate');

jest.mock('https');

describe('getCertificateFromURL', () => {
	const mockCertificate = { raw: 'mock-certificate' };
	const invalidUrl = 'invalid-url';
	const mockUrl = 'https://example.com';

	beforeEach(() => {
		https.request = jest.fn((options, callback) => {
			const res = {
				socket: {
					getPeerCertificate: jest.fn().mockReturnValue(mockCertificate),
				},
				on: jest.fn(),
				setTimeout: jest.fn(),
				destroy: jest.fn(),
			};
			callback(res);
			return {
				on: jest.fn(),
				end: jest.fn(),
			};
		});
	});

	it('should resolve with the peer certificate', async () => {
		const certificate = await getCertificateFromURL(mockUrl);
		expect(certificate).toEqual(mockCertificate.raw);
	});

	it('should reject with an error if the URL is invalid', async () => {
		await expect(getCertificateFromURL(invalidUrl)).rejects.toThrowError();
	});
});

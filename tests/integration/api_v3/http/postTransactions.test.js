/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const constants = require('../../../constants');
const { api } = require('../../../helpers/api');

const {
	badRequestSchema,
	wrongInputParamSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	postTransactionSchema,
} = require('../../../schemas/api_v3/transaction.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/transactions`;

describe('Post transactions API', () => {
	it('Post transaction succesfully', async () => {
		const postTransaction = await api.post(
			endpoint,
			{ transaction: '0a05746f6b656e12087472616e7366657218002080c2d72f2a20a3f96c50d0446220ef2f98240898515cbba8155730679ca35326d98dcfb680f032270a0800000000000000001080c2d72f1a1474e3ba5ade3e94451bd4de9d19917c8e6eff624d22003a405fd81dc9d48c04f3a197ea9d57236ff208388a57f7686f19f7917e92679d4da162b97b357f941e3a383f6a795fa9710da5c9dc5eda7007e5b4bbe6551e59360c' },
		);
		expect(postTransaction).toMap(postTransactionSchema);
	});

	it('throws error when posting invalid binary transaction', async () => {
		const postTransaction = await api.post(
			endpoint,
			{ transaction: constants.INVALID_TRANSACTION },
			400,
		);
		expect(postTransaction).toMap(badRequestSchema);
	});

	it('throws error in case of invalid query params', async () => {
		const postTransaction = await api.post(
			endpoint,
			{ transactions: constants.INVALID_TRANSACTION },
			400,
		);
		expect(postTransaction).toMap(wrongInputParamSchema);
	});
});

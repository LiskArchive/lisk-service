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

const INVALID_TRANSACTION = '0802100018002080c2d72f2a2027f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322e0880a0cebdf3ef171214aebd99f07218109162a905d0e0c91e58bedc83c51a0e746f6b656e207472616e736665723a40a30998db4e96911a3d784b0a01b817baf64ec9745d7c0407255967506cb01764220e2e6ce66183d07';

describe('Post transactions API', () => {
	it('Post transaction succesfully', async () => {
		const postTransaction = await api.post(
			endpoint,
			{ transaction: '0a05746f6b656e12087472616e7366657218002080c2d72f2a20a3f96c50d0446220ef2f98240898515cbba8155730679ca35326d98dcfb680f032270a0800000000000000001080c2d72f1a1474e3ba5ade3e94451bd4de9d19917c8e6eff624d22003a405fd81dc9d48c04f3a197ea9d57236ff208388a57f7686f19f7917e92679d4da162b97b357f941e3a383f6a795fa9710da5c9dc5eda7007e5b4bbe6551e59360c' },
		);
		expect(postTransaction).toMap(postTransactionSchema);
	});

	it('Throws error when posting invalid binary transaction', async () => {
		const postTransaction = await api.post(
			endpoint,
			{ transaction: INVALID_TRANSACTION },
			400,
		);
		expect(postTransaction).toMap(badRequestSchema);
	});

	it('Throws error in case of invalid query params', async () => {
		const postTransaction = await api.post(
			endpoint,
			{ transactions: INVALID_TRANSACTION },
			400,
		);
		expect(postTransaction).toMap(wrongInputParamSchema);
	});
});

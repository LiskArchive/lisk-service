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

// TODO: Enable test cases once given issue is resolved https://github.com/LiskHQ/lisk-sdk/issues/7172
xdescribe('Post transactions API', () => {
	it('Post transaction succesfully', async () => {
		const postTransaction = await api.post(
			`${endpoint}?transaction='0802100018002080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322e0880a0cebdf3ef171214aebd99f07218109162a905d0e0c91e58bedc83c51a0e746f6b656e207472616e736665723a40a30998db4e96911a3d784b0a01b817baf64ec9745d7c67bc537b060eae27ec7ab85ffbb36d76f2b62eaf796deba0407255967506cb01764220e2e6ce66183d07'`,
		);
		expect(postTransaction).toMap(postTransactionSchema);
	});

	it('throws error when posting invalid binary transaction', async () => {
		const postTransaction = await api.post(
			`${endpoint}?transaction='0802100018002080c2d72f2a2027f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322e0880a0cebdf3ef171214aebd99f07218109162a905d0e0c91e58bedc83c51a0e746f6b656e207472616e736665723a40a30998db4e96911a3d784b0a01b817baf64ec9745d7c0407255967506cb01764220e2e6ce66183d07'`,
		);
		expect(postTransaction).toMap(badRequestSchema);
	});

	it('throws error in case of invalid query params', async () => {
		const postTransaction = await api.post(
			`${endpoint}?transactions='0802100018002080c2d72f2a2027f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322e0880a0cebdf3ef171214aebd99f07218109162a905d0e0c91e58bedc83c51a0e746f6b656e207472616e736665723a40a30998db4e96911a3d784b0a01b817baf64ec9745d7c0407255967506cb01764220e2e6ce66183d07'`,
		);
		expect(postTransaction).toMap(wrongInputParamSchema);
	});
});

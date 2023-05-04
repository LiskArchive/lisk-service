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
			{ transaction: '0a05746f6b656e12087472616e7366657218042080c2d72f2a203972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c32290a0804000000000000001080a094a58d1d1a141284b458bbcd8ea1dcc6a630abc37a2654ce698722003a4062c7b61f02fb89adb0208d403b5488791f9796da6af42cb1685a11fe3ee9171765c974527831cc3ea1b6371a29722a589207f3126c8ebaa9ebb1b83e949e3602' },
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

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
	goodRequestSchema,
	dryrunTransactionSchema,
	metaSchema,
} = require('../../../schemas/api_v3/dryrunTransaction.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV3 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV3}/transactions/dryrun`;

describe('Post dryrun transactions API', () => {
	it('Post dryrun transaction succesfully', async () => {
		const response = await api.post(
			`${endpoint}?transaction=0a05746f6b656e12087472616e7366657218042080c2d72f2a20a3f96c50d0446220ef2f98240898515cbba8155730679ca35326d98dcfb680f032270a0800000000000000001080c2d72f1a1474e3ba5ade3e94451bd4de9d19917c8e6eff624d22003a401a78d6a2d2c5d980bbbe4f12f2d59b937b6dbd7fa01e3644ce3e3d06bf3f5aff2aff728cb902031f93039dd80ba91fabfa4ea4dca813d281ec957789727baa0f`,
		);

		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(dryrunTransactionSchema);
		expect(response.meta).toMap(metaSchema);
	});

	it('throws error when posting invalid binary transaction', async () => {
		const dryrunTransaction = await api.post(
			`${endpoint}?transaction=0802100018002080c2d72f2a2027f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322e0880a0cebdf3ef171214aebd99f07218109162a905d0e0c91e58bedc83c51a0e746f6b656e207472616e736665723a40a30998db4e96911a3d784b0a01b817baf64ec9745d7c0407255967506cb01764220e2e6ce66183d07`,
		);
		expect(dryrunTransaction).toMap(badRequestSchema);
	});

	it('throws error in case of invalid query params', async () => {
		const dryrunTransaction = await api.post(
			`${endpoint}?transactions=0802100018002080c2d72f2a2027f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322e0880a0cebdf3ef171214aebd99f07218109162a905d0e0c91e58bedc83c51a0e746f6b656e207472616e736665723a40a30998db4e96911a3d784b0a01b817baf64ec9745d7c0407255967506cb01764220e2e6ce66183d07`,
		);
		expect(dryrunTransaction).toMap(wrongInputParamSchema);
	});
});

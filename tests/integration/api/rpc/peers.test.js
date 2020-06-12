/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
import to from 'await-to-js';
import Joi from '@hapi/joi';

import peerSchema from '../../schemas/peer.schema';
import { api } from '../../helpers/socketIoRpcRequest';
import { JSON_RPC } from '../../helpers/errorCodes';
import { badRequestSchema, goodRequestSchema } from '../../helpers/schemas';

const peerListSchema = Joi.array().items(peerSchema).required();

describe('get.peers', () => {
	const requestPeers = params => api.getJsonRpcV1('get.peers', params);

	it('is able to receive data', async () => {
		const response = await requestPeers({});
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(peerListSchema.length(10));
	});

	it('invalid IP fails', async () => {
		const [error] = await to(requestPeers({ ip: 0 }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('non-existent IP returns empty', async () => {
		const response = await requestPeers({ ip: '256.256.256.256' });
		expect(response).toBeEmpty();
	});

	it('non-existent HTTP port returns empty', async () => {
		const response = await requestPeers({ httpPort: 70000000 });
		expect(response).toBeEmpty();
	});

	it('non-existent WebSocket port returns empty', async () => {
		const response = await requestPeers({ wsPort: 70000000 });
		expect(response).toBeEmpty();
	});

	it('non-existent version returns empty', async () => {
		const response = await requestPeers({ os: 'linux4.4.0-134-generic0000000' });
		expect(response).toBeEmpty();
	});


	it('non-existent version fails', async () => {
		const [error] = await to(requestPeers({ version: null }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('wrong state fails', async () => {
		const [error] = await to(requestPeers({ state: 3 }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('non-existent height returns empty', async () => {
		const response = await requestPeers({ height: 1000000000 });
		expect(response).toBeEmpty();
	});

	it('non-existent broadhash returns empty', async () => {
		const response = await requestPeers({ broadhash: 'bf8b9d02a2167933be8c4a22b90992aee55204dca4452b3844208754a3baeb7b000000' });

		expect(response).toBeEmpty();
	});

	it('valid limit and offset works', async () => {
		const limit = 2;
		const response = await requestPeers({ limit, offset: 3 });
		expect(response).toMap(goodRequestSchema);
		expect(response.data).toMap(peerListSchema.length(limit));
	});

	it('too small limit fails', async () => {
		const [error] = await to(requestPeers({ limit: 0 }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('too big limit fails', async () => {
		const [error] = await to(requestPeers({ limit: 101 }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('invalid offset fails', async () => {
		const [error] = await to(requestPeers({ offset: null }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('big offset returns empty', async () => {
		const response = await requestPeers({ offset: 1000000 });
		expect(response).toBeEmpty();
	});

	it('empty sort fails', async () => {
		const [error] = await to(requestPeers({ sort: '' }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});

	it('invalid sort fails', async () => {
		const [error] = await to(requestPeers({ sort: 'height:ascc' }));
		expect(error).toMap(badRequestSchema, { code: JSON_RPC.INVALID_PARAMS[0] });
	});
});

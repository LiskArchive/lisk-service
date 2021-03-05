/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	jsonRpcEnvelopeSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	statusSchema,
	readySchema,
} = require('../../../schemas/status.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-status`;
const requestStatus = async () => request(wsRpcUrl, 'get.status');
const requestReadiness = async () => request(wsRpcUrl, 'get.ready');

describe('Status reporting', () => {
	it('returns status', async () => {
		const response = await requestStatus();
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(statusSchema);
	});

	it('returns gateway readiness', async () => {
		const response = await requestReadiness();
		expect(response).toMap(jsonRpcEnvelopeSchema);
		const { result } = response;
		expect(result).toMap(readySchema);
	});
});

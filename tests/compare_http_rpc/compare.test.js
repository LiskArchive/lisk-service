/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
import api from '../helpers/api';
import config from './config';

const { request } = require('../helpers/socketIoRpcRequest');

const httpUrl = config.SERVICE_HTTP || 'http://127.0.0.1:9901';
const wsUrl = config.SERVICE_WS || 'ws://127.0.0.1:9901/rpc';

const tests = require('./tests');

const wsRequest = async (url, method, params) => request(url, method, params);

describe(`Routes from ${httpUrl} vs ${wsUrl}`, () => {
	tests.forEach(({ http = {}, rpc = {}, commonParams = {} }) => {
		it(`${http.url} matches ${rpc.method}`, async () => {
			const urlParams = new URLSearchParams({ ...commonParams, ...http.params });
			const httpResponse = await api.get(`${httpUrl}${http.url}?${urlParams}`);
			const wsResponse = await wsRequest(wsUrl, rpc.method, { ...commonParams, ...rpc.params });
			expect(httpResponse.data).toEqual(wsResponse.result.data);
		});
	});
});

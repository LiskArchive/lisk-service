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
const config = require('../../../../config');
const { api } = require('../../../../helpers/api');

const {
	balanceAscending,
	nonDelegate,
	delegate,
	delegateWithIsDelegate,
} = require('../expectedResponse/http/accounts');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/accounts`;

describe('Accounts API', () => {
	it('Retrieve list of accounts by balance ascending', async () => {
		const response = await api.get(`${endpoint}?sort=balance:asc`);
		expect(response).toStrictEqual(balanceAscending);
	});

	it(`Retrieve a non-delegate account with address: ${nonDelegate.data[0].summary.address}`, async () => {
		const response = await api.get(`${endpoint}?address=${nonDelegate.data[0].summary.address}`);
		expect(response).toStrictEqual(nonDelegate);
	});

	it(`Retrieve a delegate account with address: ${delegate.data[0].summary.address}`, async () => {
		const response = await api.get(`${endpoint}?address=${delegate.data[0].summary.address}`);
		expect(response).toStrictEqual(delegate);
	});

	it(`Retrieve a delegate account with 'isDelegate' request param and address: ${delegateWithIsDelegate.data[0].summary.address}`, async () => {
		const response = await api.get(`${endpoint}?address=${delegateWithIsDelegate.data[0].summary.address}&isDelegate=true`);
		expect(response).toStrictEqual(delegateWithIsDelegate);
	});
});

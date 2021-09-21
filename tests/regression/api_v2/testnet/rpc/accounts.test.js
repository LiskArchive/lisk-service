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
const { request } = require('../../../../helpers/socketIoRpcRequest');

const {
	balanceAscending,
	nonDelegate,
	delegate,
	delegateWithIsDelegate,
} = require('../expectedResponse/rpc/accounts');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getAccounts = async params => request(wsRpcUrl, 'get.accounts', params);

describe('Accounts API', () => {
	it('Retrieve list of accounts by balance ascending', async () => {
		const response = await getAccounts({ sort: 'balance:asc' });
		expect(response).toStrictEqual(balanceAscending);
	});

	it(`Retrieve a non-delegate account with address: ${nonDelegate.result.data[0].summary.address}`, async () => {
		const response = await getAccounts({ address: nonDelegate.result.data[0].summary.address });
		expect(response).toStrictEqual(nonDelegate);
	});

	it(`Retrieve a delegate account with address: ${delegate.result.data[0].summary.address}`, async () => {
		const response = await getAccounts({ address: delegate.result.data[0].summary.address });
		expect(response).toStrictEqual(delegate);
	});

	it(`Retrieve a delegate account with 'isDelegate' request param and address: ${delegateWithIsDelegate.result.data[0].summary.address}`, async () => {
		const response = await getAccounts({
			address: delegateWithIsDelegate.result.data[0].summary.address,
			isDelegate: true,
		});
		expect(response).toStrictEqual(delegateWithIsDelegate);
	});
});

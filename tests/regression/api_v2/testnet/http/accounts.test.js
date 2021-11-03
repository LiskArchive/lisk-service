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

		expect(response).toEqual(expect.objectContaining({
			data: expect.any(Array),
			meta: expect.any(Object),
		}));

		// response.data
		const [account] = response.data;
		const { token, summary, sequence, dpos, ...remAccount } = account;

		Object.getOwnPropertyNames(remAccount).forEach((prop) => {
			expect(remAccount[prop])
				.toStrictEqual(delegate.data[0][prop]);
		});

		// account.token
		const { balance: tokenBal, ...remToken } = token;
		expect(tokenBal).toBeDefined();
		expect(typeof tokenBal).toBe('string');
		Object.getOwnPropertyNames(remToken).forEach((prop) => {
			expect(remToken[prop])
				.toStrictEqual(delegate.data[0].token[prop]);
		});

		// account.summary
		const { balance: summaryBal, ...remSummary } = summary;
		expect(summaryBal).toBeDefined();
		expect(typeof summaryBal).toBe('string');
		expect(summaryBal).toBe(tokenBal);
		Object.getOwnPropertyNames(remSummary).forEach((prop) => {
			expect(remSummary[prop])
				.toStrictEqual(delegate.data[0].summary[prop]);
		});

		// account.sequence
		const { nonce, ...remSequence } = sequence;
		expect(nonce).toBeDefined();
		expect(typeof nonce).toBe('string');
		expect(BigInt(nonce))
			.toBeGreaterThanOrEqual(BigInt(delegate.data[0].sequence.nonce));
		Object.getOwnPropertyNames(remSequence).forEach((prop) => {
			expect(remSequence[prop])
				.toStrictEqual(delegate.data[0].sequence[prop]);
		});

		// account.dpos
		const { delegate: accDelegate, ...remDpos } = dpos;
		expect(accDelegate).toBeDefined();
		expect(accDelegate).toBeInstanceOf(Object);

		const { rank, status, ...remDelegate } = accDelegate;
		expect(rank).toBeDefined();
		expect(typeof rank).toBe('number');

		expect(status).toBeDefined();
		expect(typeof status).toBe('string');

		Object.getOwnPropertyNames(remDelegate).forEach((prop) => {
			expect(remDelegate[prop])
				.toStrictEqual(delegate.data[0].dpos.delegate[prop]);
		});
		Object.getOwnPropertyNames(remDpos).forEach((prop) => {
			expect(remDpos[prop])
				.toStrictEqual(delegate.data[0].dpos[prop]);
		});

		// response.meta
		expect(response.meta).toStrictEqual(delegate.meta);
	});

	it(`Retrieve a delegate account with 'isDelegate' request param and address: ${delegateWithIsDelegate.data[0].summary.address}`, async () => {
		const response = await api.get(`${endpoint}?address=${delegateWithIsDelegate.data[0].summary.address}&isDelegate=true`);

		expect(response).toEqual(expect.objectContaining({
			data: expect.any(Array),
			meta: expect.any(Object),
		}));

		// response.data
		const [account] = response.data;
		const { token, summary, sequence, dpos, ...remAccount } = account;

		Object.getOwnPropertyNames(remAccount).forEach((prop) => {
			expect(remAccount[prop])
				.toStrictEqual(delegateWithIsDelegate.data[0][prop]);
		});

		// account.token
		const { balance: tokenBal, ...remToken } = token;
		expect(tokenBal).toBeDefined();
		expect(typeof tokenBal).toBe('string');
		Object.getOwnPropertyNames(remToken).forEach((prop) => {
			expect(remToken[prop])
				.toStrictEqual(delegateWithIsDelegate.data[0].token[prop]);
		});

		// account.summary
		const { balance: summaryBal, ...remSummary } = summary;
		expect(summaryBal).toBeDefined();
		expect(typeof summaryBal).toBe('string');
		expect(summaryBal).toBe(tokenBal);
		Object.getOwnPropertyNames(remSummary).forEach((prop) => {
			expect(remSummary[prop])
				.toStrictEqual(delegateWithIsDelegate.data[0].summary[prop]);
		});

		// account.sequence
		const { nonce, ...remSequence } = sequence;
		expect(nonce).toBeDefined();
		expect(typeof nonce).toBe('string');
		expect(BigInt(nonce))
			.toBeGreaterThanOrEqual(BigInt(delegateWithIsDelegate.data[0].sequence.nonce));
		Object.getOwnPropertyNames(remSequence).forEach((prop) => {
			expect(remSequence[prop])
				.toStrictEqual(delegateWithIsDelegate.data[0].sequence[prop]);
		});

		// account.dpos
		const { delegate: accDelegate, ...remDpos } = dpos;
		expect(accDelegate).toBeDefined();
		expect(accDelegate).toBeInstanceOf(Object);

		const { rank, status, ...remDelegate } = accDelegate;
		expect(rank).toBeDefined();
		expect(typeof rank).toBe('number');

		expect(status).toBeDefined();
		expect(typeof status).toBe('string');

		Object.getOwnPropertyNames(remDelegate).forEach((prop) => {
			expect(remDelegate[prop])
				.toStrictEqual(delegateWithIsDelegate.data[0].dpos.delegate[prop]);
		});
		Object.getOwnPropertyNames(remDpos).forEach((prop) => {
			expect(remDpos[prop])
				.toStrictEqual(delegateWithIsDelegate.data[0].dpos[prop]);
		});

		// response.meta
		expect(response.meta).toStrictEqual(delegateWithIsDelegate.meta);
	});
});

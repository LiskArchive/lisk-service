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
import api from '../../helpers/api';
import config from '../../config';
import schema from '../../helpers/bitcoinSchema';

const baseUrl = config.MOCK_ENDPOINT;
const accountEndpoint = `${baseUrl}/account`;
const txEndpoint = `${baseUrl}/transaction`;
const txsEndpoint = `${baseUrl}/transactions`;
const utxoEndpoint = `${baseUrl}/utxo`;

const envelopSchema = {
	data: 'object',
	links: 'object',
	meta: 'object',
};

describe('GET /account/:address', () => {
	it('it retrieves address data', async () => {
		const result = await api.get(`${accountEndpoint}/2N4fUuW4R8a6JWPGtCJDVBWoyVxQDneHDkH`);
		expect(result).toMapRequiredSchema(envelopSchema);
		expect(result.data).toMapRequiredSchema({
			...schema.account,
			address: '2N4fUuW4R8a6JWPGtCJDVBWoyVxQDneHDkH',
		});
	});
});

describe('GET /transactions/:address', () => {
	it('it retrieves transactions data', async () => {
		const result = await api.get(`${txsEndpoint}/2N4fUuW4R8a6JWPGtCJDVBWoyVxQDneHDkH`);
		expect(result).toMapRequiredSchema(envelopSchema);
		const { data } = result;
		data.forEach((tx) => {
			expect(tx).toMapRequiredSchema(schema.txsEnvelop);
			expect(tx.tx).toMapRequiredSchema(schema.txsTx);
			expect(tx.block).toMapRequiredSchema(schema.txs.block);
			expect(tx.tx.inputs[0]).toMapRequiredSchema(schema.txs.tx.inputs[0]);
			expect(tx.tx.inputs[0].txDetail).toMapRequiredSchema(schema.txDetail);
			expect(tx.tx.outputs[0]).toMapRequiredSchema(schema.txs.tx.outputs[0]);
			expect(tx.tx.outputs[0].scriptPubKey).toMapRequiredSchema(schema.scriptPubKey);
		});
	});
});

describe('GET /transaction/:txhash', () => {
	it('it retrieves address data', async () => {
		const result = await api.get(`${txEndpoint}/3241ec09ec903f19cc65b8eab6eb07681d2469607c18427b2831b42309ad9f61`);
		expect(result).toMapRequiredSchema(envelopSchema);
		const { data } = result;
		data.forEach((tx) => {
			expect(tx).toMapRequiredSchema(schema.txEnvelop);
			expect(tx.tx).toMapRequiredSchema(schema.txsTx);
			expect(tx.tx.inputs[0]).toMapRequiredSchema(schema.tx.tx.inputs[0]);
			expect(tx.tx.inputs[0].txDetail).toMapRequiredSchema(schema.txDetail);
			expect(tx.tx.outputs[0]).toMapRequiredSchema(schema.tx.tx.outputs[0]);
			expect(tx.tx.outputs[0].scriptPubKey).toMapRequiredSchema(schema.scriptPubKey);
		});
	});
});

describe('GET /utxo/:address', () => {
	xit('it retrieves address data', async () => {
		const result = await api.get(`${utxoEndpoint}/2N6pTYQoXSTEuBY5vv9ADi2QLX5wkLHDzbc`);
		expect(result).toMapRequiredSchema(envelopSchema);
		const { data } = result;
		data.forEach((tx) => {
			expect(tx).toMapRequiredSchema(schema.utxo);
		});
	});
});

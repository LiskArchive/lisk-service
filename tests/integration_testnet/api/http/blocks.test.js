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
/* eslint-disable quotes, quote-props, comma-dangle */

import api from '../../helpers/api';
import block from './constants/blocks';
import config from '../../config';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/blocks`;
const blockEndpoint = `${baseUrlV1}/block`;

const genesisBlockId = '6524861224470851795';

const blockSchema = {
	height: 'number',
	id: 'string',
	generatorAddress: 'string',
	generatorPublicKey: 'string',
	generatorUsername: 'string',
	numberOfTransactions: 'number',
	reward: 'string',
	timestamp: 'number',
	totalAmount: 'string',
	totalFee: 'string',
	totalForged: 'string',
};

const delegate = {
	address: '9528507096611161860L',
	username: 'genesis_71',
	publicKey: 'fab7b58be4c1e9542c342023b52e9d359ea89a3af34440bdb97318273e8555f0',
};

const badRequestSchema = {
	errors: 'array',
	message: 'string',
};

const notFoundSchema = {
	error: 'boolean',
	message: 'string',
};

const wrongInputParamSchema = {
	error: 'boolean',
	message: 'string',
};

describe('Blocks', () => {
	describe('GET /blocks', () => {
		it('returns list of blocks when called with no params', async () => {
			const response = await api.get(`${endpoint}?limit=1`);
			expect(response.data[0]).toMapRequiredSchema({
				...blockSchema,
				id: '10045158952652080687',
			});
		});

		it('known block by block ID -> ok', async () => {
			const response = await api.get(`${endpoint}?id=${block.id}`);
			expect(response.data[0]).toMapRequiredSchema({
				...blockSchema,
				id: block.id,
			});
		});

		it('known block by height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=${block.height}`);
			expect(response.data.length).toEqual(1);
			expect(response.data[0]).toMapRequiredSchema({
				...blockSchema,
				height: block.height,
			});
			expect(response.data[0].height).toEqual(block.height);
		});

		it('known block by account -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${delegate.address}`);
			response.data.forEach(blockData => {
				expect(blockData.generatorAddress).toEqual(delegate.address);
			});
		});

		it('known block by publickey -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${delegate.publicKey}`);
			response.data.forEach(blockData => {
				expect(blockData.generatorAddress).toEqual(delegate.address);
			});
		});

		it('known block by username -> ok', async () => {
			const response = await api.get(`${endpoint}?address=${delegate.username}`);
			response.data.forEach(blockData => {
				expect(blockData.generatorAddress).toEqual(delegate.address);
			});
		});

		it('block list by unknown account ID fails with 404', async () => {
			const response = await api.get(`${endpoint}?address=122233344455667L`, 404);
			expect(response).toMapRequiredSchema(notFoundSchema);
		});

		it('too long block id -> 400', () => expect(api.get(`${endpoint}?id=fkfkfkkkffkfkfk10101010101010101010`, 400)).resolves.toMapRequiredSchema(badRequestSchema));

		it('empty block id -> 400', () => expect(api.get(`${endpoint}?id=`, 400)).resolves.toMapRequiredSchema(badRequestSchema));

		it('non-existent block id -> 404', () => expect(api.get(`${endpoint}?id=12602944501676077162`, 404)).resolves.toMapRequiredSchema(notFoundSchema));

		it('invalid query parameter -> 400', () => expect(api.get(`${endpoint}?block=12602944501676077162`, 400)).resolves.toMapRequiredSchema(wrongInputParamSchema));


		it('known height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=${block.height}`);
			expect(response.data[0]).toMapRequiredSchema({
				...blockSchema,
				height: block.height,
			});
		});

		it('non-existent height -> 404', () => expect(api.get(`${endpoint}?height=2000000000`, 404)).resolves.toMapRequiredSchema(notFoundSchema));

		it('empty height -> 400', () => expect(api.get(`${endpoint}?height=`, 400)).resolves.toMapRequiredSchema(badRequestSchema));

		it('limit=100 -> ok', async () => {
			const response = await api.get(`${endpoint}?limit=100`);
			expect(response.data).toBeArrayOfSize(100);
			expect(response.data[0]).toMapRequiredSchema(blockSchema);
		});

		it('0 -> 400', () => expect(api.get(`${endpoint}?limit=0`, 400)).resolves.toMapRequiredSchema(badRequestSchema));

		it('empty limit -> 400', () => expect(api.get(`${endpoint}?limit=`, 400)).resolves.toMapRequiredSchema(badRequestSchema));
	});

	describe('GET /blocks/last', () => {
		it('limit=100 -> ok', async () => {
			const response = await api.get(`${endpoint}/last?limit=100`);
			expect(response.data).toBeArrayOfSize(100);
			expect(response.data[0]).toMapRequiredSchema(blockSchema);
		});

		it('0 -> 400', () => expect(api.get(`${endpoint}/last?limit=0`, 400)).resolves.toMapRequiredSchema(badRequestSchema));

		it('empty limit -> 400', () => expect(api.get(`${endpoint}/last?limit=`, 400)).resolves.toMapRequiredSchema(badRequestSchema));
	});

	describe('GET /blocks/best', () => {
		it('limit=100 -> ok', async () => {
			const response = await api.get(`${endpoint}/best?limit=100`);
			expect(response.data).toBeArrayOfSize(100);
		});

		it('0 -> 400', () => expect(api.get(`${endpoint}/best?limit=0`, 400)).resolves.toMapRequiredSchema(badRequestSchema));

		it('empty limit -> 400', () => expect(api.get(`${endpoint}/best?limit=`, 400)).resolves.toMapRequiredSchema(badRequestSchema));
	});

	describe('GET /block/{blockId}', () => {
		it('gets genesis block', async () => {
			const response = await api.get(`${blockEndpoint}/${genesisBlockId}`);
			expect(response.data).toEqual([{
				"blockSignature": "c81204bf67474827fd98584e7787084957f42ce8041e713843dd2bb352b73e81143f68bd74b06da8372c43f5e26406c4e7250bbd790396d85dea50d448d62606",
				"confirmations": 24254,
				"generatorAddress": "1085993630748340485L",
				"generatorPublicKey": "c96dec3595ff6041c3bd28b76b8cf75dce8225173d1bd00241624ee89b50f2a8",
				"height": 1,
				"id": "6524861224470851795",
				"numberOfTransactions": 103,
				"payloadHash": "198f2b61a8eb95fbeed58b8216780b68f697f26b849acf00c8c93bb9b24f783d",
				"payloadLength": 19619,
				"previousBlockId": "",
				"reward": "0",
				"timestamp": 1464109200,
				"totalAmount": "10000000000000000",
				"totalFee": "0",
				"totalForged": "0",
				"version": 0
			}]);
			expect(response.meta).toEqual({
				"count": 1,
				"offset": 0,
				"total": 1
			});
		});

		it('invalid block id -> 404', () => expect(api.get(`${blockEndpoint}/123234`, 404)).resolves.toMapRequiredSchema(notFoundSchema));
	});


	describe('GET /block/{blockId}/transactions', () => {
		it('Transactions for genesis block -> ok', async () => {
			const response = await api.get(`${blockEndpoint}/${genesisBlockId}/transactions`);
			expect(response.data).toBeArrayOfSize(10);
			expect(response.data[0]).toEqual({
				"amount": "10000000000000000",
				"asset": {},
				"blockId": "6524861224470851795",
				"confirmations": 24254,
				"fee": "0",
				"height": 1,
				"id": "1465651642158264047",
				"recipientId": "16313739661670634666L",
				"recipientPublicKey": "c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f",
				"senderId": "1085993630748340485L",
				"senderPublicKey": "c96dec3595ff6041c3bd28b76b8cf75dce8225173d1bd00241624ee89b50f2a8",
				"signature": "d8103d0ea2004c3dea8076a6a22c6db8bae95bc0db819240c77fc5335f32920e91b9f41f58b01fc86dfda11019c9fd1c6c3dcbab0a4e478e3c9186ff6090dc05",
				"signatures": [],
				"timestamp": 1464109200,
				"type": 0
			});
			expect(response.meta).toEqual({
				"count": 10,
				"offset": 0,
				"total": 103
			});
		});

		it('Transactions for genesis block with limit 100 -> ok', async () => {
			const response = await api.get(`${blockEndpoint}/${genesisBlockId}/transactions?limit=100`);
			expect(response.data).toBeArrayOfSize(100);
			expect(response.data[0]).toEqual({
				"amount": "10000000000000000",
				"asset": {},
				"blockId": "6524861224470851795",
				"confirmations": 24254,
				"fee": "0",
				"height": 1,
				"id": "1465651642158264047",
				"recipientId": "16313739661670634666L",
				"recipientPublicKey": "c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f",
				"senderId": "1085993630748340485L",
				"senderPublicKey": "c96dec3595ff6041c3bd28b76b8cf75dce8225173d1bd00241624ee89b50f2a8",
				"signature": "d8103d0ea2004c3dea8076a6a22c6db8bae95bc0db819240c77fc5335f32920e91b9f41f58b01fc86dfda11019c9fd1c6c3dcbab0a4e478e3c9186ff6090dc05",
				"signatures": [],
				"timestamp": 1464109200,
				"type": 0
			});
			expect(response.meta).toEqual({
				"count": 100,
				"offset": 0,
				"total": 103
			});
		});

		it('Transactions for genesis block with limit 100 anf offset 100 -> ok', async () => {
			const response = await api.get(`${blockEndpoint}/${genesisBlockId}/transactions?limit=100&offset=100`);
			expect(response.data).toBeArrayOfSize(3);
			expect(response.data[0]).toEqual({
				"amount": "0",
				"asset": {
					"delegate": {
						"address": "10881167371402274308L",
						"publicKey": "addb0e15a44b0fdc6ff291be28d8c98f5551d0cd9218d749e30ddb87c6e31ca9",
						"username": "genesis_100"
					}
				},
				"blockId": "6524861224470851795",
				"confirmations": 24254,
				"fee": "0",
				"height": 1,
				"id": "8500285156990763245",
				"recipientId": "",
				"recipientPublicKey": "",
				"senderId": "10881167371402274308L",
				"senderPublicKey": "addb0e15a44b0fdc6ff291be28d8c98f5551d0cd9218d749e30ddb87c6e31ca9",
				"signature": "5495bea66b026b0d6b72bab8611fca9c655c1f023267f3c51453c950aa3d0e0eb08b0bc04e6355909abd75cd1d4df8c3048a55c3a98d0719b4b71e5d527e580a",
				"signatures": [],
				"timestamp": 1464109200,
				"type": 2
			});
			expect(response.meta).toEqual({
				"count": 3,
				"offset": 100,
				"total": 103
			});
		});

		it('Blocks with from...to timestamp', async () => {
			const from = '1497856650';
			const to = '1497856660';
			const totalNumberOfBlocks = 2;
			const response = await api.get(`${endpoint}?from=${from}&to=${to}`);
			expect(response.data).toBeArrayOfSize(totalNumberOfBlocks);
			expect(response.meta.count).toEqual(totalNumberOfBlocks);
			response.data.forEach(blockItem => {
				expect(blockItem.timestamp).toBeGreaterThanOrEqual(parseInt(from, 10));
				expect(blockItem.timestamp).toBeLessThanOrEqual(parseInt(to, 10));
			});
		});

		it('invalid block id -> 404', () => expect(api.get(`${blockEndpoint}/123234/transactions`, 404)).resolves.toMapRequiredSchema(notFoundSchema));

		it('block with no transactions -> 404', () => expect(api.get(`${blockEndpoint}/12888533172885756103/transactions`, 404)).resolves.toMapRequiredSchema(notFoundSchema));
	});
});

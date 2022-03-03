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
const {
	parseToJSONCompatObj,
} = require('../../shared/jsonTools');

describe('jsonTools tests', () => {
	it('Parse buffer', async () => {
		const bufferData = Buffer.from('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'hex');
		const parsedResult = parseToJSONCompatObj(bufferData);
		expect(typeof parsedResult).toBe('string');
		expect(parsedResult).toEqual('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
	});

	it('Parse string', async () => {
		const parsedResult = parseToJSONCompatObj('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
		expect(typeof parsedResult).toBe('string');
		expect(parsedResult).toEqual('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
	});

	it('Parse number', async () => {
		const data = 10;
		const parsedResult = parseToJSONCompatObj(data);
		expect(typeof parsedResult).toBe('number');
		expect(parsedResult).toEqual(data);
	});

	it('Parse boolean', async () => {
		const parsedResult = parseToJSONCompatObj(true);
		expect(typeof parsedResult).toBe('boolean');
		expect(parsedResult).toEqual(true);
	});

	it('Parse array of big integers', async () => {
		const data = [BigInt(1000000000), BigInt(2000000000), BigInt(3000000000)];
		const parsedResult = parseToJSONCompatObj(data);
		expect(parsedResult).toBeInstanceOf(Array);
		expect(parsedResult).toEqual(['1000000000', '2000000000', '3000000000']);
	});

	it('Parse array of numbers', async () => {
		const data = [1000000000, 2000000000, 3000000000];
		const parsedResult = parseToJSONCompatObj(data);
		expect(parsedResult).toBeInstanceOf(Array);
		expect(parsedResult).toEqual([1000000000, 2000000000, 3000000000]);
	});

	it('Parse array of boolean', async () => {
		const data = [true, false, true];
		const parsedResult = parseToJSONCompatObj(data);
		expect(parsedResult).toBeInstanceOf(Array);
		expect(parsedResult).toEqual([true, false, true]);
	});

	it('Parse array of strings', async () => {
		const data = ['genesis_19', 'genesis_17', 'genesis_85'];
		const parsedResult = parseToJSONCompatObj(data);
		expect(parsedResult).toBeInstanceOf(Array);
		expect(parsedResult).toEqual(['genesis_19', 'genesis_17', 'genesis_85']);
	});

	it('Parse array of object', async () => {
		const data = [{
			delegateAddress: Buffer.from('8a9494ab112fb99ffd0ae8b653c4ed4e27f87fcb', 'hex'),
			amount: BigInt(2000000000),
			unvoteHeight: 934107,
		}];
		const parsedResult = parseToJSONCompatObj(data);
		expect(parsedResult).toBeInstanceOf(Array);
		expect(parsedResult[0]).toMatchObject({
			delegateAddress: '8a9494ab112fb99ffd0ae8b653c4ed4e27f87fcb',
			amount: '2000000000',
			unvoteHeight: 934107,
		});
	});

	it('Parse object', async () => {
		const data = {
			asset: {
				amount: BigInt(150000000000),
				recipientAddress: Buffer.from('b5a1052cd5bb1259202b291512387292e2d4a8e9', 'hex'),
			},
			amount: BigInt(150000000000),
			recipientAddress: Buffer.from('b5a1052cd5bb1259202b291512387292e2d4a8e9', 'hex'),
			assetID: 0,
			fee: BigInt(1000000),
			id: Buffer.from('b11e14378c8afdd1ba68a305d6168eb710a1c9ff20da1836ddf68f0139600bc9', 'hex'),
			moduleID: 2,
			nonce: BigInt(61),
		};
		const parsedResult = parseToJSONCompatObj(data);
		expect(parsedResult).toBeInstanceOf(Object);
		expect(parsedResult).toMatchObject({
			asset: {
				amount: '150000000000',
				recipientAddress: 'b5a1052cd5bb1259202b291512387292e2d4a8e9',
			},
			amount: '150000000000',
			recipientAddress: 'b5a1052cd5bb1259202b291512387292e2d4a8e9',
			assetID: 0,
			fee: '1000000',
			id: 'b11e14378c8afdd1ba68a305d6168eb710a1c9ff20da1836ddf68f0139600bc9',
			moduleID: 2,
			nonce: '61',
		});
	});
});

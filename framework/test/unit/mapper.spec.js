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
const mapperService = require('../../src/mapper');

describe('Object mapper: ', () => {
	it('No type conversion and reference with = maps an object to the same object -> ok', () => {
		const result = mapperService({ address: '16009998050678037905L' }, { address: '=' });
		expect(result).toMapRequiredSchema({ address: '16009998050678037905L' });
	});

	it('No type conversion and reference with a name maps to an object with the property of the reference name -> ok', () => {
		const result = mapperService({ addr: '16009998050678037905L' }, { address: 'addr' });
		expect(result).toMapRequiredSchema({ address: '16009998050678037905L' });
	});

	it('Type conversion to boolean maps an object with string to an object with true -> ok', () => {
		const result = mapperService({ value: 'hello' }, { value: '=,boolean' });
		expect(result).toMapRequiredSchema({ value: true });
	});

	it('Type conversion to boolean maps an object with 0 as string to an object with false -> ok', () => {
		const result = mapperService({ value: '0' }, { value: '=,boolean' });
		expect(result).toMapRequiredSchema({ value: false });
	});

	it('Type conversion to boolean maps an object with 1 as string to an object with true -> ok', () => {
		const result = mapperService({ value: '1' }, { value: '=,boolean' });
		expect(result).toMapRequiredSchema({ value: true });
	});

	it('Type conversion to boolean maps an object with 0 as number to an object with false -> ok', () => {
		const result = mapperService({ value: 0 }, { value: '=,boolean' });
		expect(result).toMapRequiredSchema({ value: false });
	});

	it('Type conversion to boolean maps an object with 1 as number to an object with true -> ok', () => {
		const result = mapperService({ value: 1 }, { value: '=,boolean' });
		expect(result).toMapRequiredSchema({ value: true });
	});

	it('Type conversion to number maps an object with string to an object with number -> ok', () => {
		const result = mapperService({ address: '100' }, { address: '=,number' });
		expect(result).toMapRequiredSchema({ address: 100 });
	});

	it('Type conversion with string maps an objcet with number to an object with the same number as string -> ok', () => {
		const result = mapperService({ address: 16009998 }, { address: '=,string' });
		expect(result).toMapRequiredSchema({ address: '16009998' });
	});

	it('Object with multiple key-val pairs -> ok', () => {
		const result = mapperService({ value: 16009998, number: '100', addr: '16009998050678037905L' },
			{ value: '=,string', number: '=,number', address: 'addr,string' });
		expect(result).toMapRequiredSchema({
			value: '16009998',
			number: 100,
			address: '16009998050678037905L',
		});
	});

	it('Multiple key-val pairs in the input will be mapped only if the definition has the key-val -> ok', () => {
		const result = mapperService(
			{ value: 16009998, number: '100', addr: '16009998050678037905L' },
			{ value: '=,string', address: 'addr,string' });

		expect(result).toMapRequiredSchema({
			value: '16009998',
			address: '16009998050678037905L',
		});
	});

	it('Array with an object with reference = put an object inside an array -> ok', () => {
		const result = mapperService({ address: '16009998050678037905L' }, [{ address: '=' }]);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(1);
		result.forEach(entry => expect(entry).toMapRequiredSchema({ address: '16009998050678037905L' }));
	});

	it('Array with an object with = and type put an object inside an array -> ok', () => {
		const result = mapperService({ address: '100' }, [{ address: '=,number' }]);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(1);
		result.forEach(entry => expect(entry).toMapRequiredSchema({ address: 100 }));
	});

	it('Map an array inside a plain object -> ok', () => {
		const result = mapperService({ data: [{ address: '16009998050678037905L' }] }, ['data', { address: '=' }]);
		expect(result).toBeInstanceOf(Array);
		expect(result).toHaveLength(2);
		expect(result).toEqual(['data', { data: [{ address: '16009998050678037905L' }] }]);
	});

	it('Map a plain object with null -> ok', () => {
		const result = mapperService({ address: null }, { address: '=' });
		expect(result).toMapRequiredSchema({ address: null });
	});

	it('Plain object with empty string maps to an empty object without a property -> ok', () => {
		const result = mapperService({ address: '' }, { address: '=' });
		expect(result).toMapRequiredSchema({});
	});

	it('Plain object with empty array maps to an object with empty array -> ok', () => {
		const result = mapperService({	address: [] }, { address: '=' });
		expect(result).toEqual({ address: [] });
	});

	it('Plain object with empty array maps to an object with empty array -> ok', () => {
		const result = mapperService({	addr: [] }, { address: 'addr' });
		expect(result).toEqual({ address: [] });
	});

	it('Plain object with an empty object maps to a plain object with an empty object-> ok', () => {
		const result = mapperService({ address: {} }, { address: '=' });
		expect(result).toEqual({ address: {} });
	});

	it('Plain object with an empty object maps to a plain object with an empty object-> ok', () => {
		const result = mapperService({ addr: {} }, { address: 'addr' });
		expect(result).toEqual({ address: {} });
	});

	it('Nested object with empty array maps to a plain object with empty array -> ok', () => {
		const result = mapperService({ addr: { name: [] } }, { address: 'addr.name' });
		expect(result).toEqual({ address: [] });
	});

	it('Nested object with empty object maps to a plain object with empty object -> ok', () => {
		const result = mapperService({ addr: { name: {} } }, { address: 'addr.name' });
		expect(result).toEqual({ address: {} });
	});

	it('Nested object with empty object maps to a plain object -> ok', () => {
		const result = mapperService({ addr: { name: { addres: 'address' } } }, { address: 'addr.name' });
		expect(result).toEqual({ address: { addres: 'address' } });
	});

	it('Map a plain object with an empty object inside an array -> ok', () => {
		const result = mapperService({ address: [{}] }, { address: '=' });
		expect(result).toBeInstanceOf(Object);
		const { address } = result;
		expect(address).toBeInstanceOf(Array);
		expect(address).toHaveLength(1);
		address.forEach(entry => expect(entry).toMapRequiredSchema({}));
	});

	it('Plain object with undefined maps to empty object with refrence undefined -> ok', () => {
		const result = mapperService({ address: undefined }, { address: undefined });
		expect(result).toMapRequiredSchema({});
	});

	it('Plain object with null maps to empty object with refrence null -> ok', () => {
		const result = mapperService({ name: null }, { name: null });
		expect(result).toMapRequiredSchema({});
	});

	it('input is Array > result: { data: [Array] } -> ok', () => {
		const input = [{ address: '16009998050678037905L' }];
		const def = { data: ['', { address: '=' }] };
		const result = { data: [{ address: '16009998050678037905L' }] };
		const response = mapperService(input, def);
		expect(response).toEqual(result);
	});

	it('input: { data: [Array] } > result: { data: [Array]} -> ok', () => {
		const input = { data: [{ address: '16009998050678037905L' }] };
		const def = { data: ['data', { address: '=' }] };
		const result = { data: [{ address: '16009998050678037905L' }] };
		const response = mapperService(input, def);
		expect(response).toEqual(result);
	});

	it('Multi-level object mapping', () => {
		const input = {
			data: {
				address: '16009998050678037905L',
				asset: {
					amount: {
						average: '1000',
					},
				},
			},
			count: 15,
		};
		const def = { address: 'data.address', avg: 'data.asset.amount.average', count: '=' };
		const result = { address: '16009998050678037905L', avg: '1000', count: 15 };
		const response = mapperService(input, def);
		expect(response).toEqual(result);
	});

	it('Multi-level array mapping', () => {
		const input = { data: [
			{
				address: '16009998050678037905L',
				asset: {
					amount: {
						average: '1000',
					},
				},
			},
		] };
		const def = { data: ['data', { address: '=', avg: 'asset.amount.average' }] };
		const result = { data: [{ address: '16009998050678037905L', avg: '1000' }] };
		const response = mapperService(input, def);
		expect(response).toEqual(result);
	});

	it('Zeroes are passed correctly', () => {
		const input = {
			networkHeightNumber: 0,
			networkHeightString: '0',
		};
		const def = {
			networkHeightNumber: '=',
			networkHeightString: '=',
			networkHeightNumberByName: 'networkHeightNumber',
			networkHeightStringByName: 'networkHeightString',
			networkHeightNumberCastToNumber: 'networkHeightNumber,number',
			networkHeightStringCastToString: 'networkHeightString,string',
			networkHeightNumberCastToString: 'networkHeightNumber,string',
			networkHeightStringCastToNumber: 'networkHeightString,number',
		};
		const result = {
			networkHeightNumber: 0,
			networkHeightString: '0',
			networkHeightNumberByName: 0,
			networkHeightStringByName: '0',
			networkHeightNumberCastToNumber: 0,
			networkHeightStringCastToString: '0',
			networkHeightNumberCastToString: '0',
			networkHeightStringCastToNumber: 0,
		};
		const response = mapperService(input, def);
		expect(response).toEqual(result);
	});
});

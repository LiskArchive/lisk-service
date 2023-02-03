/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const { normalizeRangeParam } = require('../../shared/utils/paramUtils');

describe('Test normalizeRangeParam method', () => {
	it('Returns proper response when the params is undefined', async () => {
		const response = normalizeRangeParam(undefined, 'key');
		expect(response).toEqual(undefined);
	});

	it('Returns proper response when the params is null', async () => {
		const response = normalizeRangeParam(null, 'key');
		expect(response).toEqual(null);
	});

	it('Returns proper response when the property does not exists in params', async () => {
		const params = {
			key: 2,
		};
		const response = normalizeRangeParam(params, 'unknown_key');
		expect(response).toEqual(params);
	});

	it('Returns proper response when the param is not a string', async () => {
		const params = {
			key: 2,
		};
		const response = normalizeRangeParam(params, 'key');
		expect(response).toEqual(params);
	});

	it('Returns proper response when the param is string but does not have range', async () => {
		const params = {
			key: 'val',
		};
		const response = normalizeRangeParam(params, 'key');
		expect(response).toEqual(params);
	});

	it('Returns ValidationException when `from` is not a number', async () => {
		const params = {
			key: 'abc:456',
		};
		expect(() => normalizeRangeParam(params, 'key')).toThrow(new ValidationException("Invalid (non-numeric) 'key' range values supplied: abc:456."));
	});

	it('Returns ValidationException when `to` is not a number', async () => {
		const params = {
			key: '123:abc',
		};
		expect(() => normalizeRangeParam(params, 'key')).toThrow(new ValidationException("Invalid (non-numeric) 'key' range values supplied: 123:abc."));
	});

	it('Returns ValidationException when `from` is greater than `to`', async () => {
		const params = {
			key: '456:123',
		};
		expect(() => normalizeRangeParam(params, 'key')).toThrow(new ValidationException('From key cannot be greater than to key.'));
	});

	it('Returns proper response when only `from` is specified', async () => {
		const params = {
			key: '123:',
			key2: 'val2',
		};
		const response = normalizeRangeParam(params, 'key');
		const { key, ...paramsWithoutKey } = params;
		expect(response).toEqual({
			...paramsWithoutKey,
			propBetweens: [{
				property: 'key',
				from: 123,
			}],
		});
	});

	it('Returns proper response when only `to` is specified', async () => {
		const params = {
			key: ':456',
			key2: 'val2',
		};
		const response = normalizeRangeParam(params, 'key');
		const { key, ...paramsWithoutKey } = params;
		expect(response).toEqual({
			...paramsWithoutKey,
			propBetweens: [{
				property: 'key',
				to: 456,
			}],
		});
	});

	it('Returns proper response when both `from` and `to` are specified', async () => {
		const params = {
			key: '123:456',
			key2: 'val2',
		};
		const response = normalizeRangeParam(params, 'key');
		const { key, ...paramsWithoutKey } = params;
		expect(response).toEqual(
			{
				...paramsWithoutKey,
				propBetweens: [{
					property: 'key',
					from: 123,
					to: 456,
				},
				],
			});
	});
});

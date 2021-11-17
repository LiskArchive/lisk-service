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
	parseJsonToCsv,
} = require('../../shared/helpers/csv');

const {
	dynamicFields,
	dynamicFieldsCustomDelimiter,
	dynamicFieldsJsonList,
	dynamicFieldsJsonListCustomDelimiter,
} = require('../constants/csv');

describe('CSV utils', () => {
	it('returns CSV from JSON', async () => {
		const fields = Object.keys(dynamicFields.jsonObj);
		const opts = { fields };
		const csv = parseJsonToCsv(opts, dynamicFields.jsonObj);
		expect(dynamicFields.expectedCsv).toBe(csv);
	});

	it('returns CSV from JSON with custom delimiter', async () => {
		const fields = Object.keys(dynamicFieldsCustomDelimiter.jsonObj);
		const opts = {
			fields,
			delimiter: dynamicFieldsCustomDelimiter.delimiter,
		};
		const csv = parseJsonToCsv(opts, dynamicFieldsCustomDelimiter.jsonObj);
		expect(dynamicFieldsCustomDelimiter.expectedCsv).toBe(csv);
	});

	it('returns CSV from JSON list', async () => {
		const fields = Object.keys(dynamicFieldsJsonList.jsonObjList[0]);
		const opts = { fields };
		const csv = parseJsonToCsv(opts, dynamicFieldsJsonList.jsonObjList);
		expect(dynamicFieldsJsonList.expectedCsv).toBe(csv);
	});

	it('returns CSV from JSON list with custom delimiter', async () => {
		const fields = Object.keys(dynamicFieldsJsonListCustomDelimiter.jsonObjList[0]);
		const opts = {
			fields,
			delimiter: dynamicFieldsJsonListCustomDelimiter.delimiter,
		};
		const csv = parseJsonToCsv(opts, dynamicFieldsJsonListCustomDelimiter.jsonObjList);
		expect(dynamicFieldsJsonListCustomDelimiter.expectedCsv).toBe(csv);
	});
});

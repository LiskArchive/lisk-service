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
const jsonObj = {
	a: '1',
	b: '2',
	c: '3',
	d: '4',
};

const jsonObjList = Array(10).fill(jsonObj).map((o, i) => ({ num: String(i), ...o }));

const generateExcpectedCsv = (json, delimiter) => ''.concat(
	Object.keys(json).map(k => `"${k}"`).join(delimiter),
	'\n',
	Object.values(json).map(k => `"${k}"`).join(delimiter),
);

const generateExcpectedCsvForList = (jsonList, delimiter) => {
	const csvList = [];
	jsonList.forEach((json, i) => {
		if (i === 0) {
			csvList.push(Object.keys(json).map(k => `"${k}"`).join(delimiter));
		}
		csvList.push(Object.values(json).map(k => `"${k}"`).join(delimiter));
	});

	return csvList.join('\n');
};

const dynamicFields = {
	jsonObj,
	delimiter: ',',
	get expectedCsv() {
		return generateExcpectedCsv(this.jsonObj, this.delimiter);
	},
};

const dynamicFieldsCustomDelimiter = {
	jsonObj,
	delimiter: ';',
	get expectedCsv() {
		return generateExcpectedCsv(this.jsonObj, this.delimiter);
	},
};

const dynamicFieldsJsonList = {
	jsonObjList,
	delimiter: ',',
	get expectedCsv() {
		return generateExcpectedCsvForList(this.jsonObjList, this.delimiter);
	},
};

const dynamicFieldsJsonListCustomDelimiter = {
	jsonObjList,
	delimiter: ';',
	get expectedCsv() {
		return generateExcpectedCsvForList(this.jsonObjList, this.delimiter);
	},
};

module.exports = {
	dynamicFields,
	dynamicFieldsCustomDelimiter,
	dynamicFieldsJsonList,
	dynamicFieldsJsonListCustomDelimiter,
};

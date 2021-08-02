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
const parseToJSONCompatObj = obj => {
	if (typeof obj === 'boolean' || !obj) return obj;

	if (['string', 'number'].includes(typeof obj)) return obj;
	if (obj instanceof Buffer) return Buffer.from(obj).toString('hex');
	if (typeof obj === 'bigint') return String(obj);
	if (typeof obj === 'object' && Array.isArray(obj)) return (() => { obj.forEach((o, i) => obj[i] = parseToJSONCompatObj(o)); return obj; })();

	Object.entries(obj)
		.forEach(([k, v]) => {
			if (v instanceof Buffer) obj[k] = Buffer.from(v).toString('hex');
			else if (typeof v === 'bigint') obj[k] = String(v);
			else if (typeof v === 'object' && Array.isArray(v)) obj[k].forEach((o, i) => obj[k][i] = parseToJSONCompatObj(o));
			else if (typeof v === 'object' && v !== null) obj[k] = parseToJSONCompatObj(v);
			else obj[k] = v;
		});
	return obj;
};

module.exports = {
	parseToJSONCompatObj,
};

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

const transformParams = (type, params) => {
	const data = [];
	const paramsKeys = Object.keys(params);
	paramsKeys.forEach((paramKey) => {
		let value = {};
		if (type === 'blocks' && paramKey === 'id') {
			value = { $ref: '#/parameters/block' };
		} else if (type === 'network' && paramKey === 'q') {
			value = { $ref: '#/parameters/searchQuery' };
		} else value = { $ref: `#/parameters/${paramKey}` };
		if (paramKey === 'sort') {
			value = {
				name: 'sort',
				in: 'query',
				description: 'Fields to sort results by',
				required: false,
				type: params[paramKey].type,
				enum: params[paramKey].enum,
				default: params[paramKey].default,
			};
		} else if (paramKey === 'search') {
			value = {
				name: 'search',
				in: 'query',
				description: 'Delegate name full text search phrase',
				type: 'string',
				minLength: 1,
				maxLength: 20,
			};
		}
		data.push(value);
	});
	return data;
};

module.exports = {
	transformParams,
};

/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const { Utils } = require('lisk-service-framework');
const coreApi = require('./coreApi');


const ObjectUtilService = Utils.Data;

const { isProperObject } = ObjectUtilService;

const getDelegates = async params => {
	const delegates = await coreApi.getDelegates(params);

	delegates.data.map((delegate, index) => {
		delegate.rank = params.offset + index + 1;
		delegate.vote = delegate.voteWeight;
		return delegate;
	});

	return delegates;
};

const getNextForgers = async params => {
	const result = await coreApi.getNextForgers(params);
	return isProperObject(result) && Array.isArray(result.data) ? result : [];
};


module.exports = {
	getDelegates,
	getNextForgers,
};

/*
* LiskHQ/lisk-service
* Copyright © 2022 Lisk Foundation
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
const BluebirdPromise = require('bluebird');
const {
	Exceptions: { InvalidParamsException },
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const { normalizeRangeParam } = require('../../../utils/paramUtils');
const crossChainMessagesIndexSchema = require('../../../database/schema/crossChainMessages');
const transactionsIndexSchema = require('../../../database/schema/transactions');

const getCrossChainMessagesIndex = () => getTableInstance('ccm', crossChainMessagesIndexSchema, MYSQL_ENDPOINT);
const getTransactionsIndex = () => getTableInstance('transactions', transactionsIndexSchema, MYSQL_ENDPOINT);
const { getFinalizedHeight } = require('../../../constants');

const getCCMs = async (params) => {
	const crossChainMessagesDB = await getCrossChainMessagesIndex();
	const transactionsTable = await getTransactionsIndex();

	const ccms = {
		data: [],
		meta: {},
	};

	if (params.timestamp && params.timestamp.includes(':')) {
		params = normalizeRangeParam(params, 'timestamp');
	}

	if (params.nonce && !(params.senderAddress)) {
		throw new InvalidParamsException('Nonce based retrieval is only possible along with senderAddress');
	}

	const total = await crossChainMessagesDB.count(params);

	const response = await crossChainMessagesDB.find(
		{ ...params, limit: params.limit || total },
		Object.getOwnPropertyNames(crossChainMessagesIndexSchema.schema),
	);

	ccms.data = await BluebirdPromise.map(
		response,
		async ccm => {
			const indexedTxInfo = transactionsTable.find({ id: ccm.transactionID });

			ccm.block = {
				id: indexedTxInfo.blockID,
				height: indexedTxInfo.height,
				timestamp: indexedTxInfo.timestamp,
				isFinal: indexedTxInfo.height <= (await getFinalizedHeight()),
			};

			return ccm;
		},
		{ concurrency: response.length },
	);

	ccms.meta = {
		total,
		count: ccms.data.length,
		offset: params.offset,
	};

	return ccms;
};

module.exports = {
	getCCMs,
};

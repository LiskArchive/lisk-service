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
const BluebirdPromise = require('bluebird');

const {
	DB: {
		MySQL: { getTableInstance },
	},
} = require('lisk-service-framework');

const transactionsTableSchema = require('../../../database/schema/transactions');
const config = require('../../../../config');
const { MODULE, COMMAND } = require('../../../constants');

const MYSQL_ENDPOINT = config.endpoints.mysqlReplica;

const getTransactionsTable = () => getTableInstance(transactionsTableSchema, MYSQL_ENDPOINT);

const NFT_HISTORY_TYPE = {
	TRANSFER: 'transfer',
	ATTRIBUTE: 'attribute',
};

const getNFTHistory = async (params) => {
	const transactionsTable = await getTransactionsTable();

	const history = {
		data: [],
		meta: {},
	};

	let total;

	if (params.type === NFT_HISTORY_TYPE.TRANSFER) {
		const searchParams = {
			tokenID: params.nftID,
			moduleCommand: `${MODULE.NFT}:${COMMAND.TRANSFER}`,
			andWhere: { moduleCommand: `${MODULE.NFT}:${COMMAND.TRANSFER_CROSS_CHAIN}` },
			sort: 'heigth:desc',
		};

		const response = await transactionsTable.find(searchParams);
		total = await transactionsTable.count(searchParams);

		history.data = await BluebirdPromise.map(
			response,
			async transaction => {
				const owner = {
					old: transaction.senderAddress,
					new: transaction.recipientAddress,
				};
				const transactionID = transaction.id;
				const block = {
					id: transaction.blockID,
					height: transaction.height,
					timestamp: transaction.timestamp,
				};

				return {
					owner,
					transactionID,
					block,
				};
			},
			{ concurrency: response.length },
		);
	} else if (params.type === NFT_HISTORY_TYPE.ATTRIBUTE) {

	}

	history.meta = {
		nftID: params.nftID,
		count: history.data.length,
		offset: params.offset,
		total,
	};

	return history;
};

module.exports = {
	getNFTHistory,
};

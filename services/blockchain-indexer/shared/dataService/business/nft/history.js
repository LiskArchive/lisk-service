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
	DB: {
		MySQL: { getTableInstance },
	},
} = require('lisk-service-framework');

const transactionsTableSchema = require('../../../database/schema/transactions');

const config = require('../../../../config');
const { MODULE, COMMAND } = require('../../../constants');
const { getNFTInfo } = require('../../../utils/nft');

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
	const { nftID, type, ...remParams } = params;

	if (type === NFT_HISTORY_TYPE.TRANSFER) {
		const searchParams = {
			...remParams,
			tokenID: nftID,
			moduleCommand: `${MODULE.NFT}:${COMMAND.TRANSFER}`,
			andWhere: { moduleCommand: `${MODULE.NFT}:${COMMAND.TRANSFER_CROSS_CHAIN}` },
		};

		const transactionsInfo = await transactionsTable.find(
			searchParams,
			['id', 'senderAddress', 'recipientAddress', 'blockID', 'height', 'timestamp'],
		);

		total = await transactionsTable.count(searchParams);

		history.data = await transactionsInfo.map(async transaction => ({
			owner: {
				old: transaction.senderAddress,
				new: transaction.recipientAddress,
			},
			transactionID: transaction.id,
			block: {
				id: transaction.blockID,
				height: transaction.height,
				timestamp: transaction.timestamp,
			},
		}));
	}
	// else if (type === NFT_HISTORY_TYPE.ATTRIBUTE) {
	// TODO: Implement NFT history by attribute https://github.com/LiskHQ/lisk-service/issues/1816
	// }

	history.meta = {
		id: nftID,
		nft: getNFTInfo(nftID),
		count: history.data.length,
		offset: remParams.offset,
		total,
	};

	return history;
};

module.exports = {
	getNFTHistory,
};

// /*
//  * LiskHQ/lisk-service
//  * Copyright © 2021 Lisk Foundation
//  *
//  * See the LICENSE file at the top-level directory of this distribution
//  * for licensing information.
//  *
//  * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
//  * no part of this software, including this file, may be copied, modified,
//  * propagated, or distributed except according to the terms contained in the
//  * LICENSE file.
//  *
//  * Removal or modification of this copyright notice is prohibited.
//  *
//  */
const { getTableInstance } = require('./database/mysql');
const votesIndexSchema = require('./indexer/schema/votes');

const getVotesIndex = () => getTableInstance('votes', votesIndexSchema);

const getVotesByTransactionIDs = async transactionIDs => {
	const votesDB = await getVotesIndex();
	const votes = await votesDB.find({
		whereIn: {
			property: 'id',
			values: transactionIDs,
		},
	}, ['tempId']);
	return votes;
};

module.exports = {
	getVotesByTransactionIDs,
};

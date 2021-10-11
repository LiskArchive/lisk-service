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
const config = require('../../../../config');
const { request } = require('../../../../helpers/socketIoRpcRequest');

const {
	votesReceived,
	noVotesReceived,
} = require('../expectedResponse/rpc/votesReceived');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getReceivedVotes = async params => request(wsRpcUrl, 'get.votes_received', params);

describe('Votes Received API', () => {
	it('Retrieve received votes', async () => {
		const { address } = votesReceived.result.data.account;
		const response = await getReceivedVotes({ address });
		expect(response).toStrictEqual(votesReceived);
	});

	it('Retrieve received votes (no votes)', async () => {
		const { address } = noVotesReceived.result.data.account;
		const response = await getReceivedVotes({ address });
		expect(response).toStrictEqual(noVotesReceived);
	});
});

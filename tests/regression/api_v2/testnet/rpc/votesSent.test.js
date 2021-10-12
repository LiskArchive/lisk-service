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
	votesSent,
	noVotesSent,
} = require('../expectedResponse/rpc/votesSent');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getSentVotes = async params => request(wsRpcUrl, 'get.votes_sent', params);

describe('Votes Sent API', () => {
	it('Retrieve sent votes', async () => {
		const { address } = votesSent.result.data.account;
		const response = await getSentVotes({ address });
		expect(response).toStrictEqual(votesSent);
	});

	it('Retrieve sent votes (no votes)', async () => {
		const { address } = noVotesSent.result.data.account;
		const response = await getSentVotes({ address });
		expect(response).toStrictEqual(noVotesSent);
	});
});

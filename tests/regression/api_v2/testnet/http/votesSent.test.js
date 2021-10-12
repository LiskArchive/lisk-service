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
const { api } = require('../../../../helpers/api');

const {
	votesSent,
	noVotesSent,
} = require('../expectedResponse/http/votesSent');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/votes_sent`;

describe('Votes Sent API', () => {
	it('Retrieve sent votes', async () => {
		const { address } = votesSent.data.account;
		const response = await api.get(`${endpoint}?address=${address}`);
		expect(response).toStrictEqual(votesSent);
	});

	it('Retrieve sent votes (no votes)', async () => {
		const { address } = noVotesSent.data.account;
		const response = await api.get(`${endpoint}?address=${address}`);
		expect(response).toStrictEqual(noVotesSent);
	});
});

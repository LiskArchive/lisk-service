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
	votesReceived,
	noVotesReceived,
} = require('../expectedResponse/http/votesReceived');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/votes_received`;

describe('Votes Received API', () => {
	it('Retrieve received votes', async () => {
		const { address } = votesReceived.data.account;
		const response = await api.get(`${endpoint}?address=${address}`);
		expect(response).toStrictEqual(votesReceived);
	});

	it('Retrieve received votes (no votes)', async () => {
		const { address } = noVotesReceived.data.account;
		const response = await api.get(`${endpoint}?address=${address}`);
		expect(response).toStrictEqual(noVotesReceived);
	});
});

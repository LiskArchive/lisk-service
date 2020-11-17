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
const semver = require('semver');
const config = require('../../config');
const { api } = require('../../helpers/api');

const {
	badRequestSchema,
	notFoundSchema,
} = require('../../schemas/httpGenerics.schema');

const {
	feeEstimateSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../schemas/feeEstimate.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;
const endpoint = `${baseUrlV1}/fee_estimates`;

describe('Fee estimates API', () => {
	let isFeeEstimateSupported;
	beforeAll(async () => {
		const response = await api.get(`${baseUrlV1}/network/statistics`);
		const { ...availableNodeVersions } = response.data.coreVer;
		let coreVersion;
		Object.keys(availableNodeVersions).forEach(nodeVersion =>
			coreVersion = (!coreVersion || semver.lt(coreVersion, nodeVersion))
				? nodeVersion : coreVersion
		);

		isFeeEstimateSupported = semver.lte('3.0.0-beta.1', coreVersion);
	});

	describe('GET /fee_estimates', () => {
		it('estimate fees true -> 200 OK', async () => {
			if (isFeeEstimateSupported) {
				const response = await api.get(`${endpoint}`);
				expect(response).toMap(goodRequestSchema);
				expect(response.data).toMap(feeEstimateSchema);
				expect(response.meta).toMap(metaSchema);
			}
		});

		it('not supported -> 404 NOT FOUND', async () => {
			if (!isFeeEstimateSupported) {
				const response = await api.get(`${endpoint}`, 404);
				expect(response).toMap(notFoundSchema);
			}
		});

		it('params not supported -> 400 BAD REQUEST', async () => {
			const response = await api.get(`${endpoint}?someparam='not_supported'`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});
});

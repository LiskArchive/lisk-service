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
const semver = require('semver');
const config = require('../../config');
const { request } = require('../../helpers/socketIoRpcRequest');

const {
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	emptyResultEnvelopeSchema,
	invalidParamsSchema,
} = require('../../schemas/rpcGenerics.schema');

const {
	feeEstimateSchema,
	goodRequestSchema,
	metaSchema,
} = require('../../schemas/feeEstimate.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v1`;

const requestFeeEstimate = async () => request(wsRpcUrl, 'get.fee_estimates');

describe('get.fee_estimates', () => {
	let isFeeEstimateSupported;
	beforeAll(async () => {
		const response = await request(wsRpcUrl, 'get.network.statistics');
		const { ...availableNodeVersions } = response.result.data.coreVer;
		let coreVersion;
		Object.keys(availableNodeVersions).forEach(nodeVersion => {
			coreVersion = (!coreVersion || semver.lt(coreVersion, nodeVersion))
				? nodeVersion : coreVersion;
		});

		isFeeEstimateSupported = semver.lte('3.0.0-beta.1', coreVersion);
	});

	it('returns estimated fees, when supported', async () => {
		if (isFeeEstimateSupported) {
			const response = await requestFeeEstimate();
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result).toMap(goodRequestSchema);
			expect(result.data).toMap(feeEstimateSchema);
			expect(result.meta).toMap(metaSchema);
		}
	});

	it('returns empty result, when not supported', async () => {
		if (!isFeeEstimateSupported) {
			const response = await requestFeeEstimate();
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		}
	});

	it('params not supported -> INVALID_PARAMS (-32602)', async () => {
		const response = await request(wsRpcUrl, 'get.fee_estimates', {
			someparam: 'not_supported',
		}).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});

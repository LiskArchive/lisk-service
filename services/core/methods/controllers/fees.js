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
const { HTTP } = require('lisk-service-framework');

const { getProtocolVersion } = require('../../shared/coreProtocolCompatibility.js');
const CoreService = require('../../shared/core.js');

const { StatusCodes: { NOT_FOUND } } = HTTP;

const getEstimateFeeByte = async () => {
	const protocolVersion = getProtocolVersion();
	if (Number(protocolVersion) < 2) return { status: NOT_FOUND, data: { error: `Action not supported for Protocol version: ${protocolVersion}.` } };

	const response = await CoreService.getEstimateFeeByte();

	if (response.data.error) return response;

	const result = { feeEstimatePerByte: {} };
	result.feeEstimatePerByte.low = response.low;
	result.feeEstimatePerByte.medium = response.med;
	result.feeEstimatePerByte.high = response.high;

	const meta = {};
	meta.updated = response.updated;
	meta.blockHeight = response.blockHeight;
	meta.blockId = response.blockId;

	return {
		data: result,
		meta,
	};
};

module.exports = {
	getEstimateFeeByte,
};

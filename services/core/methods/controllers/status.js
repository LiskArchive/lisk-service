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
const httpStatus = require('http-status-codes');

const CoreService = require('../../services/core.js');
const packageJson = require('../../package.json');

const getStatus = async () => {
	const response = {
		data: {
			name: packageJson.name,
			description: packageJson.description,
			version: packageJson.version,
		},
	};
	return response;
};

const getReadyStatus = async () => {
	if (CoreService.getReadyStatus()) {
		return { data: { status: 'OK' } };
	}
	return {
		status: httpStatus.SERVICE_UNAVAILABLE,
		headers: { 'Retry-After': 120 },
		data: { status: 'FAIL', message: 'Service not ready' },
	};
};

module.exports = {
	getStatus,
	getReadyStatus,
};

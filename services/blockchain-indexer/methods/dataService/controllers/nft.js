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
const dataService = require('../../../shared/dataService');

const getNFTConstants = async () => {
	const constants = {
		data: {},
		meta: {},
	};

	const response = await dataService.getNFTConstants();
	if (response.data) constants.data = response.data;
	if (response.meta) constants.meta = response.meta;

	return constants;
};

const getNFTSupported = async () => {
	const nftSupported = {
		data: {},
		meta: {},
	};

	const response = await dataService.getNFTSupported();
	if (response.data) nftSupported.data = response.data;
	if (response.meta) nftSupported.meta = response.meta;

	return nftSupported;
};

module.exports = {
	getNFTConstants,
	getNFTSupported,
};

/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const {
	HTTP: {
		StatusCodes: { NOT_FOUND },
	},
	Exceptions: {
		ServiceUnavailableException,
		NotFoundException,
	},
} = require('lisk-service-framework');

const appRegistryService = require('../../shared/metadata');

const getBlockchainAppsMetaList = async (params) => {
	const blockchainAppsMetaList = {
		data: {},
		meta: {},
	};

	try {
		const response = await appRegistryService.getBlockchainAppsMetaList(params);
		if (response.data) blockchainAppsMetaList.data = response.data;
		if (response.meta) blockchainAppsMetaList.meta = response.meta;

		return blockchainAppsMetaList;
	} catch (err) {
		let status;
		if (err instanceof ServiceUnavailableException) status = 'SERVICE_UNAVAILABLE';
		if (err instanceof NotFoundException) status = NOT_FOUND;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

module.exports = {
	getBlockchainAppsMetaList,
};

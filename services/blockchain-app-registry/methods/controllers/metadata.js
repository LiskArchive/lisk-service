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
const appRegistryService = require('../../shared/metadata');

const getBlockchainAppsMetaList = async (params) => {
	const blockchainAppsMetaList = {
		data: [],
		meta: {},
	};

	const response = await appRegistryService.getBlockchainAppsMetaList(params);
	if (response.data) blockchainAppsMetaList.data = response.data;
	if (response.meta) blockchainAppsMetaList.meta = response.meta;

	return blockchainAppsMetaList;
};

const getBlockchainAppsTokenMetadata = async (params) => {
	const blockchainAppsMetaList = {
		data: [],
		meta: {},
	};

	const response = await appRegistryService.getBlockchainAppsTokenMetadata(params);
	if (response.data) blockchainAppsMetaList.data = response.data;
	if (response.meta) blockchainAppsMetaList.meta = response.meta;

	return blockchainAppsMetaList;
};

module.exports = {
	getBlockchainAppsMetaList,
	getBlockchainAppsTokenMetadata,
};

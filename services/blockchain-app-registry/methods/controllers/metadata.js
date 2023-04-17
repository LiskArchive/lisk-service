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
	HTTP,
	Exceptions: { InvalidParamsException },
} = require('lisk-service-framework');

const { StatusCodes: { BAD_REQUEST } } = HTTP;

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

const getBlockchainAppsMetadata = async (params) => {
	const blockchainAppsMetaList = {
		data: [],
		meta: {},
	};

	const response = await appRegistryService.getBlockchainAppsMetadata(params);
	if (response.data) blockchainAppsMetaList.data = response.data;
	if (response.meta) blockchainAppsMetaList.meta = response.meta;

	return blockchainAppsMetaList;
};

const getBlockchainAppsTokenMetadata = async (params) => {
	try {
		const blockchainAppsTokenMeta = {
			data: [],
			meta: {},
		};

		const response = await appRegistryService.getBlockchainAppsTokenMetadata(params);
		if (response.data) blockchainAppsTokenMeta.data = response.data;
		if (response.meta) blockchainAppsTokenMeta.meta = response.meta;

		return blockchainAppsTokenMeta;
	} catch (err) {
		let status;
		if (err instanceof InvalidParamsException) status = BAD_REQUEST;
		if (status) return { status, data: { error: err.message } };
		throw err;
	}
};

const getBlockchainAppsTokensSupportedMetadata = async (params) => {
	const blockchainAppsTokensSupportedMeta = {
		data: [],
		meta: {},
	};

	const response = await appRegistryService.getBlockchainAppsTokensSupportedMetadata(params);
	if (response.data) blockchainAppsTokensSupportedMeta.data = response.data;
	if (response.meta) blockchainAppsTokensSupportedMeta.meta = response.meta;

	return blockchainAppsTokensSupportedMeta;
};

module.exports = {
	getBlockchainAppsMetaList,
	getBlockchainAppsMetadata,
	getBlockchainAppsTokenMetadata,
	getBlockchainAppsTokensSupportedMetadata,
};

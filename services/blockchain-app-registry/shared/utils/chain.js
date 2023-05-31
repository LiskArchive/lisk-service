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
	MySQL: { getTableInstance },
} = require('lisk-service-framework');

const config = require('../../config');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const applicationMetadataTableSchema = require('../database/schema/application_metadata');

const getApplicationMetadataTable = () => getTableInstance(
	applicationMetadataTableSchema, MYSQL_ENDPOINT);

const resolveChainNameByNetworkAppDir = async (network, appDirName) => {
	const applicationMetadataTable = await getApplicationMetadataTable();
	const [{ chainName = '' } = {}] = await applicationMetadataTable.find({ network, appDirName }, ['chainName']);
	return chainName;
};

module.exports = {
	resolveChainNameByNetworkAppDir,
};

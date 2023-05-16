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
const { MySQL: { getTableInstance } } = require('lisk-service-framework');

const config = require('../../../../config');
const validatorsTableSchema = require('../../../database/schema/validators');

const { requestConnector } = require('../../../utils/request');
const { getIndexedAccountInfo } = require('../../../utils/account');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getValidatorsTable = () => getTableInstance(
	validatorsTableSchema,
	MYSQL_ENDPOINT,
);

const getValidator = async params => {
	const validator = {
		data: {},
		meta: {},
	};

	const { address } = params;

	const validatorsTable = await getValidatorsTable();
	const [{ proofOfPossession } = {}] = await validatorsTable.find({ address, limit: 1 }, ['proofOfPossession']);

	validator.data = {
		...await requestConnector('getValidator', { address }),
		proofOfPossession,
	};

	const accountInfo = await getIndexedAccountInfo({ address, limit: 1 }, ['name', 'publicKey']);
	validator.meta = {
		address,
		name: accountInfo && accountInfo.name ? accountInfo.name : null,
		publicKey: accountInfo && accountInfo.publicKey ? accountInfo.publicKey : null,
	};

	return validator;
};

module.exports = {
	getValidator,
};

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
const { requestConnector } = require('../../../utils/request');
const { getAddressByName } = require('../../utils/validator');

const { getLisk32AddressFromPublicKey } = require('../../../utils/account');
const { getAvailableTokenIDs } = require('./availableIDs');

const tokenHasUserAccount = async params => {
	const response = {
		data: {
			isExists: false,
		},
		meta: {},
	};

	let { address } = params;

	if (!address && params.name) {
		address = await getAddressByName(params.name);
	}

	if (!address && params.publicKey) {
		address = getLisk32AddressFromPublicKey(params.publicKey);
	}

	// Check existence if address found. Return false otherwise
	if (address) {
		const tokenIDs = [];

		if (params.tokenID) {
			tokenIDs.push(params.tokenID);
		} else {
			// Logic introduced to support the export microservice
			const result = await getAvailableTokenIDs();
			tokenIDs.push(...result.data.tokenIDs);
		}

		// eslint-disable-next-line no-restricted-syntax
		for (const tokenID of tokenIDs) {
			const { exists: isExists } = await requestConnector('tokenHasUserAccount', {
				address,
				tokenID,
			});

			if (isExists) {
				response.data.isExists = isExists;
				break;
			}
		}
	}

	return response;
};

module.exports = {
	tokenHasUserAccount,
};

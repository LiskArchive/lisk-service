/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { HTTP, Utils, Logger } = require('lisk-service-framework');

const { StatusCodes: { NOT_FOUND } } = HTTP;
const { isEmptyArray } = Utils.Data;

const config = require('../config');

// const logger = Logger();

const knownExpireMiliseconds = 5 * 60 * 1000;
// const staticUrl = config.endpoints.liskStatic;

// const getKnownAccounts = async () => {
// 	const result = await CoreService.getNetworkStatus();
// 	const { nethash } = result.data.constants;
// 	const cacheTTL = knownExpireMiliseconds;

// 	try {
// 		// const knownNetworks = await HTTP.request(`${staticUrl}/networks.json`, { cacheTTL });
// 		// if (knownNetworks.data[nethash]) {
// 		// 	return (await HTTP.request(`${staticUrl}/known_${knownNetworks.data[nethash]}.json`, { cacheTTL })).data;
// 		// }
// 		return {};
// 	} catch (err) {
// 		return {};
// 	}
// };

const knowledge = {};

const getAccountKnowledge = (address) => {
	if (knowledge[address]) return knowledge[address];
	return {};
};


const reloadKnowledge = () => {

};

const init = () => {
	reloadKnowledge();
	setInterval(reloadKnowledge, knownExpireMiliseconds);
};


module.exports = {
	init,
	getAccountKnowledge,
};

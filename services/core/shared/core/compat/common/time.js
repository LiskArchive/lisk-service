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
const { getNetworkConstants } = require('./constants');

let epochUnixTime;

// This method is only used for SDK Version <=4
const getEpochUnixTime = async () => {
	const nodeConstants = await getNetworkConstants();
	const { epoch } = nodeConstants.data ? nodeConstants.data : nodeConstants;
	epochUnixTime = new Date(epoch).getTime() / 1000;
	return epochUnixTime;
};

const getUnixTime = async blockchainTime => {
	if (!epochUnixTime) await getEpochUnixTime();
	const unixTime = Number(blockchainTime) + Number(epochUnixTime);
	return unixTime;
};

const getBlockchainTime = async unixTime => {
	if (!epochUnixTime) await getEpochUnixTime();
	const blockchainTime = Number(unixTime) - Number(epochUnixTime);
	return blockchainTime;
};

const validateTimestamp = async timestamp => {
	if (!epochUnixTime) await getEpochUnixTime();
	const minUnixTime = await getUnixTime(0);
	if (!timestamp) return false;
	if (Number(timestamp) < Number(minUnixTime)) return false;
	return true;
};

module.exports = {
	getEpochUnixTime,
	getUnixTime,
	getBlockchainTime,
	validateTimestamp,
};

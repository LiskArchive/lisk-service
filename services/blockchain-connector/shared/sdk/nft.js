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
const { Exceptions: { TimeoutException }, Logger } = require('lisk-service-framework');
const { timeoutMessage, invokeEndpoint } = require('./client');

const logger = Logger();

const getNFTConstants = async () => {
	try {
		const response = await invokeEndpoint('nft_getNFTConstants');
		if (response.error) throw new Error(response.error);
		return response;
	} catch (err) {
		if (err.message.includes(timeoutMessage)) {
			throw new TimeoutException('Request timed out when calling \'getNFTConstants\'.');
		}
		logger.warn(`Error returned when invoking 'nft_getNFTConstants'.\n${err.stack}`);
		throw err;
	}
};

module.exports = {
	getNFTConstants,
};

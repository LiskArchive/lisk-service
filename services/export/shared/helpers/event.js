/*
 * LiskHQ/lisk-service
 * Copyright © 2024 Lisk Foundation
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
const { EVENT_TOPIC_PREFIX, LENGTH_ID } = require('./constants');

const getTransactionIDFromTopic0 = topic0 =>
	topic0.startsWith(EVENT_TOPIC_PREFIX.TX_ID) &&
	topic0.length === EVENT_TOPIC_PREFIX.TX_ID.length + LENGTH_ID
		? topic0.slice(EVENT_TOPIC_PREFIX.TX_ID.length)
		: null;

const getCcmIDFromTopic0 = topic0 =>
	topic0.startsWith(EVENT_TOPIC_PREFIX.CCM_ID) &&
	topic0.length === EVENT_TOPIC_PREFIX.CCM_ID.length + LENGTH_ID
		? topic0.slice(EVENT_TOPIC_PREFIX.CCM_ID.length)
		: null;

module.exports = {
	getTransactionIDFromTopic0,
	getCcmIDFromTopic0,
};

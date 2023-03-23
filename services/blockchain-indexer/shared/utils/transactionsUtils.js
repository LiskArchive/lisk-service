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
const { parseToJSONCompatObj } = require('./parser');
const { TRANSACTION_STATUS, EVENT } = require('../constants');

const normalizeTransaction = async tx => {
	tx.moduleCommand = `${tx.module}:${tx.command}`;
	return parseToJSONCompatObj(tx);
};

const getTransactionExecutionStatus = (tx, events) => {
	const expectedEventName = `${tx.module}:${EVENT.COMMAND_EXECUTION_RESULT}`;
	const commandExecResultEvents = events.filter(e => `${e.module}:${e.name}` === expectedEventName);
	const txExecResultEvent = commandExecResultEvents.find(e => e.topics.includes(tx.id));
	if (!txExecResultEvent) throw Error(`Event unavailable to determine execution status for transaction: ${tx.id}.`);

	return txExecResultEvent.data.success ? TRANSACTION_STATUS.SUCCESS : TRANSACTION_STATUS.FAIL;
};

module.exports = {
	normalizeTransaction,
	getTransactionExecutionStatus,
};

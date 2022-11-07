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
const mocker = require('mocker-data-generator').default;
const txMocker = require('./createTransactionsData');

const {
	MODULE_TOKEN,
	COMMAND_TOKEN_TRANSFER,
	MODULE_DPOS,
	COMMAND_DPOS_VOTE_DELEGATE,
	MODULE_AUTH,
	COMMAND_AUTH_REGISTER_MULTISIGNATURE,
} = require('./constants');

const blockMocker = (blockData, batchSize, payloadLength) => mocker()
	.schema('blocks', blockData, batchSize)
	.build((err, data) => {
		if (err) console.error(err);

		let blockIndex = data.blocks.length - 1;
		do {
			const block = data.blocks[blockIndex];

			if (blockIndex < data.blocks.length - 1) {
				block.timestamp = data.blocks[blockIndex + 1].timestamp - 10;
			}

			if (payloadLength === 0) {
				block.transactions = [];
			} else {
				block.transactions = txMocker(payloadLength);
				let transactionIndex = block.transactions.length - 1;
				do {
					const transaction = block.transactions[transactionIndex];

					let txPayloadLength;
					if (transaction.module === MODULE_TOKEN
						&& transaction.command === COMMAND_TOKEN_TRANSFER) {
						txPayloadLength = 130;
					} else if (transaction.module === MODULE_AUTH
						&& transaction.command === COMMAND_AUTH_REGISTER_MULTISIGNATURE) {
						txPayloadLength = 117;
					} else if (transaction.module === MODULE_DPOS
						&& transaction.command === COMMAND_DPOS_VOTE_DELEGATE) {
						txPayloadLength = 130;
					}
					transaction.size += txPayloadLength;
					transaction.minFee = transaction.size * 1000;
				} while (--transactionIndex >= 0);
			}
			if (blockIndex > 0) {
				block.previousBlockId = data.blocks[blockIndex - 1].id;
			}
		} while (--blockIndex >= 0);

		return data;
	});

module.exports = blockMocker;

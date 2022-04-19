/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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

const blockMocker = (blockData, batchSize) => mocker()
	.schema('blocks', blockData, batchSize)
	.build((err, data) => {
		if (err) console.error(err);

		let blockIndex = data.blocks.length - 1;
		do {
			const block = data.blocks[blockIndex];
			let blockTotalFee = 0;
			let blockTotalAmount = 0;
			let blockPayloadLength = 0;

			if (blockIndex < data.blocks.length - 1) {
				block.timestamp = data.blocks[blockIndex + 1].timestamp - 10;
			}

			if (block.numberOfTransactions === 0) {
				block.payload = [];
			} else {
				block.payload = txMocker(block.numberOfTransactions);
				let transactionIndex = block.payload.length - 1;
				do {
					const transaction = block.payload[transactionIndex];

					let txPayloadLength;
					if (transaction.type === 8) txPayloadLength = 130;
					else if (transaction.type === 10) txPayloadLength = 120;
					else if (transaction.type === 12) txPayloadLength = 117;
					else if (transaction.type === 13) txPayloadLength = 130;
					else if (transaction.type === 14) txPayloadLength = 134;
					else if (transaction.type === 15) txPayloadLength = 652;

					if (blockPayloadLength + txPayloadLength > 15 * 2 ** 10) {
						block.payload.splice(transactionIndex, 1);
					} else {
						blockPayloadLength += txPayloadLength;

						transaction.height = block.height;
						transaction.blockId = block.id;
						transaction.confirmations = block.confirmations;

						if ([8, 14].includes(transaction.type)) {
							blockTotalAmount += Number(transaction.asset.amount);
						} else if (transaction.type === 13) {
							let voteIndex = transaction.asset.votes.length - 1;
							do {
								blockTotalAmount += Number(transaction.asset.votes[voteIndex].amount);
							} while (--voteIndex >= 0);
						}
						blockTotalFee += Number(transaction.fee);
					}
				} while (--transactionIndex >= 0);
			}

			block.numberOfTransactions = block.payload.length;
			block.totalAmount = String(blockTotalAmount);
			block.totalFee = String(blockTotalFee);
			block.totalForged = String(Number(block.totalFee) + Number(block.reward));
			block.payloadLength = blockPayloadLength;

			if (blockIndex > 0) {
				block.previousBlockId = data.blocks[blockIndex - 1].id;
			}
		} while (--blockIndex >= 0);

		return data;
	});

module.exports = blockMocker;


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

			if (block.numberOfTransactions) {
				block.transactions = { data: txMocker(block.numberOfTransactions) };
				let transactionIndex = block.transactions.data.length - 1;
				do {
					const transaction = block.transactions.data[transactionIndex];
					transaction.height = block.height;
					transaction.blockId = block.id;

					if (transactionIndex < block.transactions.data.length - 1) {
						transaction.timestamp = block.transactions.data[transactionIndex + 1].timestamp
							- (Math.floor(Math.random() * 100) % 5);
					} else {
						transaction.timestamp = block.timestamp - (Math.floor(Math.random() * 100) % 30);
					}

					transaction.confirmations = block.confirmations;

					blockTotalAmount += transaction.amount;
					blockTotalFee += transaction.fee;

					let txPayloadLength;
					if (transaction.type === 8) txPayloadLength = 117;
					else if (transaction.type === 10) txPayloadLength = 117;
					else if (transaction.type === 12) txPayloadLength = 117;
					else if (transaction.type === 13) txPayloadLength = 117;
					else if (transaction.type === 14) txPayloadLength = 117;
					else if (transaction.type === 15) txPayloadLength = 117;

					blockPayloadLength += txPayloadLength;
				} while (--transactionIndex >= 0);
			}

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

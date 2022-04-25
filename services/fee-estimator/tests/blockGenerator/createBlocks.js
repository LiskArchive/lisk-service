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
				block.payload = [];
			} else {
				block.payload = txMocker(payloadLength);
				let transactionIndex = block.payload.length - 1;
				do {
					const transaction = block.payload[transactionIndex];

					let txPayloadLength;
					if (transaction.moduleID === 2 && transaction.assetID === 0) txPayloadLength = 130;
					else if (transaction.moduleID === 4 && transaction.assetID === 0) txPayloadLength = 117;
					else if (transaction.moduleID === 5 && transaction.assetID === 1) txPayloadLength = 130;
					transaction.size += txPayloadLength;
				} while (--transactionIndex >= 0);
			}
			if (blockIndex > 0) {
				block.previousBlockId = data.blocks[blockIndex - 1].id;
			}
		} while (--blockIndex >= 0);

		return data;
	});

module.exports = blockMocker;

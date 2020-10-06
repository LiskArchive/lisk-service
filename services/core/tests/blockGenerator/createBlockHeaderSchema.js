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

const minTransactionSize = 117;
const maxBlockSize = 15 * (2 ** 10);
const maxNumTransactionInABlock = Math.floor(maxBlockSize / minTransactionSize);

const generateHex = (size) => {
	let resultHex = '';
	const hexCharacters = 'abcdef0123456789';

	for (let i = 0; i < size; i++) {
		resultHex += hexCharacters.charAt(
			Math.floor(Math.random() * hexCharacters.length),
		);
	}

	return resultHex;
};

const blockHeaderSchema = {
	blockSignature: {
		function: () => generateHex(128),
	},
	generatorPublicKey: {
		function: () => generateHex(64),
	},
	height: {
		faker: 'random.number',
	},
	maxHeightPreviouslyForged: {
		faker: 'random.number',
	},
	maxHeightPrevoted: {
		faker: 'random.number',
	},
	numberOfTransactions: {
		function: () => Math.floor(Math.random() * 1000) % maxNumTransactionInABlock,
	},
	payloadHash: {
		function: () => generateHex(64),
	},
	payloadLength: {
		function: () => Math.floor(Math.random() * 1000),
	},
	previousBlockId: {
		// blockId is a 64-bit value
		function: () => Math.floor(Math.random() * 10 ** 20) % (2 ** 64),
	},
	reward: {
		function: () => String(1 * 10 ** 8),
	},
	seedReveal: {
		function: () => generateHex(32),
	},
	timestamp: {
		// Using the current mainnet epoch time for reference
		function: () => Math.floor((Date.now() - new Date('2016-05-24T17:00:00.000Z')) / 1000),
	},
	totalAmount: {
		function: () => Math.floor(Math.random() * 10 ** 8),
	},
	totalFee: {
		function: () => Math.floor(Math.random() * 10 ** 8),
	},
	version: {
		function: () => 1,
	},
};

const blockHeaderSchemaMocker = () => mocker()
	.schema('blockHeaderSchema', blockHeaderSchema, 1)
	.build((err, data) => {
		if (err) throw err;

		return data.blockHeaderSchema[0];
	});

module.exports = blockHeaderSchemaMocker;

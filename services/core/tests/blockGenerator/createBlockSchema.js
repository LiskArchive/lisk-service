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

const blockSchema = {
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
    previousBlockId: {
		function: () => Math.floor(Math.random() * 10 ** 19),
	},
    reward: {
		function: () => '200000000',
	},
    timestamp: {
		function: () => Math.floor(Date.now() / 10) * 10,
	},
	version: {
		function: () => 1,
    },
};

const blockSchemaMocker = () => mocker()
	.schema('blockSchema', blockSchema, 1)
	.build((err, data) => {
        if (err) throw err;
		return data;
	});

module.exports = blockSchemaMocker;

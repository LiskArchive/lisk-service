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

const fs = require('fs');
const path = require('path');
const blockMocker = require('./createBlocks');

const generateHex = (size) => {
	let resultHex = '';
	const characters = 'abcdef0123456789';

	for (let i = 0; i < size; i++) {
		resultHex += characters.charAt(
			Math.floor(Math.random() * characters.length),
		);
	}

	return resultHex;
};

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);

const blockData = {
	id: {
		function: () => generateHex(64),
	},
	height: {
		faker: 'random.number',
	},
	version: {
		function: () => 2,
	},
	timestamp: {
		function: () => Math.floor(Date.now() / 1000),
	},
	generatorPublicKey: {
		function: () => generateHex(64),
	},
	transactionRoot: {
		function: () => generateHex(64),
	},
	signature: {
		function: () => generateHex(128),
	},
	previousBlockId: {
		function: () => Math.floor(Math.random() * 10 ** 19),
	},
	reward: {
		function: () => '200000000',
	},
	transactions: {
		function: () => [],
	},
	asset: {
		maxHeightPreviouslyForged: {
			faker: 'random.number',
		},
		maxHeightPrevoted: {
			faker: 'random.number',
		},
		seedReveal: {
			function: () => generateHex(32),
		},
	},
};
let args = Number(process.argv.slice(2)[0]);
if (!args) {
	args = 20;
}

const noNetworkTraffic = () => {
	const payloadLength = 0;
	const res = blockMocker(blockData, args, payloadLength);
	fs.writeFileSync(
		`${path.dirname(__dirname)}/blockGenerator/noTraffic.json`,
		JSON.stringify(res, null, '\t'),
	);
};

const lowNetworkTraffic = () => {
	const payloadLength = randomNumber(0, 20);
	const res = blockMocker(blockData, args, payloadLength);
	fs.writeFileSync(
		`${path.dirname(__dirname)}/blockGenerator/lowTraffic.json`,
		JSON.stringify(res, null, '\t'),
	);
};

const moderateNetworkTraffic = () => {
	const payloadLength = randomNumber(30, 80);
	const res = blockMocker(blockData, args, payloadLength);
	fs.writeFileSync(
		`${path.dirname(__dirname)}/blockGenerator/moderateTraffic.json`,
		JSON.stringify(res, null, '\t'),
	);
};

const highNetworkTraffic = () => {
	const payloadLength = randomNumber(130, 150);
	const res = blockMocker(blockData, args, payloadLength);
	fs.writeFileSync(
		`${path.dirname(__dirname)}/blockGenerator/highTraffic.json`,
		JSON.stringify(res, null, '\t'),
	);
};

noNetworkTraffic();
lowNetworkTraffic();
moderateNetworkTraffic();
highNetworkTraffic();

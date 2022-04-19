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
		function: () => Math.floor(Math.random() * 10 ** 19),
	},
	height: {
		faker: 'random.number',
	},
	version: {
		function: () => 1,
	},
	timestamp: {
		function: () => Math.floor(Date.now() / 1000),
	},
	generatorAddress: {
		function: () => `${Math.floor(Math.random() * 10 ** 19)}L`,
	},
	generatorPublicKey: {
		function: () => generateHex(64),
	},
	generatorUsername: {
		faker: 'name.firstName',
	},
	payloadLength: {
		function: () => Math.floor(Math.random() * 1000),
	},
	payloadHash: {
		function: () => generateHex(64),
	},
	blockSignature: {
		function: () => generateHex(128),
	},
	confirmations: {
		function: () => Math.floor(Math.random() * 10),
	},
	previousBlockId: {
		function: () => Math.floor(Math.random() * 10 ** 19),
	},
	numberOfTransactions: {
		function: () => null,
	},
	totalAmount: {
		function: () => null,
	},
	totalFee: {
		function: () => null,
	},
	reward: {
		function: () => '200000000',
	},
	totalForged: {
		function: () => null,
	},
	transactions: {
		function: () => [],
	},
};
let args = Number(process.argv.slice(2)[0]);
if (!args) {
	args = 20;
}
const noNetworkTraffic = () => {
	blockData.numberOfTransactions = { function: () => 0 };
	const res = blockMocker(blockData, args);
	fs.writeFileSync(
		`${path.dirname(__dirname)}/blockGenerator/noTraffic.json`,
		JSON.stringify(res, null, '\t'),
	);
};

const lowNetworkTraffic = () => {
	blockData.numberOfTransactions = { function: () => randomNumber(0, 10) };
	const res = blockMocker(blockData, args);
	fs.writeFileSync(
		`${path.dirname(__dirname)}/blockGenerator/lowTraffic.json`,
		JSON.stringify(res, null, '\t'),
	);
};

const moderateNetworkTraffic = () => {
	blockData.numberOfTransactions = { function: () => randomNumber(30, 80) };
	const res = blockMocker(blockData, args);
	fs.writeFileSync(
		`${path.dirname(__dirname)}/blockGenerator/moderateTraffic.json`,
		JSON.stringify(res, null, '\t'),
	);
};

const highNetworkTraffic = () => {
	blockData.numberOfTransactions = { function: () => randomNumber(130, 150) };
	const res = blockMocker(blockData, args);
	fs.writeFileSync(
		`${path.dirname(__dirname)}/blockGenerator/highTraffic.json`,
		JSON.stringify(res, null, '\t'),
	);
};

noNetworkTraffic();
lowNetworkTraffic();
moderateNetworkTraffic();
highNetworkTraffic();

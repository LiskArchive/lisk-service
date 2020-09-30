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
const blockHeaderSchemaMocker = require('./createBlockHeaderSchema');

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

const transactionData = {
	id: {
		function: () => String(Math.floor(Math.random() * 10 ** 20)),
	},
	type: {
		function: () => {
			const validTypes = [8, 10, 12, 13, 14, 15];
			let index = Math.floor(Math.random() * 10) % validTypes.length;
			if (index > 0 && Math.floor(Math.random() * 100) % 9) index = 0;
			return validTypes[index];
		},
	},
	fee: {
		function: () => Math.floor(Math.random() * 10 ** ((Math.random() * 10) % 4)),
	},
	senderPublicKey: {
		function: () => generateHex(64),
	},
	nonce: {
		function: () => String(Math.floor(Math.random() * 10 ** 3)),
	},
	asset: {
		username: { faker: 'name.firstName' },
		publicKey: { function: () => null },
		address: { function: () => null },
		min: { function: () => 1 },
		lifetime: { function: () => Math.floor(Math.random() * 100) },
		keysgroup: { function: () => [`+${generateHex(64)}`] },
		mandatoryKeys: { function: () => [`+${generateHex(64)}`] },
		optionalKeys: { function: () => [`+${generateHex(64)}`] },
		numberOfSignatures: { function: () => 0 },
		votes: {
			function: () => [{
				amount: String((Math.floor(Math.random() * 10) * 10 ** 7)),
				delegateAddress: `${Math.floor(Math.random() * 10 ** 19)}L`,
			}],
		},
		unlockingObjects: {
			function: () => [{
				delegateAddress: `${Math.floor(Math.random() * 10 ** 19)}L`,
				amount: String((Math.floor(Math.random() * 10) * 10 ** 7)),
				unvoteHeight: Math.floor(Math.random() * 10),
			}],
		},
		amount: { function: () => String(Math.floor(Math.random() * 10)) },
		recipientId: { function: () => `${Math.floor(Math.random() * 10 ** 19)}L` },
		header1: { function: () => blockHeaderSchemaMocker() },
		header2: { function: () => blockHeaderSchemaMocker() },
	},
	signatures: {
		function: () => [generateHex(128)],
	},
	height: {
		function: () => null,
	},
	blockId: {
		function: () => null,
	},
	senderId: {
		function: () => `${Math.floor(Math.random() * 10 ** 19)}L`,
	},
	recipientPublicKey: {
		function: () => generateHex(64),
	},
	confirmations: {
		function: () => null,
	},
};

const assetsTransactionType8 = ['amount', 'recipientId'];
const assetsTransactionType10 = ['username', 'publicKey', 'address'];
const assetsTransactionType12 = ['mandatoryKeys', 'optionalKeys', 'numberOfSignatures'];
const assetsTransactionType13 = ['votes'];
const assetsTransactionType14 = ['unlockingObjects'];
const assetsTransactionType15 = ['header1', 'header2'];

const txMocker = (batchSize) => mocker()
	.schema('transactions', transactionData, batchSize)
	.build((err, data) => {
		if (err) throw err;

		data.transactions.forEach((transaction) => {
			let containAssets = assetsTransactionType8;
			let nameFee = 0;
			let avgTxSize = 130;
			if (transaction.type === 10) {
				containAssets = assetsTransactionType10;
				nameFee = 10 * 10 ** 8;
				avgTxSize = 120;

				transaction.asset = {
					...transaction.asset,
					publicKey: transaction.senderPublicKey,
					address: transaction.senderId,
				};
			} else if (transaction.type === 12) {
				containAssets = assetsTransactionType12;
				avgTxSize = 117;

				let n = Math.floor(Math.random() * 10) % 5;
				let m = Math.floor(Math.random() * 10) % 5;
				transaction.asset.numberOfSignatures = n + (m > 2 ? m % 2 : 0);
				while (--n > 0) transaction.asset.mandatoryKeys.push(generateHex(128));
				while (--m > 0) transaction.asset.optionalKeys.push(generateHex(128));
			} else if (transaction.type === 13) {
				containAssets = assetsTransactionType13;
				avgTxSize = 130;
			} else if (transaction.type === 14) {
				containAssets = assetsTransactionType14;
				avgTxSize = 134;
			} else if (transaction.type === 15) {
				containAssets = assetsTransactionType15;
				avgTxSize = 652;

				transaction.asset.header2.seedReveal = transaction.asset.header1.seedReveal;
				transaction.asset.header2.generatorPublicKey = transaction.asset.header1.generatorPublicKey;
				let n = Math.floor(Math.random() * 10) % 5;
				while (--n > 0) transaction.signatures.push(generateHex(128));
				transaction.ready = true;
			}

			const minFee = nameFee + avgTxSize * 10 ** 3;
			transaction.fee = String(minFee + avgTxSize * transaction.fee);
			Object.keys(transaction.asset).forEach(key => {
				if (!containAssets.includes(key)) delete transaction.asset[key];
			});
		});

		return data.transactions;
	});

module.exports = txMocker;

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

const {
	MODULE_TOKEN,
	COMMAND_TOKEN_TRANSFER,
	MODULE_DPOS,
	COMMAND_DPOS_VOTE_DELEGATE,
	MODULE_AUTH,
	COMMAND_AUTH_REGISTER_MULTISIGNATURE,
} = require('./constants');

let command;
const TOKEN_ID = '0000000000000000';

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

const getTokenID = () => TOKEN_ID;

const getCommand = () => command;

const transactionData = {
	id: {
		function: () => generateHex(64),
	},
	module: {
		function: () => {
			const validModuleTypes = [MODULE_TOKEN, MODULE_AUTH, MODULE_DPOS];
			const validCommandTypes = [
				COMMAND_TOKEN_TRANSFER,
				COMMAND_AUTH_REGISTER_MULTISIGNATURE,
				COMMAND_DPOS_VOTE_DELEGATE,
			];
			const index = Math.floor(Math.random() * (validModuleTypes.length + 1));
			command = validCommandTypes[index];
			return validModuleTypes[index];
		},
	},
	command: {
		function: () => getCommand(),
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
	params: {
		data: { faker: 'name.firstName' },
		amount: { function: () => String(Math.floor(Math.random() * 10)) },
		recipientAddress: { function: () => generateHex(40) },
		tokenID: { function: () => getTokenID() },

		mandatoryKeys: { function: () => [`+${generateHex(64)}`] },
		optionalKeys: { function: () => [`+${generateHex(64)}`] },
		numberOfSignatures: { function: () => 0 },

		votes: {
			function: () => [{
				amount: String((Math.floor(Math.random() * 10) * 10 ** 7)),
				delegateAddress: generateHex(40),
			}],
		},
	},
	signatures: {
		function: () => [generateHex(128)],
	},
	size: {
		function: () => 0,
	},
	minFee: {
		function: () => 0,
	},
};

const paramsTransactionTypeTransfer = ['amount', 'recipientAddress', 'data', 'tokenID'];
const paramsTransactionTypeRegisterMultisignature = ['mandatoryKeys', 'optionalKeys', 'numberOfSignatures'];
const paramsTransactionTypeVoteDelegate = ['votes'];

const txMocker = (batchSize) => mocker()
	.schema('transactions', transactionData, batchSize)
	.build((err, data) => {
		if (err) throw err;

		data.transactions.forEach((transaction) => {
			let containAssets = paramsTransactionTypeTransfer;
			const nameFee = 0;
			let avgTxSize = 130;
			if (transaction.module === MODULE_AUTH) {
				transaction.command = COMMAND_AUTH_REGISTER_MULTISIGNATURE;
				containAssets = paramsTransactionTypeRegisterMultisignature;
				avgTxSize = 117;

				let n = Math.floor(Math.random() * 10) % 5;
				let m = Math.floor(Math.random() * 10) % 5;
				transaction.params.numberOfSignatures = n + (m > 2 ? m % 2 : 0);
				while (--n > 0) transaction.params.mandatoryKeys.push(generateHex(128));
				while (--m > 0) transaction.params.optionalKeys.push(generateHex(128));
			} else if (transaction.module === MODULE_DPOS) {
				transaction.command = COMMAND_DPOS_VOTE_DELEGATE;
				containAssets = paramsTransactionTypeVoteDelegate;
				avgTxSize = 130;
			} else if (transaction.module === MODULE_TOKEN
				&& transaction.command === COMMAND_TOKEN_TRANSFER) {
				avgTxSize = 130;
			}

			transaction.size = avgTxSize;
			transaction.minFee = nameFee + avgTxSize * 10 ** 3;
			transaction.fee = String(transaction.minFee
				+ Math.round(Math.random() * transaction.minFee * 5));
			Object.keys(transaction.params).forEach(key => {
				if (!containAssets.includes(key)) delete transaction.params[key];
			});
		});

		return data.transactions;
	});

module.exports = txMocker;

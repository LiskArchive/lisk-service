#!/usr/bin/env node
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
/* eslint-disable no-console,no-multi-spaces,key-spacing,no-unused-vars */

const util = require('util');

const { APIClient, transactions, cryptography } = require('@liskhq/lisk-client');

const genesis = {
	address: '5059876081639179984L',
	publicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
	passphrase:
		'peanut hundred pen hawk invite exclude brain chunk gadget wait wrong ready',
	balance: '10000000000000000',
	encryptedPassphrase:
		'iterations=10&cipherText=6541c04d7a46eacd666c07fbf030fef32c5db324466e3422e59818317ac5d15cfffb80c5f1e2589eaa6da4f8d611a94cba92eee86722fc0a4015a37cff43a5a699601121fbfec11ea022&iv=141edfe6da3a9917a42004be&salt=f523bba8316c45246c6ffa848b806188&tag=4ffb5c753d4a1dc96364c4a54865521a&version=1',
	password: 'elephant tree paris dragon chair galaxy',
};

const networkIdentifier = cryptography.getNetworkIdentifier(
    "19074b69c97e6f6b86969bb62d4f15b888898b499777bda56a3a2ee642a7f20a",
    "Lisk",
);

const currentTimestamp = () => Math.round((new Date()).getTime() / 1000);

const client = new APIClient(['http://localhost:4000']);

const sendTransaction = (async () => {
	const getNonce = async (accountId) => (await client.accounts.get({ address: accountId }))
		.data[0]
		.nonce;

	const tx = new transactions.TransferTransaction({
		senderPublicKey: genesis.publicKey,
		asset: {
			amount: '15000000',
			recipientId: genesis.address,
			data: `Tx from ${currentTimestamp()}`,
		},
		nonce: await getNonce(genesis.address),
		fee: '1000000',
	});

	tx.sign(
		networkIdentifier,
		genesis.passphrase,
	);

	// console.log(tx.toJSON());

	client.transactions.broadcast(tx.toJSON())
	.then(res => {
		console.log(util.inspect(res.data));
	}).catch(err => {
		console.log(util.inspect(err));
	});
});

setInterval(sendTransaction, 10000);

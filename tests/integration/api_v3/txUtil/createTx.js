/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const { transactions, cryptography } = require('@liskhq/lisk-client');
const { api } = require('../../../helpers/api');

const { address, privateKey, publicKey, tokenTransferParamsSchema } = require('./constants');

const createTokenTransferTx = async (authEndpoint) => {
	const authResponse = await api.get(`${authEndpoint}?address=${address}`);

	const txBuilder = {
		module: 'token',
		command: 'transfer',
		nonce: BigInt(authResponse.data.nonce),
		fee: BigInt('100000000'),
		senderPublicKey: Buffer.from(publicKey, 'hex'),
		params: {
			tokenID: Buffer.from([4, 0, 0, 0, 0, 0, 0, 0]),
			amount: BigInt('1000000000000'),
			recipientAddress: cryptography.address.getAddressFromLisk32Address('lskv6v53emsaen6cwbbk226wusdpa6ojdonunka4x'),
			data: '',
		},
	};

	const signedTx = transactions.signTransaction(txBuilder, Buffer.from('04000000', 'hex'), Buffer.from(privateKey, 'hex'), tokenTransferParamsSchema);

	const tx = {
		...signedTx,
		id: signedTx.id.toString('hex'),
		senderPublicKey: signedTx.senderPublicKey.toString('hex'),
		signatures: signedTx.signatures.map((s) => s.toString('hex')),
		params: {
			...signedTx.params,
			tokenID: signedTx.params.tokenID.toString('hex'),
			amount: signedTx.params.amount.toString(),
			recipientAddress: cryptography.address.getLisk32AddressFromAddress(
				signedTx.params.recipientAddress,
			),
		},
		nonce: signedTx.nonce.toString(),
		fee: signedTx.fee.toString(),
	};

	return tx;
};

module.exports = {
	createTokenTransferTx,
};

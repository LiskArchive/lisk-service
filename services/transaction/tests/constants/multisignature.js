/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const transactions = [
	{
		serviceId: '22139cb8-d1d3-43ec-b7d3-9f1ed30e5957',
		nonce: 1,
		senderPublicKey: '3e50549cd4d98760064ff2fe51801afba4e5e8623335275cece0eeff8495a81b',
		senderAddress: 'lsk6f9gs9zfk6wqxgxnmxw5tbce2g8d42krtrwdfd',
		asset: '{"numberOfSignatures":2,"mandatoryKeys":["228c865b903dab827342aa6611676bf883e982e7cd467c9168a7966cdabb391c","3e50549cd4d98760064ff2fe51801afba4e5e8623335275cece0eeff8495a81b"],"optionalKeys":[]}',
		moduleAssetId: '4:0',
		fee: '314000',
		createdAt: 1629276090,
		modifiedAt: 1629276090,
		expiresAt: 1662224456,
	},
	{
		serviceId: '088ea73f-cf58-475e-8fec-128be99555bf',
		nonce: 2,
		senderPublicKey: '4d50549cd4d98760064ff2fe51801afba4e5e8623335275cece0eeff8495a81c',
		senderAddress: 'lsk2dp8gf6me3hafoqgtqej8dk96uusdhykvnkbrr',
		asset: '{"numberOfSignatures":2,"mandatoryKeys":["4d50549cd4d98760064ff2fe51801afba4e5e8623335275cece0eeff8495a81c","9bc945f92141d5e11e97274c275d127dc7656dda5c8fcbf1df7d44827a732664"],"optionalKeys":[]}',
		moduleAssetId: '4:0',
		fee: '640000',
		createdAt: 1629276090,
		modifiedAt: 1629276090,
		expiresAt: 1662224456,
	},
];

const inputTransaction = {
	nonce: '0',
	senderPublicKey: 'b1d6bc6c7edd0673f5fed0681b73de6eb70539c21278b300f07ade277e1962cd',
	moduleAssetId: '2:0',
	asset: {
		amount: '500000000',
		recipientId: 'lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99',
		data: 'Multisig token transfer transaction',
	},
	fee: '1000000',
	expires: Math.floor(Date.now() / 1000) + 31556952,
	signatures: [
		{
			publicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
			signature: '72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a',
		},
	],
};

const inputTransactionServiceId = 'fbe8d7842da66be50498d36af4dfbd918720f4a267271f91a66b487e2e1433be';

module.exports = {
	transactions,
	inputTransaction,
	inputTransactionServiceId,
};

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
const lsk = '10.00268000';
const beddows = '1000268000';
const lskInBeddows = 10 ** 8;

const reclaimTransaction = {
	id: '6cff643daaa2bd1112d1b4591abef3e62f9e4f6e37a260fcd7508ce6a06f061c',
	moduleAssetId: '1000:0',
	moduleAssetName: 'legacyAccount:reclaimLSK',
	fee: '119000',
	height: 424,
	nonce: '0',
	block: {
		id: 'c3a515cbfacd65402500ba423710ef9debf87f2877bd9c47d35097a9d4c28b7b',
		height: 424,
		timestamp: 1629456896,
	},
	senderId: 'lskqz6gpqfu9tb5yc2jtqmqvqp3x8ze35g99u2zfd',
	senderPublicKey: '10bdf57ee21ff657ab617395acab81814c3983f608bf6f0be6e626298225331d',
	signatures: [
		'a639b29d0a28054968bd6185e0785927b0e61b90c9f88a37c9d97adfa3b3d9cef46887b7d13f52f461017ffe11462e1d11506d6904088916d61727cdc23aa503',
	],
	asset: {
		amount: '16500000000',
	},
	isPending: false,
};

const tokenTransferTransaction = {
	id: 'a22d1d1959af42988746d350d4c21c3ffb81086e116de34d29148e6799bc2e8e',
	moduleAssetId: '2:0',
	moduleAssetName: 'token:transfer',
	fee: '143000',
	height: 415,
	nonce: '135',
	block: {
		id: '34c00b25881646cc112f37ab7bdbf587815a0d2ecc536f310386ac5ef444168c',
		height: 415,
		timestamp: 1629456806,
	},
	senderId: 'lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt',
	senderPublicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
	signatures: [
		'fc953e325c33dee5e32616483800ee8cb649531b07ce8f29d18dabdbcd434a86e7db7bc8d8272926b6cce6c2c59a897907eb15e74e0d17fe83486a9351b85308',
	],
	asset: {
		amount: '2000000000',
		data: '',
		recipient: {
			address: 'lskse4hng55r4raxtp53m6cbscjdoeyafhac4r73d',
			publicKey: 'c348769465d4119868ec9e8aa9c8bdebc5a504fa40fdc2072c6629e77b3c1856',
		},
	},
	isPending: false,
};

const voteTransaction = {
	id: '61ca0e9e5fa3fc1c798016eb6e0b5f2d93a806d3ae30b601bb4aa4152ad0e256',
	moduleAssetId: '5:1',
	moduleAssetName: 'dpos:voteDelegate',
	fee: '304000',
	height: 336,
	nonce: '3',
	block: {
		id: '3b01dca7dd089e9f71b08ebf0d68b8ba36070a45ba2463c5b306de7241953ebe',
		height: 336,
		timestamp: 1629113786,
	},
	senderId: 'lskatchyvyh9y3tz3mmpu9z3kptw56c6qcw4k7fks',
	senderPublicKey: '2f3dfb37326c6c42af28d04e6b6a76865430ade3d26969f1b86e3987b500bbaf',
	senderUsername: 'multisig_delegateacc',
	signatures: [
		'5ede8ac818b0acae725751ddda1bb5754761ce5eb7e1aaa8ff11d8ca72d4865ea748adfe72493d8daa9ed40b83119bb1dd539a068f2845a5445eca6c10d90c00',
		'94c115708a3daa65800b510cf14e51a8efd6a87922ef4740fe682aaae7b9ef76051b9387858048fe66aba5d3edc1f4adaafc54722156f7064ed344205d924601',
		'038ae3472d9f672dd93612d88e2e13da18ca80c013df01b2b3d30ac6c04dc1c24cc17f294cea33f342de33e6274a46fc81c1debc94c51747384b9bbdb4252e0e',
	],
	asset: {
		votes: [
			{
				delegateAddress: 'lskatchyvyh9y3tz3mmpu9z3kptw56c6qcw4k7fks',
				amount: '1000000000',
			},
			{
				delegateAddress: 'lskep7mup86zhmczmx9u4mehcnhnw2ke4k3nhzms4',
				amount: '1000000000',
			},
		],
	},
	isPending: false,
};

module.exports = {
	lsk,
	beddows,
	lskInBeddows,
	transactions: {
		reclaim: reclaimTransaction,
		tokenTransfer: tokenTransferTransaction,
		vote: voteTransaction,
	},
};

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
const generateExcpectedCsv = (json, delimiter) => ''.concat(
	Object.keys(json).map(k => typeof k === 'number' ? k : `"${k}"`).join(delimiter),
	'\n',
	Object.values(json).map(k => (typeof k === 'number' || !k) ? k : `"${k}"`).join(delimiter),
);

const tokenTransferTransaction = {
	moduleID: 2,
	assetID: 0,
	nonce: '0',
	fee: '149000',
	senderPublicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
	asset: {
		amount: '20000000000',
		data: 'Test tx',
		recipient: {
			address: 'lskhyoacr3xdfjy24mnzagb6tyt7wkqf2s6fezxn8',
			publicKey: 'bfccf04909701c44add442c12cd86bb1332e61a70b2b6d48d97021b4dc3e6a60',
			username: 'test_delegate',
		},
	},
	signatures: [
		'16bc38cb999f64debb93bcd27bc06361f95fc0d4fee8f1376cf09af7ac67294cf815a97dd946e6b1920e492606b07a39b5ae6e16ac558c728039352720567907',
	],
	id: '052b7e922e6c703d9f7e32f6bafce8f67d9ebd65329ef8b1e61d4eb267096377',
	moduleAssetId: '2:0',
	moduleAssetName: 'token:transfer',
	unixTimestamp: 1629113166,
	height: 274,
	blockId: 'f128eb61e6e64ad7b6e96b71a191ee171ac21f009944d5d96c71092d5ae68a98',
	senderId: 'lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt',
	isPending: false,
	type: '2:0',
	amount: '20000000000',
};

const selfTokenTransferTransaction = {
	moduleID: 2,
	assetID: 0,
	nonce: '0',
	fee: '149000',
	senderPublicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
	asset: {
		amount: '20000000000',
		data: 'Test tx',
		recipient: {
			address: 'lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt',
			publicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
			username: '',
		},
	},
	signatures: [
		'16bc38cb999f64debb93bcd27bc06361f95fc0d4fee8f1376cf09af7ac67294cf815a97dd946e6b1920e492606b07a39b5ae6e16ac558c728039352720567907',
	],
	id: '052b7e922e6c703d9f7e32f6bafce8f67d9ebd65329ef8b1e61d4eb267096377',
	moduleAssetId: '2:0',
	moduleAssetName: 'token:transfer',
	unixTimestamp: 1629113166,
	height: 274,
	blockId: 'f128eb61e6e64ad7b6e96b71a191ee171ac21f009944d5d96c71092d5ae68a98',
	senderId: 'lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt',
	isPending: false,
	type: '2:0',
	amount: '20000000000',
};

module.exports = {
	generateExcpectedCsv,
	tokenTransfer: {
		toSelf: {
			transaction: selfTokenTransferTransaction,
			sender: selfTokenTransferTransaction.senderId,
		},
		toOther: {
			transaction: tokenTransferTransaction,
			sender: tokenTransferTransaction.senderId,
		},
	},
};

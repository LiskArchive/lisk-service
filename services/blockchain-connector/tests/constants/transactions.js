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
const transaction = {
	moduleID: 2,
	commandID: 0,
	nonce: '4',
	fee: '200000',
	senderPublicKey: '41e9303d6e871e066f58f4900422b802cf98ee9035a070f92baa1aa7b55728a8',
	params: {
		amount: '752291501',
		recipientAddress: '60db70ee3f962d518096127ed73b8b8ac9441a28',
		data: '',
	},
	signatures: [
		'fb02e7a125d20909a449be226cb8f7cc17085b98414584e3422d3405bd83d0dc0aa108ecaf1af01825dbbb632d85bf6bd0f7bbbc9fd81519485679dda78f7006',
	],
	id: 'a6ba9d89d8e57bc921dd56417313a01fa7834f12cdbcebdfda58c7b385397d96',
	size: 142,
};

const invalidTransaction = {
	moduleID: 2,
	commandID: 0,
	nonce: '4',
	fee: '200000',
	senderPublicKey: '41e9303d6e871e066f58f4900422b802cf98ee9035a070f92baa1aa7b55728a8',
	asset: {
		amount: '752291501',
		recipientAddress: '60db70ee3f962d518096127ed73b8b8ac9441a28',
		data: '',
	},
	id: 'a6ba9d89d8e57bc921dd56417313a01fa7834f12cdbcebdfda58c7b385397d96',
};

const encodedTransaction = '08021000180420c09a0c2a2041e9303d6e871e066f58f4900422b802cf98ee9035a070f92baa1aa7b55728a8321e08ad9ddce602121460db70ee3f962d518096127ed73b8b8ac9441a281a003a40fb02e7a125d20909a449be226cb8f7cc17085b98414584e3422d3405bd83d0dc0aa108ecaf1af01825dbbb632d85bf6bd0f7bbbc9fd81519485679dda78f7006';

const invalidEncodedTransaction = '08021000180420c09a0c2a2041e9303d6e871e066f58f4900422b802cf98ee9035a070f92baa1aa7b55728a8321e08ad9ddce602121460db70ee3f962d518096127ed73b8b8ac9441a281a003a40fb02e7a125d20909a449be226cb8f7cc17085b98414584e3422d3405bd83d0dc0aa108ecaf1af01825dbbb632d85bf6bd0f7bbbc9fd81519485679dda78f7006';

module.exports = {
	transaction,
	invalidTransaction,
	encodedTransaction,
	invalidEncodedTransaction,
};

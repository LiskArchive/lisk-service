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
const validTx = {
	module: 'token',
	command: 'transfer',
	params: '0a0804000000000000001080c8afa0251a1402604d9e57a39772fa12f2a860ecf6c1e9cae911221054657374207472616e73616374696f6e',
	nonce: '0',
	fee: '100000000',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	signatures: [
		'ebe894b2727bff28ae82e20fb0d3886b4375de08ad1001d8908207c76b9122bad9673d9b099c2d97cbc74734729c2b9bd603143b8723d5ec6ea5838d52014200',
	],
	id: '3187fcfe95e11849ecd1c31c0e497512eee86a8b32e5a96613c4356fb036b486',
};

const eventsForValidTx = [
	{
		id: '3d52b610d834761fb4fc883151a7710b0a83ede865be1ce0a99988258ad2b02c',
		module: 'token',
		name: 'commandExecutionResult',
		data: {
			success: true,
		},
		topics: [
			'3187fcfe95e11849ecd1c31c0e497512eee86a8b32e5a96613c4356fb036b486',
		],
		index: 7,
		block: {
			id: 'ac558649b4c06ef300db7dd86612c1f4f8e3011c4c632ba8a8a8eaa1c54e7993',
			height: 3588,
			timestamp: 1679308600,
		},
	},
];

const eventsWithFailStatus = [
	{
		id: '3d52b610d834761fb4fc883151a7710b0a83ede865be1ce0a99988258ad2b02c',
		module: 'token',
		name: 'commandExecutionResult',
		data: {
			success: false,
		},
		topics: [
			'3187fcfe95e11849ecd1c31c0e497512eee86a8b32e5a96613c4356fb036b486',
		],
		index: 7,
		block: {
			id: 'ac558649b4c06ef300db7dd86612c1f4f8e3011c4c632ba8a8a8eaa1c54e7993',
			height: 3588,
			timestamp: 1679308600,
		},
	},
];

module.exports = {
	validTx,
	eventsForValidTx,
	eventsWithFailStatus,
};

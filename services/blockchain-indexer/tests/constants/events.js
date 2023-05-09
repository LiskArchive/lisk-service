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

const eventsIncludingTokenModule = [
	{
		data: {
			address: 'lskz23xokaxhmmkpbzdjt5agcq59qkby7bne2hwpk',
			module: 'fee',
			tokenID: '0400000000000000',
			amount: '1500000000',
			result: 0,
		},
		index: 0,
		module: 'token',
		name: 'lock',
		topics: [
			'76d4488029f123f8754f5f8182aba8574638ba3ac40a5d4d03c7ff7d2aa31472',
			'lskz23xokaxhmmkpbzdjt5agcq59qkby7bne2hwpk',
		],
		height: 8,
		id: 'fc7a423928dca346a270d09796ef3c1655c0b1e520949b9330a10496ff663d06',
	},
	{
		data: {
			chainID: '04000001',
			tokenID: '0400000000000000',
			initializationFee: '5000000',
			result: 0,
		},
		index: 1,
		module: 'token',
		name: 'initializeEscrowAccount',
		topics: [
			'76d4488029f123f8754f5f8182aba8574638ba3ac40a5d4d03c7ff7d2aa31472',
			'04000001',
		],
		height: 8,
		id: '07b9af818f25f7671411e2e7939c6db60474f3dd04a2e1c52ba073d39a8ac58b',
	},
	{
		data: {
			name: 'enevti',
			lastCertificate: {
				height: 0,
				timestamp: 0,
				stateRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
				validatorsHash: '7af2b1af2891382ab12f35964c90f2285e337c842465eb7f2046b9ca15fdf0fe',
			},
			status: 0,
		},
		index: 2,
		module: 'interoperability',
		name: 'chainAccountUpdated',
		topics: [
			'76d4488029f123f8754f5f8182aba8574638ba3ac40a5d4d03c7ff7d2aa31472',
			'04000001',
		],
		height: 8,
		id: 'be9f3fd78c455be02dbdcb2c80d333730983b369f4e087486e139dc3a0a6261d',
	},
	{
		data: {
			ccm: {
				module: 'interoperability',
				crossChainCommand: 'registration',
				nonce: '0',
				fee: '0',
				sendingChainID: '04000000',
				receivingChainID: '04000001',
				params: '0a06656e657674691204040000011a08040000000000000020e807',
				status: 0,
			},
		},
		index: 3,
		module: 'interoperability',
		name: 'ccmSendSuccess',
		topics: [
			'76d4488029f123f8754f5f8182aba8574638ba3ac40a5d4d03c7ff7d2aa31472',
			'04000000',
			'04000001',
			'6f96ea718cf5d9db5016887092a96604a4d52ed1a0cdda69c576b81637b56cef',
		],
		height: 8,
		id: 'efda7ba6977b9204e1a625dc2d98329e852562f2ae6ab694bf5dfe20960dc554',
	},
	{
		data: {
			address: 'lskz23xokaxhmmkpbzdjt5agcq59qkby7bne2hwpk',
			module: 'fee',
			tokenID: '0400000000000000',
			amount: '1500000000',
			result: 0,
		},
		index: 4,
		module: 'token',
		name: 'unlock',
		topics: [
			'76d4488029f123f8754f5f8182aba8574638ba3ac40a5d4d03c7ff7d2aa31472',
			'lskz23xokaxhmmkpbzdjt5agcq59qkby7bne2hwpk',
		],
		height: 8,
		id: '91a0a756874af88205dc20e309eb809d2daa425dbb6a678d7e94114909e5179e',
	},
	{
		data: {
			senderAddress: 'lskz23xokaxhmmkpbzdjt5agcq59qkby7bne2hwpk',
			recipientAddress: 'lsk6q3eq5qnahyytpywoxkgarzh8gck396wmd3yeu',
			tokenID: '0400000000000000',
			amount: '489382000',
			result: 0,
		},
		index: 5,
		module: 'token',
		name: 'transfer',
		topics: [
			'76d4488029f123f8754f5f8182aba8574638ba3ac40a5d4d03c7ff7d2aa31472',
			'lskz23xokaxhmmkpbzdjt5agcq59qkby7bne2hwpk',
			'lsk6q3eq5qnahyytpywoxkgarzh8gck396wmd3yeu',
		],
		height: 8,
		id: '8c8415ae35592be88130d64e8f1acfa761a87d6c288378c2235c8e2abfde333f',
	},
	{
		data: {
			address: 'lskz23xokaxhmmkpbzdjt5agcq59qkby7bne2hwpk',
			tokenID: '0400000000000000',
			amount: '1010618000',
			result: 0,
		},
		index: 6,
		module: 'token',
		name: 'burn',
		topics: [
			'76d4488029f123f8754f5f8182aba8574638ba3ac40a5d4d03c7ff7d2aa31472',
			'lskz23xokaxhmmkpbzdjt5agcq59qkby7bne2hwpk',
		],
		height: 8,
		id: 'd314328148ae956ca3964398cb3cf74b453d58f6115c9f373de27869502e0c64',
	},
	{
		data: {
			senderAddress: 'lskz23xokaxhmmkpbzdjt5agcq59qkby7bne2hwpk',
			generatorAddress: 'lsk6q3eq5qnahyytpywoxkgarzh8gck396wmd3yeu',
			burntAmount: '1010618000',
			generatorAmount: '489382000',
		},
		index: 7,
		module: 'fee',
		name: 'generatorFeeProcessed',
		topics: [
			'76d4488029f123f8754f5f8182aba8574638ba3ac40a5d4d03c7ff7d2aa31472',
			'lskz23xokaxhmmkpbzdjt5agcq59qkby7bne2hwpk',
			'lsk6q3eq5qnahyytpywoxkgarzh8gck396wmd3yeu',
		],
		height: 8,
		id: 'af42f48aa740a45ab3354d2a0aba271642d7c545dfa3205eee5a59a94af93474',
	},
	{
		data: {
			success: true,
		},
		index: 8,
		module: 'interoperability',
		name: 'commandExecutionResult',
		topics: [
			'76d4488029f123f8754f5f8182aba8574638ba3ac40a5d4d03c7ff7d2aa31472',
		],
		height: 8,
		id: '6296d435e43aaa2568b9cd6ae17098790053ffce78e7699e179d5c1295c1685b',
	},
	{
		data: {
			amount: '0',
			reduction: 0,
		},
		index: 9,
		module: 'dynamicReward',
		name: 'rewardMinted',
		topics: [
			'03',
			'lsk6q3eq5qnahyytpywoxkgarzh8gck396wmd3yeu',
		],
		height: 8,
		id: '4fe3de569aa98e98a7fb42435e4a8c053b2ef79ed120f0be332b6718a26f8e26',
	},
];

module.exports = {
	validTx,
	eventsForValidTx,
	eventsWithFailStatus,
	eventsIncludingTokenModule,
};

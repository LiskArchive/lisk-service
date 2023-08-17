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

const mockTransactionsDryRunResultFromNode = {
	result: 1,
	events: [
		{
			data: '0a14fc18da54f6ce01bf31195548460361dfdb83c20512036665651a0804000000000000002080c2d72f2800',
			index: 0,
			module: 'token',
			name: 'lock',
			topics: [
				'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
				'fc18da54f6ce01bf31195548460361dfdb83c205',
			],
			height: 29137,
		},
		{
			data: '0a14fc18da54f6ce01bf31195548460361dfdb83c2051214ea4169a909ef00fc3b29bb0bcf29f456753c922e1a0804000000000000002080c0caf384a3022800',
			index: 1,
			module: 'token',
			name: 'transfer',
			topics: [
				'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
				'fc18da54f6ce01bf31195548460361dfdb83c205',
				'ea4169a909ef00fc3b29bb0bcf29f456753c922e',
			],
			height: 29137,
		},
		{
			data: '0a14fc18da54f6ce01bf31195548460361dfdb83c20512036665651a0804000000000000002080c2d72f2800',
			index: 2,
			module: 'token',
			name: 'unlock',
			topics: [
				'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
				'fc18da54f6ce01bf31195548460361dfdb83c205',
			],
			height: 29137,
		},
		{
			data: '0a14fc18da54f6ce01bf31195548460361dfdb83c2051214fc18da54f6ce01bf31195548460361dfdb83c2051a0804000000000000002090a5d12f2800',
			index: 3,
			module: 'token',
			name: 'transfer',
			topics: [
				'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
				'fc18da54f6ce01bf31195548460361dfdb83c205',
				'fc18da54f6ce01bf31195548460361dfdb83c205',
			],
			height: 29137,
		},
		{
			data: '0a14fc18da54f6ce01bf31195548460361dfdb83c2051208040000000000000018f09c062000',
			index: 4,
			module: 'token',
			name: 'burn',
			topics: [
				'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
				'fc18da54f6ce01bf31195548460361dfdb83c205',
			],
			height: 29137,
		},
		{
			data: '0a14fc18da54f6ce01bf31195548460361dfdb83c2051214fc18da54f6ce01bf31195548460361dfdb83c20518f09c062090a5d12f',
			index: 5,
			module: 'fee',
			name: 'generatorFeeProcessed',
			topics: [
				'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
				'fc18da54f6ce01bf31195548460361dfdb83c205',
				'fc18da54f6ce01bf31195548460361dfdb83c205',
			],
			height: 29137,
		},
		{
			data: '0801',
			index: 6,
			module: 'token',
			name: 'commandExecutionResult',
			topics: [
				'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
			],
			height: 29137,
		},
	],
};

const mockTransactionsDryRunResult = {
	data: {
		result: 1,
		events: [
			{
				data: '0a14fc18da54f6ce01bf31195548460361dfdb83c20512036665651a0804000000000000002080c2d72f2800',
				index: 0,
				module: 'token',
				name: 'lock',
				topics: [
					'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
					'fc18da54f6ce01bf31195548460361dfdb83c205',
				],
				height: 29137,
			},
			{
				data: '0a14fc18da54f6ce01bf31195548460361dfdb83c2051214ea4169a909ef00fc3b29bb0bcf29f456753c922e1a0804000000000000002080c0caf384a3022800',
				index: 1,
				module: 'token',
				name: 'transfer',
				topics: [
					'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
					'fc18da54f6ce01bf31195548460361dfdb83c205',
					'ea4169a909ef00fc3b29bb0bcf29f456753c922e',
				],
				height: 29137,
			},
			{
				data: '0a14fc18da54f6ce01bf31195548460361dfdb83c20512036665651a0804000000000000002080c2d72f2800',
				index: 2,
				module: 'token',
				name: 'unlock',
				topics: [
					'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
					'fc18da54f6ce01bf31195548460361dfdb83c205',
				],
				height: 29137,
			},
			{
				data: '0a14fc18da54f6ce01bf31195548460361dfdb83c2051214fc18da54f6ce01bf31195548460361dfdb83c2051a0804000000000000002090a5d12f2800',
				index: 3,
				module: 'token',
				name: 'transfer',
				topics: [
					'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
					'fc18da54f6ce01bf31195548460361dfdb83c205',
					'fc18da54f6ce01bf31195548460361dfdb83c205',
				],
				height: 29137,
			},
			{
				data: '0a14fc18da54f6ce01bf31195548460361dfdb83c2051208040000000000000018f09c062000',
				index: 4,
				module: 'token',
				name: 'burn',
				topics: [
					'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
					'fc18da54f6ce01bf31195548460361dfdb83c205',
				],
				height: 29137,
			},
			{
				data: '0a14fc18da54f6ce01bf31195548460361dfdb83c2051214fc18da54f6ce01bf31195548460361dfdb83c20518f09c062090a5d12f',
				index: 5,
				module: 'fee',
				name: 'generatorFeeProcessed',
				topics: [
					'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
					'fc18da54f6ce01bf31195548460361dfdb83c205',
					'fc18da54f6ce01bf31195548460361dfdb83c205',
				],
				height: 29137,
			},
			{
				data: '0801',
				index: 6,
				module: 'token',
				name: 'commandExecutionResult',
				topics: [
					'2809da07c2a2af95cef96d5853ad6df61c797c88b1912a538ab2a290a413b31d',
				],
				height: 29137,
			},
		],
		status: 'valid',
	},
	meta: {},
};

module.exports = {
	mockTransactionsDryRunResultFromNode,
	mockTransactionsDryRunResult,
};

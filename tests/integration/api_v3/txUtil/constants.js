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

const privateKey =
	'e655ee58490c66dee3f6761f3b69fdcb65def01615efcddde09c791d6fc2a5223972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c';
const publicKey = '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c';
const address = 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad';
const schemas = {
	block: {
		$id: '/block',
		type: 'object',
		properties: {
			header: { dataType: 'bytes', fieldNumber: 1 },
			transactions: { type: 'array', items: { dataType: 'bytes' }, fieldNumber: 2 },
			assets: { type: 'array', items: { dataType: 'bytes' }, fieldNumber: 3 },
		},
		required: ['header', 'transactions', 'assets'],
	},
	header: {
		$id: '/block/header/3/without-id',
		type: 'object',
		properties: {
			version: { dataType: 'uint32', fieldNumber: 1 },
			timestamp: { dataType: 'uint32', fieldNumber: 2 },
			height: { dataType: 'uint32', fieldNumber: 3 },
			previousBlockID: { dataType: 'bytes', fieldNumber: 4 },
			generatorAddress: { dataType: 'bytes', fieldNumber: 5, format: 'lisk32' },
			transactionRoot: { dataType: 'bytes', fieldNumber: 6 },
			assetRoot: { dataType: 'bytes', fieldNumber: 7 },
			eventRoot: { dataType: 'bytes', fieldNumber: 8 },
			stateRoot: { dataType: 'bytes', fieldNumber: 9 },
			maxHeightPrevoted: { dataType: 'uint32', fieldNumber: 10 },
			maxHeightGenerated: { dataType: 'uint32', fieldNumber: 11 },
			impliesMaxPrevotes: { dataType: 'boolean', fieldNumber: 12 },
			validatorsHash: { dataType: 'bytes', fieldNumber: 13 },
			aggregateCommit: {
				type: 'object',
				fieldNumber: 14,
				required: ['height', 'aggregationBits', 'certificateSignature'],
				properties: {
					height: { dataType: 'uint32', fieldNumber: 1 },
					aggregationBits: { dataType: 'bytes', fieldNumber: 2 },
					certificateSignature: { dataType: 'bytes', fieldNumber: 3 },
				},
			},
			signature: { dataType: 'bytes', fieldNumber: 15 },
		},
		required: [
			'version',
			'timestamp',
			'height',
			'previousBlockID',
			'generatorAddress',
			'transactionRoot',
			'assetRoot',
			'eventRoot',
			'stateRoot',
			'maxHeightPrevoted',
			'maxHeightGenerated',
			'impliesMaxPrevotes',
			'validatorsHash',
			'aggregateCommit',
			'signature',
		],
	},
	asset: {
		$id: '/block/asset/3',
		type: 'object',
		required: ['module', 'data'],
		properties: {
			module: { dataType: 'string', fieldNumber: 1 },
			data: { dataType: 'bytes', fieldNumber: 2 },
		},
	},
	transaction: {
		$id: '/lisk/transaction',
		type: 'object',
		required: ['module', 'command', 'nonce', 'fee', 'senderPublicKey', 'params'],
		properties: {
			module: { dataType: 'string', fieldNumber: 1, minLength: 1, maxLength: 32 },
			command: { dataType: 'string', fieldNumber: 2, minLength: 1, maxLength: 32 },
			nonce: { dataType: 'uint64', fieldNumber: 3 },
			fee: { dataType: 'uint64', fieldNumber: 4 },
			senderPublicKey: { dataType: 'bytes', fieldNumber: 5, minLength: 32, maxLength: 32 },
			params: { dataType: 'bytes', fieldNumber: 6 },
			signatures: { type: 'array', items: { dataType: 'bytes' }, fieldNumber: 7 },
		},
	},
	event: {
		$id: '/block/event',
		type: 'object',
		required: ['module', 'name', 'data', 'topics', 'height', 'index'],
		properties: {
			module: { dataType: 'string', minLength: 1, maxLength: 32, fieldNumber: 1 },
			name: { dataType: 'string', minLength: 1, maxLength: 32, fieldNumber: 2 },
			data: { dataType: 'bytes', fieldNumber: 3 },
			topics: { type: 'array', fieldNumber: 4, maxItems: 4, items: { dataType: 'bytes' } },
			height: { dataType: 'uint32', fieldNumber: 5 },
			index: { dataType: 'uint32', fieldNumber: 6, maximum: 1073741823 },
		},
	},
	standardEvent: {
		$id: '/block/event/standard',
		type: 'object',
		required: ['success'],
		properties: { success: { dataType: 'boolean', fieldNumber: 1 } },
	},
	ccm: {
		$id: '/modules/interoperability/ccm',
		type: 'object',
		required: [
			'module',
			'crossChainCommand',
			'nonce',
			'fee',
			'sendingChainID',
			'receivingChainID',
			'params',
			'status',
		],
		properties: {
			module: { dataType: 'string', minLength: 1, maxLength: 32, fieldNumber: 1 },
			crossChainCommand: { dataType: 'string', minLength: 1, maxLength: 32, fieldNumber: 2 },
			nonce: { dataType: 'uint64', fieldNumber: 3 },
			fee: { dataType: 'uint64', fieldNumber: 4 },
			sendingChainID: { dataType: 'bytes', minLength: 4, maxLength: 4, fieldNumber: 5 },
			receivingChainID: { dataType: 'bytes', minLength: 4, maxLength: 4, fieldNumber: 6 },
			params: { dataType: 'bytes', fieldNumber: 7 },
			status: { dataType: 'uint32', fieldNumber: 8 },
		},
	},
};

const tokenTransferParamsSchema = {
	$id: '/test/lisk/transferCommand',
	title: 'Transfer transaction command',
	type: 'object',
	required: ['tokenID', 'amount', 'recipientAddress', 'data'],
	properties: {
		tokenID: {
			dataType: 'bytes',
			fieldNumber: 1,
		},
		amount: {
			dataType: 'uint64',
			fieldNumber: 2,
		},
		recipientAddress: {
			dataType: 'bytes',
			fieldNumber: 3,
			format: 'lisk32',
		},
		data: {
			dataType: 'string',
			fieldNumber: 4,
			minLength: 0,
			maxLength: 64,
		},
	},
};

module.exports = {
	address,
	privateKey,
	publicKey,
	tokenTransferParamsSchema,
	schemas,
};

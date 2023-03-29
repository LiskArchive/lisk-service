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
const blockSchema = {
	$id: '/block',
	type: 'object',
	properties: {
		header: {
			dataType: 'bytes',
			fieldNumber: 1,
		},
		transactions: {
			type: 'array',
			items: {
				dataType: 'bytes',
			},
			fieldNumber: 2,
		},
		assets: {
			type: 'array',
			items: {
				dataType: 'bytes',
			},
			fieldNumber: 3,
		},
	},
	required: [
		'header',
		'transactions',
		'assets',
	],
};

const headerSchema = {
	$id: '/block/header/3',
	type: 'object',
	properties: {
		version: {
			dataType: 'uint32',
			fieldNumber: 1,
		},
		timestamp: {
			dataType: 'uint32',
			fieldNumber: 2,
		},
		height: {
			dataType: 'uint32',
			fieldNumber: 3,
		},
		previousBlockID: {
			dataType: 'bytes',
			fieldNumber: 4,
		},
		generatorAddress: {
			dataType: 'bytes',
			fieldNumber: 5,
			format: 'lisk32',
		},
		transactionRoot: {
			dataType: 'bytes',
			fieldNumber: 6,
		},
		assetRoot: {
			dataType: 'bytes',
			fieldNumber: 7,
		},
		eventRoot: {
			dataType: 'bytes',
			fieldNumber: 8,
		},
		stateRoot: {
			dataType: 'bytes',
			fieldNumber: 9,
		},
		maxHeightPrevoted: {
			dataType: 'uint32',
			fieldNumber: 10,
		},
		maxHeightGenerated: {
			dataType: 'uint32',
			fieldNumber: 11,
		},
		impliesMaxPrevotes: {
			dataType: 'boolean',
			fieldNumber: 12,
		},
		validatorsHash: {
			dataType: 'bytes',
			fieldNumber: 13,
		},
		aggregateCommit: {
			type: 'object',
			fieldNumber: 14,
			required: [
				'height',
				'aggregationBits',
				'certificateSignature',
			],
			properties: {
				height: {
					dataType: 'uint32',
					fieldNumber: 1,
				},
				aggregationBits: {
					dataType: 'bytes',
					fieldNumber: 2,
				},
				certificateSignature: {
					dataType: 'bytes',
					fieldNumber: 3,
				},
			},
		},
		signature: {
			dataType: 'bytes',
			fieldNumber: 15,
		},
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
};

const assetSchema = {
	$id: '/block/asset/3',
	type: 'object',
	required: [
		'module',
		'data',
	],
	properties: {
		module: {
			dataType: 'string',
			fieldNumber: 1,
		},
		data: {
			dataType: 'bytes',
			fieldNumber: 2,
		},
	},
};

const transactionSchema = {
	$id: '/lisk/transaction',
	type: 'object',
	required: [
		'module',
		'command',
		'nonce',
		'fee',
		'senderPublicKey',
		'params',
	],
	properties: {
		module: {
			dataType: 'string',
			fieldNumber: 1,
			minLength: 1,
			maxLength: 32,
		},
		command: {
			dataType: 'string',
			fieldNumber: 2,
			minLength: 1,
			maxLength: 32,
		},
		nonce: {
			dataType: 'uint64',
			fieldNumber: 3,
		},
		fee: {
			dataType: 'uint64',
			fieldNumber: 4,
		},
		senderPublicKey: {
			dataType: 'bytes',
			fieldNumber: 5,
			minLength: 32,
			maxLength: 32,
		},
		params: {
			dataType: 'bytes',
			fieldNumber: 6,
		},
		signatures: {
			type: 'array',
			items: {
				dataType: 'bytes',
			},
			fieldNumber: 7,
		},
	},
};

const eventSchema = {
	$id: '/block/event',
	type: 'object',
	required: [
		'module',
		'name',
		'data',
		'topics',
		'height',
		'index',
	],
	properties: {
		module: {
			dataType: 'string',
			minLength: 1,
			maxLength: 32,
			fieldNumber: 1,
		},
		name: {
			dataType: 'string',
			minLength: 1,
			maxLength: 32,
			fieldNumber: 2,
		},
		data: {
			dataType: 'bytes',
			fieldNumber: 3,
		},
		topics: {
			type: 'array',
			fieldNumber: 4,
			items: {
				dataType: 'bytes',
			},
		},
		height: {
			dataType: 'uint32',
			fieldNumber: 5,
		},
		index: {
			dataType: 'uint32',
			fieldNumber: 6,
		},
	},
};

const standardEventSchema = {
	$id: '/block/event/standard',
	type: 'object',
	required: [
		'success',
	],
	properties: {
		success: {
			dataType: 'boolean',
			fieldNumber: 1,
		},
	},
};

const messageSchema = {
	$id: '/auth/command/regMultisigMsg',
	type: 'object',
	required: [
		'address',
		'nonce',
		'numberOfSignatures',
		'mandatoryKeys',
		'optionalKeys',
	],
	properties: {
		address: {
			dataType: 'bytes',
			fieldNumber: 1,
			minLength: 20,
			maxLength: 20,
		},
		nonce: {
			dataType: 'uint64',
			fieldNumber: 2,
		},
		numberOfSignatures: {
			dataType: 'uint32',
			fieldNumber: 3,
		},
		mandatoryKeys: {
			type: 'array',
			items: {
				dataType: 'bytes',
				minLength: 32,
				maxLength: 32,
			},
			fieldNumber: 4,
		},
		optionalKeys: {
			type: 'array',
			items: {
				dataType: 'bytes',
				minLength: 32,
				maxLength: 32,
			},
			fieldNumber: 5,
		},
	},
};

module.exports = {
	blockSchema,
	headerSchema,
	assetSchema,
	transactionSchema,
	eventSchema,
	standardEventSchema,
	messageSchema,
};

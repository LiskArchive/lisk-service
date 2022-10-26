const Joi = require('joi');

const blockSchema = {
	schema: {
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
		required: Joi.array().items(Joi.string().valid(
			'header',
			'transactions',
			'assets').required()).required(),
	},
};

const headerSchema = {
	schema: {
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
			validatorsHash: {
				dataType: 'bytes',
				fieldNumber: 12,
			},
			aggregateCommit: {
				type: 'object',
				fieldNumber: 13,
				required: Joi.array().items(
					Joi.string().valid(
						'height',
						'aggregationBits',
						'certificateSignature')
						.required())
					.required(),
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
				fieldNumber: 14,
			},
		},
		required: Joi.array().items(
			Joi.string().valid(
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
				'validatorsHash',
				'aggregateCommit',
				'signature')
				.required())
			.required(),
	},
};

const assetSchema = {
	schema: {
		$id: '/block/asset/3',
		type: 'object',
		required: Joi.array().items(
			Joi.string().valid(
				'module',
				'data')
				.required())
			.required(),
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
	},
};

const transactionSchema = {
	schema: {
		$id: '/lisk/transaction',
		type: 'object',
		required: Joi.array().items(
			Joi.string().valid(
				'module',
				'command',
				'nonce',
				'fee',
				'senderPublicKey',
				'params')
				.required())
			.required(),
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
	},
};

const eventSchema = {
	schema: {
		$id: '/block/event',
		type: 'object',
		required: Joi.array().items(
			Joi.string().valid(
				'module',
				'name',
				'data',
				'topics',
				'height',
				'index')
				.required())
			.required(),
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
	},
};

module.exports = {
	blockSchema,
	headerSchema,
	assetSchema,
	transactionSchema,
	eventSchema,
};

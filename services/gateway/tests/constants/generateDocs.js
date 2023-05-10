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
const createApiDocsExpectedResponse = {
	'/blocks/assets': {
		get: {
			tags: [
				'Blocks',
			],
			summary: 'Requests block assets data.',
			description: 'Returns block assets data. Assets are always returned empty for the genesis height.\n RPC => get.blocks.assets',
			parameters: [
				{
					$ref: '#/parameters/blockID',
				},
				{
					$ref: '#/parameters/height',
				},
				{
					$ref: '#/parameters/timestamp',
				},
				{
					$ref: '#/parameters/module',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
				{
					name: 'sort',
					in: 'query',
					description: 'Fields to sort results by.',
					required: false,
					type: 'string',
					enum: [
						'height:asc',
						'height:desc',
						'timestamp:asc',
						'timestamp:desc',
					],
					default: 'height:desc',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of block assets.',
					schema: {
						$ref: '#/definitions/BlocksAssetsWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/blockchain/apps': {
		get: {
			tags: [
				'Interoperability',
			],
			summary: 'Requests list of blockchain applications',
			description: 'Returns a list of blockchain applications\n RPC => get.blockchain.apps',
			parameters: [
				{
					$ref: '#/parameters/chainIDCSV',
				},
				{
					$ref: '#/parameters/name',
				},
				{
					$ref: '#/parameters/blockchainAppStatus',
				},
				{
					$ref: '#/parameters/blockchainAppSearch',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of blockchain applications in the Lisk ecosystem',
					schema: {
						$ref: '#/definitions/BlockchainAppsWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/blockchain/apps/meta/list': {
		get: {
			tags: [
				'Application Off-Chain Metadata',
			],
			summary: 'Requests list of blockchain applications for which the off-chain metadata is available',
			description: 'Returns a list of blockchain applications for which the off-chain metadata is available\n RPC => get.blockchain.apps.meta.list',
			parameters: [
				{
					$ref: '#/parameters/chainName',
				},
				{
					$ref: '#/parameters/network',
				},
				{
					$ref: '#/parameters/search',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
				{
					name: 'sort',
					in: 'query',
					description: 'Fields to sort results by.',
					required: false,
					type: 'string',
					enum: [
						'chainName:asc',
						'chainName:desc',
					],
					default: 'chainName:asc',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of blockchain applications for which the off-chain metadata is available',
					schema: {
						$ref: '#/definitions/BlockchainAppsMetaListWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/blockchain/apps/meta': {
		get: {
			tags: [
				'Application Off-Chain Metadata',
			],
			summary: 'Requests blockchain applications off-chain metadata',
			description: 'Returns a list of blockchain applications off-chain metadata\n RPC => get.blockchain.apps.meta',
			parameters: [
				{
					$ref: '#/parameters/chainName',
				},
				{
					$ref: '#/parameters/chainIDCSV',
				},
				{
					$ref: '#/parameters/isDefault',
				},
				{
					$ref: '#/parameters/network',
				},
				{
					$ref: '#/parameters/search',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
				{
					name: 'sort',
					in: 'query',
					description: 'Fields to sort results by.',
					required: false,
					type: 'string',
					enum: [
						'chainName:asc',
						'chainName:desc',
						'chainID:asc',
						'chainID:desc',
					],
					default: 'chainName:asc',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of blockchain applications off-chain metadata',
					schema: {
						$ref: '#/definitions/BlockchainAppsMetadataWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/blockchain/apps/statistics': {
		get: {
			tags: [
				'Interoperability',
			],
			summary: 'Requests blockchain application statistics',
			description: 'Returns blockchain applications statistics\n RPC => get.blockchain.apps.statistics',
			responses: {
				200: {
					description: 'Returns statistics for the blockchain applications in the Lisk ecosystem',
					schema: {
						$ref: '#/definitions/blockchainAppsStatsEnvelope',
					},
				},
			},
		},
	},
	'/blockchain/apps/meta/tokens': {
		get: {
			tags: [
				'Application Off-Chain Metadata',
			],
			summary: 'Requests blockchain applications off-chain metadata for tokens',
			description: 'Returns blockchain applications off-chain metadata for tokens\n RPC => get.blockchain.apps.meta.tokens',
			parameters: [
				{
					$ref: '#/parameters/chainName',
				},
				{
					$ref: '#/parameters/chainID',
				},
				{
					$ref: '#/parameters/tokenName',
				},
				{
					$ref: '#/parameters/tokenIDCSV',
				},
				{
					$ref: '#/parameters/network',
				},
				{
					$ref: '#/parameters/search',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
				{
					name: 'sort',
					in: 'query',
					description: 'Fields to sort results by.',
					required: false,
					type: 'string',
					enum: [
						'chainName:asc',
						'chainName:desc',
					],
					default: 'chainName:asc',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of blockchain applications off-chain metadata for tokens',
					schema: {
						$ref: '#/definitions/BlockchainAppsTokenMetadataWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/blockchain/apps/meta/tokens/supported': {
		get: {
			tags: [
				'Application Off-Chain Metadata',
			],
			summary: 'Requests blockchain applications off-chain metadata for tokens supported on the specified chainID.',
			description: 'Returns blockchain applications off-chain metadata for tokens supported on the specified chainID.\n RPC => get.blockchain.apps.meta.tokens.supported',
			parameters: [
				{
					$ref: '#/parameters/chainID',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
				{
					name: 'sort',
					in: 'query',
					description: 'Fields to sort results by.',
					required: false,
					type: 'string',
					enum: [
						'tokenID:asc',
						'tokenID:desc',
					],
					default: 'tokenID:asc',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of blockchain applications off-chain metadata for tokens supported on the specified chainID.',
					schema: {
						$ref: '#/definitions/BlockchainAppsTokenMetadataWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/blocks': {
		get: {
			tags: [
				'Blocks',
			],
			summary: 'Requests blocks data',
			description: 'Returns block data\n RPC => get.blocks',
			parameters: [
				{
					$ref: '#/parameters/blockID',
				},
				{
					$ref: '#/parameters/height',
				},
				{
					$ref: '#/parameters/timestamp',
				},
				{
					$ref: '#/parameters/generatorAddress',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
				{
					name: 'sort',
					in: 'query',
					description: 'Fields to sort results by.',
					required: false,
					type: 'string',
					enum: [
						'height:asc',
						'height:desc',
						'timestamp:asc',
						'timestamp:desc',
					],
					default: 'height:desc',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of blocks',
					schema: {
						$ref: '#/definitions/BlocksWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/events': {
		get: {
			tags: [
				'Events',
			],
			summary: 'Requests events data',
			description: 'Returns events data\n RPC => get.events',
			parameters: [
				{
					$ref: '#/parameters/transactionID',
				},
				{
					$ref: '#/parameters/senderAddress',
				},
				{
					$ref: '#/parameters/topic',
				},
				{
					$ref: '#/parameters/blockID',
				},
				{
					$ref: '#/parameters/height',
				},
				{
					$ref: '#/parameters/timestamp',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
				{
					name: 'sort',
					in: 'query',
					description: 'Fields to sort results by.',
					required: false,
					type: 'string',
					enum: [
						'height:asc',
						'height:desc',
						'timestamp:asc',
						'timestamp:desc',
					],
					default: 'timestamp:desc',
				},
				{
					name: 'order',
					in: 'query',
					description: 'Fields to order results by. The order condition is applied after the sort condition, usually to break ties when the sort condition results in collision.',
					required: false,
					type: 'string',
					enum: [
						'index:asc',
						'index:desc',
					],
					default: 'index:asc',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of events',
					schema: {
						$ref: '#/definitions/eventsWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/fees': {
		get: {
			tags: [
				'Fee',
			],
			summary: 'Requests fee estimates',
			description: 'Returns fee estimates\n RPC => get.fees',
			responses: {
				200: {
					description: 'Returns the fee estimate per byte used for transaction fee calculation',
					schema: {
						$ref: '#/definitions/FeeEstimateEnvelope',
					},
				},
			},
		},
	},
	'/generators': {
		get: {
			tags: [
				'Generators',
			],
			summary: 'Requests generators list',
			description: 'Returns generators list\n RPC => get.generators',
			parameters: [
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of generators',
					schema: {
						$ref: '#/definitions/generatorsWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/index/status': {
		get: {
			tags: [
				'Index Status',
			],
			summary: 'Requests current indexing status.',
			description: 'Returns current indexing status.\n RPC => get.index.status',
			responses: {
				200: {
					description: 'Returns the current index status information.',
					schema: {
						$ref: '#/definitions/IndexStatus',
					},
				},
			},
		},
	},
	'/invoke': {
		post: {
			tags: [
				'Proxy',
			],
			summary: 'Proxy request to directly invoke application endpoint',
			description: 'Returns endpoint response from the blockchain application in its original form.\n RPC => post.invoke',
			parameters: [
				{
					$ref: '#/parameters/invokeParams',
				},
			],
			responses: {
				200: {
					description: 'Returns endpoint response from the blockchain application in its original form.',
					schema: {
						$ref: '#/definitions/invokeWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/market/prices': {
		get: {
			tags: [
				'Market',
			],
			parameters: [

			],
			summary: 'Requests market prices',
			description: 'Returns market prices\n RPC => get.market.prices',
			responses: {
				200: {
					description: 'Returns a list of market prices by currency pairs',
					schema: {
						$ref: '#/definitions/MarketPricesWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/network/peers': {
		get: {
			tags: [
				'Network',
			],
			summary: 'Requests peers data',
			description: 'Returns peers data\n RPC => get.network.peers',
			parameters: [
				{
					$ref: '#/parameters/ip',
				},
				{
					$ref: '#/parameters/networkVersion',
				},
				{
					$ref: '#/parameters/state',
				},
				{
					$ref: '#/parameters/height',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
				{
					name: 'sort',
					in: 'query',
					description: 'Fields to sort results by.',
					required: false,
					type: 'string',
					enum: [
						'height:asc',
						'height:desc',
						'networkVersion:asc',
						'networkVersion:desc',
					],
					default: 'height:desc',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of peer nodes in the network',
					schema: {
						$ref: '#/definitions/PeersWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/network/statistics': {
		get: {
			tags: [
				'Network',
			],
			summary: 'Requests network statistics',
			description: 'Returns network statistics data\n RPC => get.network.statistics',
			responses: {
				200: {
					description: 'Returns the network statistics information',
					schema: {
						$ref: '#/definitions/NetworkStatistics',
					},
				},
			},
		},
	},
	'/network/status': {
		get: {
			tags: [
				'Network',
			],
			summary: 'Requests network status',
			description: 'Returns network status\n RPC => get.network.status',
			responses: {
				200: {
					description: 'Returns the network status information',
					schema: {
						$ref: '#/definitions/NetworkStatus',
					},
				},
			},
		},
	},
	'/transactions': {
		get: {
			tags: [
				'Transactions',
			],
			summary: 'Requests transactions data',
			description: 'Returns transactions data\n RPC => get.transactions',
			parameters: [
				{
					$ref: '#/parameters/transactionID',
				},
				{
					$ref: '#/parameters/moduleCommand',
				},
				{
					$ref: '#/parameters/senderAddress',
				},
				{
					$ref: '#/parameters/address',
				},
				{
					$ref: '#/parameters/recipientAddress',
				},
				{
					$ref: '#/parameters/blockID',
				},
				{
					$ref: '#/parameters/height',
				},
				{
					$ref: '#/parameters/timestamp',
				},
				{
					$ref: '#/parameters/executionStatus',
				},
				{
					$ref: '#/parameters/nonce',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
				{
					name: 'sort',
					in: 'query',
					description: 'Fields to sort results by.',
					required: false,
					type: 'string',
					enum: [
						'height:asc',
						'height:desc',
						'timestamp:asc',
						'timestamp:desc',
					],
					default: 'timestamp:desc',
				},
				{
					name: 'order',
					in: 'query',
					description: 'Fields to order results by. The order condition is applied after the sort condition, usually to break ties when the sort condition results in collision.',
					required: false,
					type: 'string',
					enum: [
						'index:asc',
						'index:desc',
					],
					default: 'index:asc',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of transactions',
					schema: {
						$ref: '#/definitions/TransactionsWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
		post: {
			tags: [
				'Transactions',
			],
			summary: 'Post transactions',
			description: 'Post transactions and return transactionID\n RPC => post.transactions',
			parameters: [
				{
					$ref: '#/parameters/transaction',
				},
			],
			responses: {
				200: {
					description: 'Broadcast transaction',
					schema: {
						$ref: '#/definitions/postTransactionWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequestEnvelope',
					},
				},
				500: {
					description: 'Internal server error',
					schema: {
						$ref: '#/definitions/serverErrorEnvelope',
					},
				},
			},
		},
	},
	'/transactions/estimate-fees': {
		post: {
			description: 'Returns estimated fees for the transaction.\n RPC => post.transactions.estimate-fees',
			parameters: [
				{
					$ref: '#/parameters/transactionEstimateFees',
				},
			],
			responses: {
				200: {
					description: 'Returns estimated fees for the given transaction.',
					schema: {
						$ref: '#/definitions/txEstimateFeesWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
				500: {
					description: 'Internal server error',
					schema: {
						$ref: '#/definitions/serverErrorEnvelope',
					},
				},
			},
			summary: 'Requests estimated fees for the transaction.',
			tags: [
				'Transactions',
			],
		},
	},
	'/schemas': {
		get: {
			tags: [
				'Schemas',
			],
			summary: 'Requests schemas.',
			description: 'Returns schemas.\n RPC => get.schemas',
			responses: {
				200: {
					description: 'Returns a list of schemas.',
					schema: {
						$ref: '#/definitions/SchemaWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/transactions/dryrun': {
		post: {
			tags: [
				'Transactions',
			],
			summary: 'Dry run transactions.',
			description: 'Dry run transactions.\n RPC => post.transactions.dryrun',
			parameters: [
				{
					$ref: '#/parameters/dryrunTransaction',
				},
			],
			responses: {
				200: {
					description: "Dry run transactions. 'errorMessage' is available only when 'result: -1'.",
					schema: {
						$ref: '#/definitions/dryTransactionWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
				500: {
					description: 'Internal server error',
					schema: {
						$ref: '#/definitions/serverErrorEnvelope',
					},
				},
			},
		},
	},
	'/transactions/statistics': {
		get: {
			tags: [
				'Transactions',
			],
			summary: 'Requests transaction statistics',
			description: 'Returns transaction statistics\n RPC => get.transactions.statistics',
			parameters: [
				{
					name: 'interval',
					in: 'query',
					description: 'interval to query statistics',
					required: true,
					type: 'string',
					enum: [
						'day',
						'month',
					],
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of transactions statistics by date or month',
					schema: {
						$ref: '#/definitions/TransactionsStatisticsWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
				503: {
					description: 'Service Unavailable',
					schema: {
						$ref: '#/definitions/serviceUnavailable',
					},
				},
			},
		},
	},
	'/auth': {
		get: {
			tags: [
				'Auth',
			],
			summary: 'Requests auth details by address',
			description: 'Returns auth details by address\n RPC => get.auth',
			parameters: [
				{
					$ref: '#/parameters/address',
				},
			],
			responses: {
				200: {
					description: 'Auth details',
					schema: {
						$ref: '#/definitions/authWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/validator': {
		get: {
			tags: [
				'Validator',
			],
			summary: 'Requests validator information',
			description: 'Returns validator information\n RPC => get.validator',
			parameters: [
				{
					$ref: '#/parameters/address',
				},
			],
			responses: {
				200: {
					description: 'Returns validator information by address',
					schema: {
						$ref: '#/definitions/validatorWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/validator/validate-bls-key': {
		post: {
			tags: [
				'Validator',
			],
			summary: 'Validates a BLS key against its corresponding Proof of Possession.',
			description: 'Validates a BLS key against its corresponding Proof of Possession.\n RPC => post.validator.validate-bls-key',
			parameters: [
				{
					$ref: '#/parameters/validateBLSKeyParams',
				},
			],
			responses: {
				200: {
					description: 'Returns a boolean representing the validity of the supplied BLS key and Proof of Possession.',
					schema: {
						$ref: '#/definitions/blsKeyValidationWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/token/account/exists': {
		get: {
			tags: [
				'Token',
			],
			summary: 'Requests to check existence of an account for the specified token.',
			description: 'Returns existence of an account for the specified token.\n RPC => get.token.account.exists',
			parameters: [
				{
					$ref: '#/parameters/address',
				},
				{
					$ref: '#/parameters/publicKey',
				},
				{
					$ref: '#/parameters/accountName',
				},
				{
					$ref: '#/parameters/tokenID',
				},
			],
			responses: {
				200: {
					description: 'Returns existence of an account for the specified token.',
					schema: {
						$ref: '#/definitions/tokenAccountExistsWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/token/available-ids': {
		get: {
			tags: [
				'Token',
			],
			summary: 'Requests the list of available tokens identifiers.',
			description: 'Returns all the available token identifiers.\n RPC => get.token.available-ids',
			parameters: [
				{
					name: 'sort',
					in: 'query',
					description: 'Fields to sort results by.',
					required: false,
					type: 'string',
					enum: [
						'tokenID:desc',
						'tokenID:asc',
					],
					default: 'tokenID:asc',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
			],
			responses: {
				200: {
					description: 'Returns all the available token identifiers.',
					schema: {
						$ref: '#/definitions/tokenAvailableIDsWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/token/balances': {
		get: {
			tags: [
				'Token',
			],
			summary: 'Requests tokens information',
			description: 'Returns tokens information\n RPC => get.token.balances',
			parameters: [
				{
					$ref: '#/parameters/address',
				},
				{
					$ref: '#/parameters/tokenID',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
			],
			responses: {
				200: {
					description: 'Returns a list of supported tokens by the blockchain application',
					schema: {
						$ref: '#/definitions/tokenWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/token/constants': {
		get: {
			tags: [
				'Token',
			],
			summary: 'Requests Token module constants.',
			description: 'Requests all the configured constants for the Token module.\n RPC => get.token.constants',
			responses: {
				200: {
					description: 'Returns all the configured constants for the Token module.',
					schema: {
						$ref: '#/definitions/tokenConstantsWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/token/summary': {
		get: {
			tags: [
				'Token',
			],
			summary: 'Requests the tokens summary for the current blockchain application.',
			description: "Returns the token summary. The 'supportedTokens' is an empty list when all the tokens are supported on the blockchain application.\n RPC => get.token.summary",
			parameters: [

			],
			responses: {
				200: {
					description: "Returns the token summary. The 'supportedTokens' is an empty list when all the tokens are supported on the blockchain application.",
					schema: {
						$ref: '#/definitions/tokenSummaryWithEnvelope',
					},
				},
				400: {
					description: 'Bad request',
					schema: {
						$ref: '#/definitions/badRequest',
					},
				},
			},
		},
	},
	'/token/balances/top': {
		get: {
			tags: [
				'Token',
			],
			summary: 'Requests the list of top accounts for the specified tokenID.',
			description: 'Returns the list of top accounts for the specified tokenID.\n RPC => get.token.balances.top',
			parameters: [
				{
					$ref: '#/parameters/tokenID',
				},
				{
					$ref: '#/parameters/limit',
				},
				{
					$ref: '#/parameters/offset',
				},
				{
					name: 'sort',
					in: 'query',
					description: 'Fields to sort results by.',
					required: false,
					type: 'string',
					enum: [
						'balance:desc',
						'balance:asc',
					],
					default: 'balance:desc',
				},
			],
			responses: {
				200: {
					description: 'Returns the list of top accounts for the specified tokenID.',
					schema: {
						$ref: '#/definitions/tokenTopBalancesWithEnvelope',
					},
				},
			},
		},
	},
};

module.exports = {
	createApiDocsExpectedResponse,
};

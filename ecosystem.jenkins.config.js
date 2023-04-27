/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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

module.exports = {
	apps: [
		{
			name: 'lisk-service-gateway',
			script: 'app.js',
			cwd: './services/gateway',
			pid_file: './pids/service_gateway.pid',
			out_file: './logs/service_gateway.log',
			error_file: './logs/service_gateway.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
			watch: false,
			kill_timeout: 10000,
			max_memory_restart: '300M',
			autorestart: true,
			env: {
				PORT: '9901',
				SERVICE_BROKER: 'redis://localhost:6379/0',
				SERVICE_GATEWAY_REDIS_VOLATILE: 'redis://localhost:6379/3',
				ENABLE_HTTP_API: 'http-status,http-version3,http-exports',
				ENABLE_WS_API: 'blockchain,rpc-v3',
				GATEWAY_DEPENDENCIES: 'indexer,connector',
				WS_RATE_LIMIT_ENABLE: 'false',
				WS_RATE_LIMIT_CONNECTIONS: 5,
				WS_RATE_LIMIT_DURATION: 1, // in seconds
				ENABLE_REQUEST_CACHING: 'true',
				JSON_RPC_STRICT_MODE: 'false',
				HTTP_RATE_LIMIT_ENABLE: 'false',
				HTTP_RATE_LIMIT_CONNECTIONS: 200,
				HTTP_RATE_LIMIT_WINDOW: 10, // in seconds
				HTTP_CACHE_CONTROL_DIRECTIVES: 'public, max-age=10',
				ENABLE_HTTP_CACHE_CONTROL: 'true',
			},
		},
		{
			name: 'lisk-service-blockchain-app-registry',
			script: 'app.js',
			cwd: './services/blockchain-app-registry',
			pid_file: './pids/service_blockchain_app_registry.pid',
			out_file: './logs/service_blockchain_app_registry.log',
			error_file: './logs/service_blockchain_app_registry.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
			watch: false,
			kill_timeout: 10000,
			max_memory_restart: '150M',
			autorestart: true,
			env: {
				// --- Remember to set the properties below
				SERVICE_BROKER: 'redis://localhost:6379/0',
				SERVICE_APP_REGISTRY_MYSQL: 'mysql://lisk:password@localhost:3306/lisk',
				ENABLE_REBUILD_INDEX_AT_INIT: 'false',
			},
		},
		{
			name: 'lisk-service-blockchain-connector',
			script: 'app.js',
			cwd: './services/blockchain-connector',
			pid_file: './pids/service_blockchain_connector.pid',
			out_file: './logs/service_blockchain_connector.log',
			error_file: './logs/service_blockchain_connector.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
			watch: false,
			kill_timeout: 10000,
			max_memory_restart: '150M',
			autorestart: true,
			env: {
				// --- Remember to set the properties below
				SERVICE_BROKER: 'redis://localhost:6379/0',
				LISK_APP_WS: 'ws://localhost:7887',
				GEOIP_JSON: 'https://geoip.lisk.com/json',
				// USE_LISK_IPC_CLIENT: 'true',
				// LISK_APP_DATA_PATH: '~/.lisk/lisk-core',
				ENABLE_TESTING_MODE: 'true',
			},
		},
		{
			name: 'lisk-service-blockchain-indexer',
			script: 'app.js',
			cwd: './services/blockchain-indexer',
			pid_file: './pids/service_blockchain_indexer.pid',
			out_file: './logs/service_blockchain_indexer.log',
			error_file: './logs/service_blockchain_indexer.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
			watch: false,
			kill_timeout: 10000,
			max_memory_restart: '500M',
			autorestart: true,
			env: {
				// --- Remember to set the properties below
				SERVICE_BROKER: 'redis://localhost:6379/0',
				SERVICE_INDEXER_CACHE_REDIS: 'redis://localhost:6379/1',
				SERVICE_INDEXER_REDIS_VOLATILE: 'redis://localhost:6379/2',
				SERVICE_MESSAGE_QUEUE_REDIS: 'redis://localhost:6379/3',
				SERVICE_INDEXER_MYSQL: 'mysql://lisk:password@localhost:3306/lisk',
				ENABLE_DATA_RETRIEVAL_MODE: 'true',
				ENABLE_INDEXING_MODE: 'true',
				ENABLE_PERSIST_EVENTS: 'false',
			},
		},
		{
			name: 'lisk-service-blockchain-coordinator',
			script: 'app.js',
			cwd: './services/blockchain-coordinator',
			pid_file: './pids/service_blockchain_coordinator.pid',
			out_file: './logs/service_blockchain_coordinator.log',
			error_file: './logs/service_blockchain_coordinator.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
			watch: false,
			kill_timeout: 10000,
			max_memory_restart: '300M',
			autorestart: true,
			env: {
				// --- Remember to set the properties below
				SERVICE_BROKER: 'redis://localhost:6379/0',
				SERVICE_MESSAGE_QUEUE_REDIS: 'redis://localhost:6379/3',
			},
		},
		{
			name: 'lisk-service-fee-estimator',
			script: 'app.js',
			cwd: './services/fee-estimator',
			pid_file: './pids/service_fee_estimator.pid',
			out_file: './logs/service_fee_estimator.log',
			error_file: './logs/service_fee_estimator.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
			watch: false,
			kill_timeout: 10000,
			max_memory_restart: '300M',
			autorestart: true,
			env: {
				// --- Remember to set the properties below
				SERVICE_BROKER: 'redis://localhost:6379/0',
				SERVICE_FEE_ESTIMATOR_CACHE: 'redis://localhost:6379/1',
				ENABLE_FEE_ESTIMATOR_QUICK: 'true',
				ENABLE_FEE_ESTIMATOR_FULL: 'false',
			},
		},
		{
			name: 'lisk-service-transaction-statistics',
			script: 'app.js',
			cwd: './services/transaction-statistics',
			pid_file: './pids/service_transaction_statistics.pid',
			out_file: './logs/service_transaction_statistics.log',
			error_file: './logs/service_transaction_statistics.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
			watch: false,
			kill_timeout: 10000,
			max_memory_restart: '300M',
			autorestart: true,
			env: {
				// --- Remember to set the properties below
				SERVICE_BROKER: 'redis://localhost:6379/0',
				SERVICE_STATISTICS_REDIS: 'redis://localhost:6379/1',
				SERVICE_STATISTICS_MYSQL: 'mysql://lisk:password@localhost:3306/lisk',
				TRANSACTION_STATS_HISTORY_LENGTH_DAYS: '366',
			},
		},
		{
			name: 'lisk-service-market',
			script: 'app.js',
			cwd: './services/market',
			pid_file: './pids/service_market.pid',
			out_file: './logs/service_market.log',
			error_file: './logs/service_market.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
			watch: false,
			kill_timeout: 10000,
			max_memory_restart: '300M',
			autorestart: true,
			env: {
				SERVICE_BROKER: 'redis://localhost:6379/0',
				SERVICE_MARKET_REDIS: 'redis://localhost:6379/2',
				SERVICE_MARKET_FIAT_CURRENCIES: 'EUR,USD,CHF,GBP,RUB',
				SERVICE_MARKET_TARGET_PAIRS: 'LSK_BTC,LSK_EUR,LSK_USD,LSK_CHF,BTC_EUR,BTC_USD,BTC_CHF',
				// EXCHANGERATESAPI_IO_API_KEY: ''
			},
		},
	],
};

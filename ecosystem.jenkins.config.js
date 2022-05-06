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
				SERVICE_GATEWAY_VOLATILE: 'redis://localhost:6379/3',
				STRICT_READINESS_CHECK: false,
				WS_RATE_LIMIT_ENABLE: false,
				WS_RATE_LIMIT_CONNECTIONS: 5,
				WS_RATE_LIMIT_DURATION: 1, // in seconds
				HTTP_RATE_LIMIT_ENABLE: true,
				HTTP_RATE_LIMIT_CONNECTIONS: 200,
				HTTP_RATE_LIMIT_WINDOW: 10, // in seconds
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
				LISK_APP_WS: 'ws://localhost:5001',
				GEOIP_JSON: '',
				USE_LISK_IPC_CLIENT: 'true', // TODO: Revert this change once issue https://github.com/LiskHQ/lisk-sdk/issues/7141 is fixed
				// LISK_APP_DATA_PATH: '~/.lisk/lisk-core',				
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
				// ENABLE_DATA_RETRIEVAL_MODE: 'true',
				// ENABLE_INDEXING_MODE: 'true',
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
				SERVICE_STATISTICS_CACHE_REDIS: 'redis://localhost:6379/1',
				SERVICE_STATISTICS_MYSQL: 'mysql://lisk:password@localhost:3306/lisk',
				ENABLE_TRANSACTION_STATS: 'true',
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
			},
		},
		{
			name: 'lisk-service-newsfeed',
			script: 'app.js',
			cwd: './services/newsfeed',
			pid_file: './pids/service_newsfeed.pid',
			out_file: './logs/service_newsfeed.log',
			error_file: './logs/service_newsfeed.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
			watch: false,
			kill_timeout: 10000,
			max_memory_restart: '300M',
			autorestart: true,
			env: {
				SERVICE_BROKER: 'redis://localhost:6379/0',
				SERVICE_NEWSFEED_MYSQL: 'mysql://lisk:password@localhost:3306/lisk?charset=utf8mb4',
			},
		},
	],
};

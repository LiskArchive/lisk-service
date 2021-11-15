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
			max_memory_restart: '512M',
			autorestart: true,
			env: {
				PORT: '9901',
				// --- Remember to set the properties below
				SERVICE_BROKER: 'redis://localhost:6379/0',
				WS_RATE_LIMIT_ENABLE: false,
				WS_RATE_LIMIT_CONNECTIONS: 5,
				WS_RATE_LIMIT_DURATION: 1, // in seconds
				HTTP_RATE_LIMIT_ENABLE: false,
				HTTP_RATE_LIMIT_CONNECTIONS: 200,
				HTTP_RATE_LIMIT_WINDOW: 10, // in seconds
				// ENABLE_HTTP_API: 'http-status,http-version2',
				// ENABLE_WS_API: 'blockchain,rpc-v2',
				// HTTP_CACHE_CONTROL_DIRECTIVES: 'public, max-age=10',
				// ENABLE_HTTP_CACHE_CONTROL: 'true'
			},
		},
		{
			name: 'lisk-service-core',
			script: 'app.js',
			cwd: './services/core',
			pid_file: './pids/service_core.pid',
			out_file: './logs/service_core.log',
			error_file: './logs/service_core.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
			watch: false,
			kill_timeout: 10000,
			max_memory_restart: '1G',
			autorestart: true,
			env: {
				// --- Remember to set the properties below
				SERVICE_BROKER: 'redis://localhost:6379/0',
				LISK_CORE_WS: 'ws://localhost:8080',
				SERVICE_CORE_REDIS: 'redis://localhost:6379/1',
				SERVICE_CORE_REDIS_VOLATILE: 'redis://localhost:6379/8',
				SERVICE_CORE_MYSQL: 'mysql://root:password@localhost:3306/lisk',
				LISK_STATIC: 'https://static-data.lisk.com',
				GEOIP_JSON: '',
				INDEX_N_BLOCKS: '0',
				ENABLE_TRANSACTION_STATS: 'true',
				ENABLE_JOB_MISSING_BLOCKS: 'true',
				INDEX_MISSING_BLOCKS_RANGE: '0',
				TRANSACTION_STATS_HISTORY_LENGTH_DAYS: '366',
				TRANSACTION_STATS_UPDATE_INTERVAL: '3600',
				ENABLE_FEE_ESTIMATOR_QUICK: 'true',
				ENABLE_FEE_ESTIMATOR_FULL: 'false',
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
			max_memory_restart: '512M',
			autorestart: true,
			env: {
				// --- Remember to set the properties below
				SERVICE_BROKER: 'redis://localhost:6379/0',
				SERVICE_MARKET_REDIS: 'redis://localhost:6379/2',
				// SERVICE_MARKET_FIAT_CURRENCIES: 'EUR,USD,CHF,GBP,RUB',
				// SERVICE_MARKET_TARGET_PAIRS: 'LSK_BTC,LSK_EUR,LSK_USD,LSK_CHF,BTC_EUR,BTC_USD,BTC_CHF',
				// EXCHANGERATESAPI_IO_API_KEY: ''
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
			max_memory_restart: '512M',
			autorestart: true,
			env: {
				SERVICE_BROKER: 'redis://localhost:6379/0',
				SERVICE_NEWSFEED_MYSQL: 'mysql://lisk:password@localhost:3306/lisk?charset=utf8mb4',
			},
		},
		{
			name: 'lisk-service-export',
			script: 'app.js',
			cwd: './services/export',
			pid_file: './pids/service_export.pid',
			out_file: './logs/service_export.log',
			error_file: './logs/service_export.err',
			log_date_format: 'YYYY-MM-DD HH:mm:ss SSS',
			watch: false,
			kill_timeout: 10000,
			max_memory_restart: '512M',
			autorestart: true,
			env: {
				SERVICE_BROKER: 'redis://localhost:6379/0',
				SERVICE_EXPORT_REDIS: 'redis://localhost:6379/3',
			},
		},
	],
};

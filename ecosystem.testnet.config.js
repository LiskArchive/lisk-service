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
			instances: 1,
			autorestart: true,
			env: {
				PORT: '9901',
				SERVICE_BROKER: 'redis://localhost:6379/0',
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
			max_memory_restart: '512M',
			instances: 1,
			autorestart: true,
			env: {
				SERVICE_BROKER: 'redis://localhost:6379/0',
				LISK_CORE_HTTP: 'https://testnet.lisk.io',
				LISK_CORE_WS: 'wss://testnet.lisk.io',
				SERVICE_CORE_REDIS: 'redis://localhost:6379/1',
				SERVICE_CORE_POSTGRES: 'postgres://lisk:password@localhost:5432/lisk',
				LISK_STATIC: 'https://static-data.lisk.io',
				GEOIP_JSON: 'https://geoip.lisk.io/json',
			},
		},
	],
};

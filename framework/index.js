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
	Microservice: require('./src/microservice'),
	Logger: require('./src/logger').get,
	LoggerConfig: require('./src/logger').init,
	Debug: require('./src/logger').debug,
	CacheMemory: require('./src/cacheMemory'),
	CacheRedis: require('./src/cacheRedis'),
	CacheLRU: require('./src/cacheLru'),
	Exceptions: require('./src/exceptions'),
	HTTP: require('./src/http'),
	Signals: require('./src/signals'),
	SocketClient: require('./src/socketClient'),
	Queue: require('./src/queue'),
	mapper: require('./src/mapper'),
	MySQL: require('./src/mysql'),
	MySQLKVStore: require('./src/mysqlKVStore'),
	Utils: {
		requireAllJs: require('./src/requireAllJs'),
		Data: require('./src/data'),
		...(require('./src/data')),
	},
	Constants: {
		...require('./constants/ErrorCodes'),
	},
	Libs: {
		moleculer: require('moleculer'),
		'moleculer-web': require('moleculer-web'),
	},
};

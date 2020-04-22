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
/* eslint-disable no-console */
const log4js = require('log4js');
const debug = require('debug');
const stackTrace = require('stack-trace');

let LOG_LEVEL = 'info';

let log4jsConfig = {
	appenders: {},
};

let packageName = '';

const configure = ({ log: config, packageJson }) => {
  packageName = packageJson.name;

	LOG_LEVEL = (config.level || 'info').toLowerCase();

	log4jsConfig = {
		appenders: {},
		categories: { default: { appenders: [], level: LOG_LEVEL } },
	};

	const coverPasswords = input => input.replace(
		/(\b(?!:\/\/\b)[^@/$]+(\b!?@)\b)/g,
		`${Array(8).join('*')}:${Array(8).join('*')}@`);

	const textLayout = {
		type: 'pattern',
		pattern: '%[%d %p [%c]%] %x{transformedMsg}',
		tokens: {
			transformedMsg: logEvent => logEvent.data.map(coverPasswords),
		},
	};

	const fileLayout = {
		type: 'pattern',
		pattern: '%d %p [%c] %x{transformedMsg}',
		tokens: {
			transformedMsg: logEvent => logEvent.data.map(coverPasswords),
			rawJson: logEvent => JSON.stringify(logEvent),
		},
	};

	log4js.addLayout('gelfLayout', () => logEvent => logEvent.data.map(coverPasswords));

	if (typeof config.console === 'string' && config.console === 'true') {
		log4jsConfig.categories.default.appenders.push('console_filter');
		log4jsConfig.appenders.console = {
			type: 'console',
			layout: textLayout,
		};
		log4jsConfig.appenders.console_filter = {
			type: 'logLevelFilter',
			appender: 'console',
			level: LOG_LEVEL,
		};
	}

	if (typeof config.stdout === 'string' && config.stdout === 'true') {
		log4jsConfig.categories.default.appenders.push('stdout_filter');
		log4jsConfig.appenders.stdout = {
			type: 'stdout',
			layout: textLayout,
		};
		log4jsConfig.appenders.stdout_filter = {
			type: 'logLevelFilter',
			appender: 'stdout',
			level: LOG_LEVEL,
		};
	}

	if (typeof config.file === 'string' && config.file !== 'false') {
		log4jsConfig.categories.default.appenders.push('file');
		log4jsConfig.appenders.file = {
			type: 'file',
			filename: config.file,
			level: LOG_LEVEL,
			layout: fileLayout,
		};
	}

	if (typeof config.gelf === 'string' && config.gelf !== 'false') {
		try {
			const [host, port, protocol] = config.gelf.match(/(\b(?!:\b)[^:/$]+\b)/g);

			if (protocol.toLowerCase() !== 'udp') {
				console.log(`Protocol error: other prototol that UDP is not supported ${config.gelf}`);
			}

			log4jsConfig.categories.default.appenders.push('gelf');
			log4jsConfig.appenders.gelf = {
				host,
				port,
				type: '@log4js-node/gelf',
				facility: 'lisk-service',
				customFields: {
					_component: packageJson.name,
					_version: packageJson.version,
					_docker_host: config.docker_host,
				},
				appendCategory: 'category',
				level: 'trace', // log all events
				layout: { type: 'gelfLayout' }, // TODO: Custom layouts not supported by GELF
			};
		} catch (e) {
			console.log(`Could not enable GELF output for ${config.gelf}`);
		}
	}

	if (Object.keys(log4jsConfig.appenders).length > 0) log4js.configure(log4jsConfig);
}

const getFileNameWhichCalledGetLogger = () => {
	const trace = stackTrace.get();
	const filePath = trace[2].getFileName();
	return filePath.slice(filePath.lastIndexOf('/') + 1, -3);
};

const getLogger = (entityName) => {
	entityName = entityName || getFileNameWhichCalledGetLogger();
	const debugInstance = debug(`${packageName}:${entityName}`);

	if (Object.keys(log4jsConfig.appenders).length > 0) {
		const logger = log4js.getLogger(entityName);
		logger.debug = debugInstance;
		logger.trace = debugInstance;
		logger.debug(`Logger set to level ${LOG_LEVEL} for entity ${entityName}`);
		return logger;
	}
	return {
		trace: debugInstance,
		debug: debugInstance,
		info: () => {},
		warn: () => {},
		error: () => {},
		fatal: () => {},
		mark: () => {},
	};
};

getLogger.configure = configure;

module.exports = getLogger;

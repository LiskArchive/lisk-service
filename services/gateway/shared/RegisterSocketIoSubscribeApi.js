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
const pathLib = require('path');
const requireAll = require('require-all');

const SocketClient = require('./socketClient');
const mapperService = require('./mapper');
const RedisCache = require('./cache');
const utils = require('./utils');
const logger = require('./logger')();
const config = require('../config');
const moleculer = require('./moleculer');

const collectors = requireAll({
	dirname: pathLib.resolve(__dirname, '../collectors'),
	filter: /(.+)\.js$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
});

const cache = new RedisCache(config.endpoints.redis.url);
const CACHE_TTL = 3 * 60; // seconds

const endpoints = {};

const moleculerConfig = {
	events: {},
};

const registerSocketSubscribeApi = (server, apiConfig, apiInternalConfig) => {
	const io = server.socketio;

	Object.keys(config.endpoints).forEach((endpointName) => {
		if (config.endpoints[endpointName].type === 'socket.io') {
			endpoints[endpointName] = {
				connUrl: config.endpoints[endpointName].url,
				connHandler: new SocketClient(config.endpoints[endpointName].url),
			};
		} else if (config.endpoints[endpointName].type === 'moleculer') {
			endpoints[endpointName] = {
				connUrl: config.endpoints[endpointName].url,
				connHandler: {
					socket: {
						on: (event, callback) => {
							moleculerConfig.events[event] = data => callback(data);
						},
					},
				},
			};
		}
	});

	const socketServer = io.of(apiConfig.apiPath);

	logger.info(`${apiConfig.name || apiConfig.description} registered`);
	const events = apiInternalConfig.events;

	return new Promise((resolve, reject) => {
		try {
			['connect', 'reconnect'].forEach((eventName) => {
				socketServer.on(eventName, () => {
					events.forEach((event) => {
						if (event.cache === true) {
							cache.read(`gateway_socket_cache:${event.name}`).then((result) => {
								if (result) {
									socketServer.emit(event.name, result);
								}
							});
						}
					});
				});
			});

			events.forEach((event) => {
				const emitData = data => socketServer.emit(event.name, data);

				if (event.type === 'event') {
					endpoints[event.source.endpoint].connHandler.socket.on(event.source.event, (data) => {
						let output;
						if ('mapper' in event.source) {
							output = mapperService(data, event.source.mapper);
						} else output = data;
						if (event.cache === true) {
							cache.write(`gateway_socket_cache:${event.name}`, output, CACHE_TTL);
						}

						if (!output.meta) output.meta = {};
						output.meta.count = output.data.length;
						output.meta.timestamp = utils.getTimestamp();

						logger.trace(`Received socket.io data at ${apiInternalConfig.path}: ${JSON.stringify(output)}`);

						socketServer.emit(event.name, output);
					});
				}

				if (event.type === 'event-to-request') {
					endpoints[event.source.endpoint].connHandler.socket.on(event.source.event,
						async (eventData) => {
							const output = {};
							const request = event.request;

							try {
								output.rawData = await collectors[request.collector](
									null, request.source, eventData);
								if ('definition' in request.source) output.mapped = mapperService(output.rawData, request.source.definition);
								else output.mapped = output.rawData;

								if (event.cache === true) {
									cache.write(`gateway_socket_cache:${event.name}`, output.mapped, CACHE_TTL);
								}

								if (!output.mapped.meta) output.mapped.meta = {};
								output.mapped.meta.count = output.mapped.data.length;
								output.mapped.meta.timestamp = utils.getTimestamp();

								logger.trace(`Received socket.io data at ${apiInternalConfig.path}: ${JSON.stringify(output)}`);

								return emitData(output.mapped);
							} catch (err) {
								logger.trace(`Could not retrieve data with the request: ${request.source}, ${eventData}`);
							}
							return undefined;
						});
				}

				if (event.type === 'polling') {
					const oldDataPool = {};

					const pollData = (source, params, eventName) => {
						const hasNewData = (oldData, newData, property, key) =>
							oldData[property][0] !== newData[0][key];
						setInterval(async () => {
							const data = await collectors[source.type](null, source, params);
							const mappedData = data.map(item => mapperService(item, source.mapper));
							if (!oldDataPool[eventName]) {
								oldDataPool[eventName] = mappedData.map(elem => elem[source.compareKey]);
							}
							if (hasNewData(oldDataPool, mappedData, eventName, source.compareKey)) {
								oldDataPool[eventName] = mappedData.map(elem => elem[source.compareKey]);
								return emitData(mappedData);
							}
							return undefined;
						}, source.interval);
					};

					pollData(event.source, event.params, event.name);
				}
			});

			moleculer.configure(moleculerConfig);

			resolve();
		} catch (err) {
			reject(err);
		}
	});
};

module.exports = registerSocketSubscribeApi;

/*
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
 */

const axios = require('axios');
const https = require('https');
const io = require('socket.io-client');
const { apiClient } = require('@liskhq/lisk-client');
const config = require('../../../config');

const { getCertificateFromURL, convertCertificateToPemPublicKey } = require('./certificate');

const agent = new https.Agent({
	rejectUnauthorized: true,
});

const validatePublicKeyFromURL = async (url, publicKey) => {
	const sslCertificate = await getCertificateFromURL(url);
	const apiPubKey = await convertCertificateToPemPublicKey(sslCertificate);

	if (apiPubKey.trim() !== publicKey.trim()) {
		throw new Error("Supplied apiCertificatePublickey doesn't match with public key extracted from the SSL/TLS security certificate.");
	}
};

const httpRequest = async (url, httpOptions = {}, publicKey) => {
	const { protocol } = new URL(url);
	if (protocol !== 'https:' && protocol !== 'http:') {
		throw new Error(`Incorrect service URL provided: ${url}.`);
	}

	if (protocol === 'https:') {
		httpOptions.httpsAgent = agent;
	}

	const response = await axios.get(url, httpOptions);

	if (response.status === 200) {
		if (protocol === 'https:' && publicKey) {
			await validatePublicKeyFromURL(url, publicKey);
		}

		return response;
	}

	throw new Error(`URL '${url}' returned response with status code ${response.status}.`);
};

const wsRequest = async (wsEndpoint, wsMethod, wsParams, publicKey, timeout = config.API_TIMEOUT) => {
	const { protocol } = new URL(wsEndpoint);
	if (protocol !== 'ws:' && protocol !== 'wss:') {
		return Promise.reject(new Error(`Incorrect websocket URL protocol: ${wsEndpoint}.`));
	}

	const websocketOptions = { forceNew: true, transports: ['websocket'] };
	if (protocol === 'wss:') {
		websocketOptions.agent = agent;
	}

	const res = await new Promise((resolve, reject) => {
		const socket = io(wsEndpoint, websocketOptions);

		try {
			const timer = setTimeout(() => {
				socket.close();
				reject(new Error('WebSocket request timed out.'));
			}, timeout);

			socket.emit('request', { method: wsMethod, params: wsParams }, answer => {
				clearTimeout(timer);
				socket.close();
				resolve(answer);
			});

			socket.on('error', (err) => {
				clearTimeout(timer);
				socket.close();
				reject(err);
			});
		} catch (err) {
			reject(err);
		}
	});

	if (publicKey) {
		await validatePublicKeyFromURL(wsEndpoint, publicKey);
	}

	return res;
};

const requestInfoFromLiskNodeWSEndpoint = async (wsEndpoint, publicKey) => {
	const { protocol } = new URL(wsEndpoint);
	if (protocol !== 'ws:' && protocol !== 'wss:') {
		return Promise.reject(new Error('Invalid WebSocket URL.'));
	}

	const client = await apiClient.createWSClient(wsEndpoint + config.NODE_WS_API_RPC_NAMESPACE);
	const res = await client._channel.invoke('system_getNodeInfo', {});

	if (publicKey) {
		await validatePublicKeyFromURL(wsEndpoint, publicKey);
	}

	return res;
};

const requestInfoFromLiskNodeHTTPEndpoint = async (url, publicKey) => {
	const { protocol } = new URL(url);
	if (protocol !== 'http:' && protocol !== 'https:') {
		return Promise.reject(new Error(`Invalid HTTP URL: ${url}`));
	}

	const options = {
		headers: {
			'Content-Type': 'application/json',
		},
	};

	if (protocol === 'https:') {
		options.httpsAgent = agent;
	}

	const response = await axios.post(url + config.NODE_HTTP_API_RPC_NAMESPACE, {
		jsonrpc: '2.0',
		id: 1,
		method: 'system_getNodeInfo',
		params: {},
	}, options);

	if (publicKey) {
		await validatePublicKeyFromURL(url, publicKey);
	}

	return response.data.result;
};

module.exports = {
	httpRequest,
	wsRequest,
	requestInfoFromLiskNodeWSEndpoint,
	requestInfoFromLiskNodeHTTPEndpoint,
};

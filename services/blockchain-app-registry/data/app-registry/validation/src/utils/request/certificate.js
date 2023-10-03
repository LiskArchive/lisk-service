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

const https = require('https');
const { exec } = require('child_process');
const config = require('../../../config');

const cachedCerts = {};

const getCertificateFromURL = async (url, timeout = config.API_TIMEOUT) => {
	const { host } = new URL(url);

	if (host in cachedCerts) {
		return Promise.resolve(cachedCerts[host]);
	}

	return new Promise((resolve, reject) => {
		const options = {
			hostname: host,
			port: 443,
			method: 'GET',
		};

		const req = https.request(options, (res) => {
			const certificate = res.socket.getPeerCertificate();
			if (!certificate) {
				reject(new Error(`No certificate found for url: ${url}.`));
			}

			cachedCerts[host] = certificate.raw;
			resolve(certificate.raw);
		});

		req.on('error', (error) => {
			reject(error);
		});

		req.setTimeout(timeout, () => {
			req.destroy();
			reject(new Error(`Request timed out when fetching certificate from URL: ${url}.`));
		});

		req.end();
	});
};

const convertCertificateToPemPublicKey = async (certificate) => new Promise((resolve, reject) => {
	const command = 'openssl x509 -inform der -pubkey -noout | openssl rsa -pubin -inform pem';
	const child = exec(command, (error, stdout) => {
		if (error) {
			reject(error);
		}

		resolve(stdout);
	});

	child.stdin.write(Buffer.from((certificate), 'base64'));
	child.stdin.end();
});

module.exports = {
	getCertificateFromURL,
	convertCertificateToPemPublicKey,
};

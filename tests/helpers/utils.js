/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { parse } = require('csv-parse');

const waitForSuccess = (fn, successValidator, intervalMs = 500) => new Promise((resolve) => {
	const intervalId = setInterval(
		() => fn()
			.then(result => {
				clearInterval(intervalId);
				if (!successValidator || successValidator(result)) resolve(result);
			})
			.catch(),
		intervalMs,
	);
});

const isStringCsvParseable = (string, params) => parse(
	string,
	params,
	(err) => !err,
);

const waitMs = (n) => new Promise((resolve) => {
	setTimeout(() => {
		resolve();
	}, n);
});

module.exports = {
	waitForSuccess,
	isStringCsvParseable,
	waitMs,
};

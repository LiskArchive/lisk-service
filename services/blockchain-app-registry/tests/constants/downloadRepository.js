/*
 * LiskHQ/lisk-service
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
 *
 */
const getModifiedFileNamesInput = {
	alphanet: {
		Lisk: [
			{ filename: 'alphanet/Lisk/app.json' },
			{ filename: 'alphanet/Lisk/nativetokens.json' },
		],
		Enevti: [
			{ filename: 'alphanet/Enevti/app.json' },
			{ filename: 'alphanet/Enevti/nativetokens.json' },
		],
	},
	betanet: {
		Lisk: [
			{ filename: 'betanet/Lisk/app.json' },
			{ filename: 'betanet/Lisk/nativetokens.json' },
		],
		Enevti: [
			{ filename: 'betanet/Enevti/app.json' },
			{ filename: 'betanet/Enevti/nativetokens.json' },
		],
	},
};

const getModifiedFileNamesExpectedResponse = [
	'alphanet/Lisk/app.json',
	'alphanet/Lisk/nativetokens.json',
	'alphanet/Enevti/app.json',
	'alphanet/Enevti/nativetokens.json',

	'betanet/Lisk/app.json',
	'betanet/Lisk/nativetokens.json',
	'betanet/Enevti/app.json',
	'betanet/Enevti/nativetokens.json',
];

module.exports = {
	getModifiedFileNamesInput,
	getModifiedFileNamesExpectedResponse,
};

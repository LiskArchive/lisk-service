/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const mapTransaction = transaction => {
	const changesByType = {
		8: {
			asset: {
				amount: transaction.amount,
				recipientId: transaction.recipientId,
				data: transaction.asset.data,
			},
		},
		9: {
			asset: transaction.asset.signature,
		},
		10: {
			asset: transaction.asset.delegate,
		},
		11: {
			senderPublicKey: transaction.recipientPublicKey,
		},
		12: {
			asset: transaction.asset.multisignature,
		},
	};

	return ({
		...transaction,
		...changesByType[transaction.type] || {},
	});
};

const responseMappers = {
	transactions: response => response.map(mapTransaction),
};

const mapToOriginal = (response, type) => {
	const mapper = responseMappers[type];
	if (mapper) response = mapper(response);
	return response;
};

module.exports = {
	mapToOriginal,
};

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
const { getDelegateRankByUsername } = require('./delegateCache');

const peerStates = {
	'1.0.0-alpha.0': {
		UNKNOWN: 0,
		DISCONNECTED: 1,
		CONNECTED: 2,
	},
};

const transactionTypes = {
	'1.0.0-alpha.0': {
		TRANSFER: 0,
		REGISTERSECONDPASSPHRASE: 1,
		REGISTERDELEGATE: 2,
		CASTVOTES: 3,
		REGISTERMULTISIGNATURE: 4,
	},
};

const mapState = state => {
	const stateMapping = {
		connected: peerStates['1.0.0-alpha.0'].CONNECTED,
		disconnected: peerStates['1.0.0-alpha.0'].DISCONNECTED,
	};
	return stateMapping[state] !== undefined ? stateMapping[state] : state;
};

const transactionTypeParamMap = {
	TRANSFER: transactionTypes['1.0.0-alpha.0'].TRANSFER,
	REGISTERSECONDPASSPHRASE: transactionTypes['1.0.0-alpha.0'].REGISTERSECONDPASSPHRASE,
	REGISTERDELEGATE: transactionTypes['1.0.0-alpha.0'].REGISTERDELEGATE,
	CASTVOTES: transactionTypes['1.0.0-alpha.0'].CASTVOTES,
	REGISTERMULTISIGNATURE: transactionTypes['1.0.0-alpha.0'].REGISTERMULTISIGNATURE,
};

const mapTransaction = transaction => {
	const changesByType = {
		0: {
			amount: transaction.asset.amount,
			recipientId: transaction.asset.recipientId,
			asset: { data: transaction.asset.data },
		},
		1: {
			asset: { signature: transaction.asset },
		},
		2: {
			asset: { delegate: transaction.asset },
		},
		3: {
			recipientPublicKey: transaction.senderPublicKey,
		},
		4: {
			asset: { multisignature: transaction.asset },
		},
	};

	return ({
		amount: '0',
		...transaction,
		...changesByType[transaction.type] || {},
	});
};

const mapDelegate = ({ voteWeight, ...delegate }) => ({
	...delegate,
	vote: voteWeight,
	rank: getDelegateRankByUsername(delegate.username),
});

const responseMappers = {
	'/peers': response => {
		response.data = response.data.map(peer => ({ ...peer, state: mapState(peer.state) }));
		return response;
	},
	'/transactions': response => {
		response.data = response.data.map(mapTransaction);
		return response;
	},
	'/delegates': response => {
		response.data = response.data.map(mapDelegate);
		return response;
	},
	'/node/constants': response => {
		response.data = { ...response.data, nethash: response.data.networkId };
		return response;
	},
};

const paramMappers = {
	'/delegates/latest_registrations': params => {
		if (params.type) {
			params.type = transactionTypeParamMap[params.type];
		}
		return params;
	},
};


module.exports = {
	responseMappers,
	paramMappers,
};

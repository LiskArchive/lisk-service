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
const { getDelegateRankByUsername } = require('./delegateCache.js');

const peerStates = {
	'3.0.0-beta.0': {
		DISCONNECTED: 'disconnected',
		CONNECTED: 'connected',
	},
};

const transactionTypes = {
	'3.0.0-beta.0': {
		TRANSFER: 8,
		REGISTERSECONDPASSPHRASE: 9,
		REGISTERDELEGATE: 10,
		CASTVOTES: 11,
		REGISTERMULTISIGNATURE: 12,
	},
};

const peerStateParamMap = {
	1: peerStates['3.0.0-beta.0'].DISCONNECTED,
	2: peerStates['3.0.0-beta.0'].CONNECTED,
};

const mapState = state => {
	const stateMapping = {
		[peerStates['3.0.0-beta.0'].CONNECTED]: 2,
		[peerStates['3.0.0-beta.0'].DISCONNECTED]: 1,
	};
	return stateMapping[state] !== undefined ? stateMapping[state] : state;
};

const transactionTypeParamMap = {
	TRANSFER: transactionTypes['3.0.0-beta.0'].TRANSFER,
	REGISTERSECONDPASSPHRASE: transactionTypes['3.0.0-beta.0'].REGISTERSECONDPASSPHRASE,
	REGISTERDELEGATE: transactionTypes['3.0.0-beta.0'].REGISTERDELEGATE,
	CASTVOTES: transactionTypes['3.0.0-beta.0'].CASTVOTES,
	REGISTERMULTISIGNATURE: transactionTypes['3.0.0-beta.0'].REGISTERMULTISIGNATURE,
};

const mapTransaction = transaction => {
	const changesByType = {
		8: {
			amount: transaction.asset.amount,
			recipientId: transaction.asset.recipientId,
			asset: { data: transaction.asset.data },
		},
		9: {
			asset: { signature: transaction.asset },
		},
		10: {
			asset: { delegate: transaction.asset },
		},
		11: {
			recipientPublicKey: transaction.senderPublicKey,
		},
		12: {
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
	'/peers': params => {
		if (params.state) {
			params.state = peerStateParamMap[params.state];
		}
		return params;
	},
	'/delegates': params => {
		if (params.sort) {
			params.sort = params.sort.replace('rank:asc', 'voteWeight:desc');
			params.sort = params.sort.replace('rank:desc', 'voteWeight:asc');
		}
		return params;
	},
};


module.exports = {
	responseMappers,
	paramMappers,
};

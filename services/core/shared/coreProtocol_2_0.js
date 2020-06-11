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
	1.1: {
		UNKNOWN: 0,
		DISCONNECTED: 1,
		CONNECTED: 2,
	},
	'2.0': {
		DISCONNECTED: 'disconnected',
		CONNECTED: 'connected',
	},
};

const peerStateParamMap = {
	[peerStates['1.1'].DISCONNECTED]: peerStates['2.0'].DISCONNECTED,
	[peerStates['1.1'].CONNECTED]: peerStates['2.0'].CONNECTED,
};

const mapState = state => {
	const stateMapping = {
		[peerStates['2.0'].CONNECTED]: peerStates['1.1'].CONNECTED,
		[peerStates['2.0'].DISCONNECTED]: peerStates['1.1'].DISCONNECTED,
	};
	return stateMapping[state] !== undefined ? stateMapping[state] : state;
};

const mapTransaction = transaction => {
	let changesByType = {
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
	changesByType = {
		...changesByType,
		8: changesByType[0],
		9: changesByType[1],
		10: changesByType[2],
		11: changesByType[3],
		12: changesByType[4],
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

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
const reverseMap = (originalMap) => {
	const result = {};
	Object.entries(originalMap).forEach(([k, v]) => result[v] = String(k).toLowerCase());

	return result;
};

const peerStates = {
	DISCONNECTED: 'disconnected',
	CONNECTED: 'connected',
};

const transactionTypes = {
	TRANSFER: 8,
	REGISTERSECONDPASSPHRASE: 9,
	REGISTERDELEGATE: 10,
	CASTVOTES: 11,
	REGISTERMULTISIGNATURE: 12,
};

const peerStateParamMap = {
	1: peerStates.DISCONNECTED,
	2: peerStates.CONNECTED,
};

const mapState = state => {
	const stateMapping = {
		[peerStates.CONNECTED]: 2,
		[peerStates.DISCONNECTED]: 1,
	};
	return stateMapping[state] !== undefined ? stateMapping[state] : state;
};

const mapStateName = state => {
	const peerStateNames = reverseMap(peerStateParamMap);
	return peerStateNames[state] !== undefined ? peerStateNames[state] : state;
};

const transactionTypeParamMap = {
	TRANSFER: transactionTypes.TRANSFER,
	REGISTERSECONDPASSPHRASE: transactionTypes.REGISTERSECONDPASSPHRASE,
	REGISTERDELEGATE: transactionTypes.REGISTERDELEGATE,
	CASTVOTES: transactionTypes.CASTVOTES,
	REGISTERMULTISIGNATURE: transactionTypes.REGISTERMULTISIGNATURE,
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

const responseMappers = {
	'/peers': response => {
		response.data = response.data.map(peer => ({
			...peer,
			stateName: mapStateName(peer.state),
			state: mapState(peer.state),
		}));
		return response;
	},
	'/transactions': response => {
		response.data = response.data.map(mapTransaction);
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
	'/transactions': params => {
        if (params.type) {
            if (Number.isNaN(Number(params.type))) {
                params.type = transactionTypeParamMap[params.type];
            }
        }
        return params;
    },
};

const mapResponse = (response, url) => {
	if (response.data) {
		const mapper = responseMappers[url];
		if (mapper) response = mapper(response);
	}
	return response;
};

const mapParams = (params, url) => {
	const mapper = paramMappers[url];
	if (mapper) {
		params = mapper(params);
	}
	return params;
};

module.exports = {
	mapResponse,
	mapParams,
};

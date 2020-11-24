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
    UNKNOWN: 0,
    DISCONNECTED: 1,
    CONNECTED: 2,
};

const transactionTypeParamMap = {
    TRANSFER: 0,
    REGISTERSECONDPASSPHRASE: 1,
    REGISTERDELEGATE: 2,
    CASTVOTES: 3,
    REGISTERMULTISIGNATURE: 4,
};

const mapState = state => {
    const stateMapping = {
        connected: peerStates.CONNECTED,
        disconnected: peerStates.DISCONNECTED,
    };
    return stateMapping[state] !== undefined ? stateMapping[state] : state;
};

const mapStateName = state => {
    const peerStateNames = reverseMap(peerStates);
    return peerStateNames[state] !== undefined ? peerStateNames[state] : state;
};

const mapTransaction = transaction => {
    const changesByType = {
        0: {
            amount: transaction.asset.amount || transaction.amount,
            recipientId: transaction.asset.recipientId || transaction.recipientId,
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
    '/transactions': params => {
        if (params.type) {
            if (!Number.isNaN(Number(params.type))) {
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

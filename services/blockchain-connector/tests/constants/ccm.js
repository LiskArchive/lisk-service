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
const decodedCCM = Object.freeze({
    module: 'token',
    crossChainCommand: 'transferCrossChain',
    nonce: '1',
    fee: '10000000',
    sendingChainID: '02000000',
    receivingChainID: '02000001',
    params: '0a0802000000000000001080d0dbc3f4021a14fc18da54f6ce01bf31195548460361dfdb83c2052214888592ae41888c267826d7870206d3016a1863042a00',
    status: 0,
});

const encodedCCM = '0a05746f6b656e12127472616e7366657243726f7373436861696e18012080ade2042a04020000003204020000013a3f0a0802000000000000001080d0dbc3f4021a14fc18da54f6ce01bf31195548460361dfdb83c2052214888592ae41888c267826d7870206d3016a1863042a004000';

const invalidCCM = Object.freeze({
    module: 'token',
    crossChainCommand: 'transferCrossChain',
    nonce: '1',
    fee: '10000000',
    sendingChainID: '02000000',
    receivingChainID: '02000001',
    status: 0,
});

module.exports = {
    decodedCCM,
    encodedCCM,
    invalidCCM,
};

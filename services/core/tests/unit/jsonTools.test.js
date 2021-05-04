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
const {
    parseToJSONCompatObj,
} = require('../../shared/jsonTools');

const testObject = {
    asset: {
        amount: BigInt(150000000000),
        recipientAddress: Buffer.from('b5a1052cd5bb1259202b291512387292e2d4a8e9', 'hex'),
    },
    amount: BigInt(150000000000),
    recipientAddress: Buffer.from('b5a1052cd5bb1259202b291512387292e2d4a8e9', 'hex'),
    assetID: 0,
    fee: BigInt(1000000),
    id: Buffer.from('b11e14378c8afdd1ba68a305d6168eb710a1c9ff20da1836ddf68f0139600bc9', 'hex'),
    moduleID: 2,
    nonce: BigInt(61),
};

describe('jsonTools tests', () => {
    it('Parse buffer to string', async () => {
        const bufferData = Buffer.from('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'hex');
        const parsedResult = parseToJSONCompatObj(bufferData);
        expect(typeof parsedResult).toBe('string');
        expect(parsedResult).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('Parse object', async () => {
        const parsedResult = parseToJSONCompatObj(testObject);
        expect(parsedResult).toBeInstanceOf(Object);
        expect(parsedResult).toMatchObject({
            asset: {
                amount: '150000000000',
                recipientAddress: 'b5a1052cd5bb1259202b291512387292e2d4a8e9',
            },
            amount: '150000000000',
            recipientAddress: 'b5a1052cd5bb1259202b291512387292e2d4a8e9',
            assetID: 0,
            fee: '1000000',
            id: 'b11e14378c8afdd1ba68a305d6168eb710a1c9ff20da1836ddf68f0139600bc9',
            moduleID: 2,
            nonce: '61',
        });
    });
});

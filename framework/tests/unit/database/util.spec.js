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
const { escapeUserInput } = require('../../../src/database/util');

describe('Test escapeUserInput method', () => {
    it('should return string with escaped character when called with valid input', async () => {
        const validInput = '%test%string_';
        const result = escapeUserInput(validInput);
        const expectedResult = '\\%test\\%string\\_';
        expect(result).toEqual(expectedResult);
    });

    it('should return empty string when called with empty string', async () => {
        const emptyString = '';
        const result = escapeUserInput(emptyString);
        expect(result).toEqual(emptyString);
    });
});

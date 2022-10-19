/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const config = require('../../../config');

const { VALID_BLS_KEY_PROOF_OF_POSSESSION } = require('../../../constants');

const { request } = require('../../../helpers/socketIoRpcRequest');

const { invalidParamsSchema } = require('../../../schemas/rpcGenerics.schema');

const { validateBLSKeySchema } = require('../../../schemas/api_v3/validatorSchema.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const validateBLSKey = async params => request(wsRpcUrl, 'post.validator.validateBLSKey', params);

describe('Method post.validator.validateBLSKey', () => {
	it('Returns true for valid blsKey and proofOfPossession pair', async () => {
		const { blsKey, proofOfPossession } = VALID_BLS_KEY_PROOF_OF_POSSESSION;
		const response = await validateBLSKey({ blsKey, proofOfPossession });
		const { result } = response;

		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(validateBLSKeySchema);
		expect(result.data.isValid).toEqual(true);
	});

	it('Returns false for invalid blsKey', async () => {
		const blsKey = '1301803f8b5ac4a1133581fc676dfedc60d891dd5fa99028805e5ea5b08d3491af75d0707adab3b70c6a6a580217bf81';
		const proofOfPossession = '88bb31b27eae23038e14f9d9d1b628a39f5881b5278c3c6f0249f81ba0deb1f68aa5f8847854d6554051aa810fdf1cdb02df4af7a5647b1aa4afb60ec6d446ee17af24a8a50876ffdaf9bf475038ec5f8ebeda1c1c6a3220293e23b13a9a5d26';
		const response = await validateBLSKey({ blsKey, proofOfPossession });
		const { result } = response;

		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(validateBLSKeySchema);
		expect(result.data.isValid).toEqual(false);
	});

	it('Returns true for invalid proofOfPossession message', async () => {
		const blsKey = 'b301803f8b5ac4a1133581fc676dfedc60d891dd5fa99028805e5ea5b08d3491af75d0707adab3b70c6a6a580217bf81';
		const proofOfPossession = '18bb31b27eae23038e14f9d9d1b628a39f5881b5278c3c6f0249f81ba0deb1f68aa5f8847854d6554051aa810fdf1cdb02df4af7a5647b1aa4afb60ec6d446ee17af24a8a50876ffdaf9bf475038ec5f8ebeda1c1c6a3220293e23b13a9a5d26';
		const response = await validateBLSKey({ blsKey, proofOfPossession });
		const { result } = response;

		expect(result.data).toBeInstanceOf(Object);
		expect(result.data).toMap(validateBLSKeySchema);
		expect(result.data.isValid).toEqual(false);
	});

	it('invalid query parameter -> -32602', async () => {
		const response = await validateBLSKey({ transactions: '0802100018002080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a32250880c2d72f1214b49074a2eb04e7611908985f02c12fb7cd488d451a0874657374207478733a4065faed7b49d1ee63730cbb545ea25e50361581e35412eeffac3b35746afd1176d2ee1e270e8b072b1ccfad2d64f72918063c383003971600d56b168d6e429f05' }).catch(e => e);
		expect(response).toMap(invalidParamsSchema);
	});
});

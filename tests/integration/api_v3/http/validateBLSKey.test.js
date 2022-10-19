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
const { api } = require('../../../helpers/api');

const { validateBLSKeySchema } = require('../../../schemas/api_v3/validatorSchema.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v3`;
const endpoint = `${baseUrlV2}/validator/validateBLSKey`;

describe('validate BLS Key API', () => {
	it('Returns true for valid blsKey and proofOfPossession pair', async () => {
		const blsKey = 'b301803f8b5ac4a1133581fc676dfedc60d891dd5fa99028805e5ea5b08d3491af75d0707adab3b70c6a6a580217bf81';
		const proofOfPossession = '88bb31b27eae23038e14f9d9d1b628a39f5881b5278c3c6f0249f81ba0deb1f68aa5f8847854d6554051aa810fdf1cdb02df4af7a5647b1aa4afb60ec6d446ee17af24a8a50876ffdaf9bf475038ec5f8ebeda1c1c6a3220293e23b13a9a5d26';
		const response = await api.post(
			`${endpoint}?blsKey=${blsKey}&proofOfPossession=${proofOfPossession}`,
		);

		expect(response.data).toMap(validateBLSKeySchema);
		expect(response.data.isValid).toEqual(true);
	});

	it('Returns false for wrong blsKey', async () => {
		const blsKey = '1301803f8b5ac4a1133581fc676dfedc60d891dd5fa99028805e5ea5b08d3491af75d0707adab3b70c6a6a580217bf81';
		const proofOfPossession = '88bb31b27eae23038e14f9d9d1b628a39f5881b5278c3c6f0249f81ba0deb1f68aa5f8847854d6554051aa810fdf1cdb02df4af7a5647b1aa4afb60ec6d446ee17af24a8a50876ffdaf9bf475038ec5f8ebeda1c1c6a3220293e23b13a9a5d26';
		const response = await api.post(
			`${endpoint}?blsKey=${blsKey}&proofOfPossession=${proofOfPossession}`,
		);

		expect(response.data).toMap(validateBLSKeySchema);
		expect(response.data.isValid).toEqual(false);
	});

	it('Returns true for wrong proofOfPossession message', async () => {
		const blsKey = 'b301803f8b5ac4a1133581fc676dfedc60d891dd5fa99028805e5ea5b08d3491af75d0707adab3b70c6a6a580217bf81';
		const proofOfPossession = '18bb31b27eae23038e14f9d9d1b628a39f5881b5278c3c6f0249f81ba0deb1f68aa5f8847854d6554051aa810fdf1cdb02df4af7a5647b1aa4afb60ec6d446ee17af24a8a50876ffdaf9bf475038ec5f8ebeda1c1c6a3220293e23b13a9a5d26';
		const response = await api.post(
			`${endpoint}?blsKey=${blsKey}&proofOfPossession=${proofOfPossession}`,
		);

		expect(response.data).toMap(validateBLSKeySchema);
		expect(response.data.isValid).toEqual(false);
	});
});

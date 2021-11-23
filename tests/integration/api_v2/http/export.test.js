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
const config = require('../../../config');
const { api } = require('../../../helpers/api');

const {
	notFoundSchema,
} = require('../../../schemas/httpGenerics.schema');

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV2 = `${baseUrl}/api/v2`;
const endpoint = `${baseUrlV2}/exports`;

const expectedResponse = '"Date";"Time";"Amount LSK";"Fee LSK";"Module:Asset";"Module:Asset Name";"Sender";"Recipient";"Sender Public Key";"Recipient Public Key";"Block Height";"Note";"Transaction ID"\n"2021-08-20";"10:53:06";"10.00000000";"0.00000000";"2:0";"token:transfer";"lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt";"lskqz6gpqfu9tb5yc2jtqmqvqp3x8ze35g99u2zfd";"0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a";"10bdf57ee21ff657ab617395acab81814c3983f608bf6f0be6e626298225331d";413;;"28fcc24bdbdf25e4ae6350fdac6af5c08f5a13bece10a34f27478f07569ecef0"\n"2021-08-20";"10:54:56";"165.00000000";"0.00119000";"1000:0";"legacyAccount:reclaimLSK";"lskqz6gpqfu9tb5yc2jtqmqvqp3x8ze35g99u2zfd";;"10bdf57ee21ff657ab617395acab81814c3983f608bf6f0be6e626298225331d";;424;;"6cff643daaa2bd1112d1b4591abef3e62f9e4f6e37a260fcd7508ce6a06f061c"\n';

describe('Account history export API', () => {
	it('return csv file -> 200 OK', async () => {
		const validFile = 'test.csv';
		const response = await api.get(`${endpoint}/${validFile}`, 200);
		expect(response).toEqual(expectedResponse);
	});

	it('File not exists -> 404 NOT_FOUND', async () => {
		const invalidFile = 'invalid.csv';
		const response = await api.get(`${endpoint}/${invalidFile}`, 404);
		expect(response).toMap(notFoundSchema);
	});
});

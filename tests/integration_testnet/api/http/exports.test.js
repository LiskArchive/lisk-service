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
import api from '../../helpers/api';
import config from '../../config';

const baseUrl = config.SERVICE_ENDPOINT;
const baseUrlV1 = `${baseUrl}/api/v1`;

const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

xdescribe('Export API', () => {
	describe('GET /<account>/transactions/json', () => {
		it('Exports transactions to JSON when the account ID is correct', async () => {
			const response = await api.get(`${baseUrlV1}/account/16313739661670634666L/transactions/json`);
			expect(response.data[0]).toMapRequiredSchema({
				transactionId: '1465651642158264047',
				senderId: '1085993630748340485L',
				recipientId: '16313739661670634666L',
				blockId: '6524861224470851795',
				amount: '100000000',
				fee: '0',
				date: '2016-05-24T17:00:00.000Z',
				senderPublicKey: 'c96dec3595ff6041c3bd28b76b8cf75dce8225173d1bd00241624ee89b50f2a8',
			});
		});
	});

	describe('GET /<account>/transactions/csv', () => {
		it('Exports transactions to CSV when the account ID is correct', async () => {
			const response = await api.get(`${baseUrlV1}/account/16313739661670634666L/transactions/csv`);
			const correctPattern = await readFile(`${__dirname}/../../data/16313739661670634666L.csv`, 'utf8');
			expect(response.split('\n')).toEqual(correctPattern.split('\n'));
		});
	});
});

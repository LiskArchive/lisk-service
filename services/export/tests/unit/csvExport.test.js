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
const moment = require('moment');

const {
	getAddressFromParams,
	getToday,
	normalizeTransaction,
	parseTransactionsToCsv,
	transactionsToCSV,
} = require('../../shared/csvExport');

const {
	generateExcpectedCsv,
	tokenTransfer,
} = require('../constants/csvExport');

const config = require('../../config');
const fieldMappings = require('../../shared/csvFieldMappings');

describe('CSV export utils', () => {
	describe('getAddressFromParams', () => {
		const address = 'lskeqretdgm6855pqnnz69ahpojk5yxfsv2am34et';
		const publicKey = 'b7fdfc991c52ad6646159506a8326d4203c868bd3f16b8043c8e4e034346e581';

		it('return address from address in params', async () => {
			const result = getAddressFromParams({ address });
			expect(result).toBe(address);
		});

		it('return address from publicKey in params', async () => {
			const result = getAddressFromParams({ publicKey });
			expect(result).toBe(address);
		});
	});

	describe('getToday', () => {
		it(`returns current date in '${config.csv.dateFormat}' format`, async () => {
			const today = getToday();
			expect(today).toBe(moment().format(config.csv.dateFormat));
		});
	});

	describe('normalizeTransaction', () => {
		it('returns a transaction normalized to be converted to CSV', async () => {
			const normalizedTx = normalizeTransaction(
				tokenTransfer.toOther.sender,
				tokenTransfer.toOther.transaction,
			);
			const expectedFields = Object.values(fieldMappings).map((v) => v.value);
			expect(Object.keys(normalizedTx)).toEqual(expect.arrayContaining(expectedFields));
		});
	});

	describe('parseTransactionsToCsv', () => {
		it('returns transactions as CSV', async () => {
			const csv = parseTransactionsToCsv(tokenTransfer.toOther.transaction);
			const expectedTx = {};
			Object.values(fieldMappings).forEach((v) => {
				expectedTx[`${v.label}`] = tokenTransfer.toOther.transaction[v.value] || null;
			});
			expect(csv).toBe(generateExcpectedCsv(expectedTx, config.csv.delimiter));
		});
	});

	describe('transactionsToCSV', () => {
		const newline = '\n';

		it('returns transactions as CSV', async () => {
			const transactionList = [tokenTransfer.toOther.transaction];
			const csv = transactionsToCSV(transactionList);
			expect(csv).toContain(newline);
			const lines = csv.split(newline);
			// 1 header, #rows from transactionList
			expect(lines.length).toBe(transactionList.length + 1);

			const normalizedTx = normalizeTransaction(
				tokenTransfer.toOther.sender,
				tokenTransfer.toOther.transaction,
			);
			const replacedKeysTx = {};
			Object.entries(normalizedTx).forEach(([k, v]) => {
				const [entry] = fieldMappings.filter(e => e.value === k);
				replacedKeysTx[`${entry.label}`] = v;
			});
			expect(csv).toBe(generateExcpectedCsv(replacedKeysTx, config.csv.delimiter));
		});

		it('adds duplicate entry for self-token-transfer transactions and returns as CSV', async () => {
			const transactionList = [tokenTransfer.toSelf.transaction];
			const initialTxCount = transactionList.length;
			const csv = transactionsToCSV(transactionList);
			expect(csv).toContain(newline);
			const lines = csv.split(newline);
			// 1 header, #rows from transactionList, 1 row from the duplicate
			expect(transactionList.length).toBeGreaterThan(initialTxCount);
			expect(lines.length).toBe(initialTxCount + 2);
		});
	});
});

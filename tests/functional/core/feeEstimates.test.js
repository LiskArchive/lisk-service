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
const { EMAcalc } = require("../../../services/core/shared/core");

describe("Fee estimation tests", () => {
	describe("getTransactionInstanceByType", () => {
		it("", async () => {});
	});

	describe("calculateBlockSize", () => {
		it("", async () => {});
	});

	describe("calculateWeightedAvg", () => {
		it("", async () => {});
	});

	describe("calulateAvgFeePerByte", () => {
		it("", async () => {});
	});

	describe("calculateFeePerByte", () => {
		it("", async () => {});
	});

	describe("EMA computation", () => {
		it("With 0 offset", async () => {
			const feePerByte = {
				low: 3,
				med: 4,
				high: 5,
			};
			const prevFeeEstPerByte = {};

			const response = await EMAcalc(feePerByte, prevFeeEstPerByte);
			expect(response).toEqual({
				feeEstLow: 0.10217999999999999,
				feeEstMed: 0.13624,
				feeEstHigh: 0.1703,
			});
		});

		it("With non-zero offset", async () => {
			const feePerByte = {
				low: 0,
				med: 301.9,
				high: 2364.4,
			};
			const prevFeeEstPerByte = {
				low: 0,
				med: 1000,
				high: 2000,
			};

			const response = await EMAcalc(feePerByte, prevFeeEstPerByte);
			expect(response).toEqual({
				feeEstLow: 0,
				feeEstMed: 976.222714,
				feeEstHigh: 2012.411464,
			});
		});
	});
});

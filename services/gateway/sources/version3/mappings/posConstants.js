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
module.exports = {
	factorSelfStakes: '=,number',
	maxLengthName: '=,number',
	maxNumberSentStakes: '=,number',
	maxNumberPendingUnlocks: '=,number',
	failSafeMissedBlocks: '=,number',
	failSafeInactiveWindow: '=,number',
	punishmentWindow: '=,number',
	roundLength: '=,number',
	minWeightStandby: '=,string',
	numberActiveValidators: '=,number',
	numberStandbyValidators: '=,number',
	posTokenID: '=,string',
	maxBFTWeightCap: '=,number',
	commissionIncreasePeriod: '=,number',
	maxCommissionIncreaseRate: '=,number',
	extraCommandFees: {
		validatorRegistrationFee: 'data.validatorRegistrationFee,string',
	},
};

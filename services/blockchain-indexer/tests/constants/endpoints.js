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
const registeredEndpoints = [
	'auth_getAuthAccount',
	'auth_isValidNonce',
	'auth_isValidSignature',
	'auth_getMultiSigRegMsgSchema',
	'auth_sortMultisignatureGroup',
	'auth_getMultiSigRegMsgTag',
	'dynamicReward_getDefaultRewardAtHeight',
	'dynamicReward_getAnnualInflation',
	'dynamicReward_getRewardTokenID',
	'dynamicReward_getExpectedValidatorRewards',
	'fee_getMinFeePerByte',
	'fee_getFeeTokenID',
	'interoperability_getChainAccount',
	'interoperability_getAllChainAccounts',
	'interoperability_getChannel',
	'interoperability_getOwnChainAccount',
	'interoperability_getTerminatedStateAccount',
	'interoperability_getTerminatedOutboxAccount',
	'interoperability_getRegistrationFee',
	'interoperability_getMinimumMessageFee',
	'interoperability_getChainValidators',
	'interoperability_isChainIDAvailable',
	'interoperability_isChainNameAvailable',
	'legacy_getLegacyAccount',
	'pos_getAllValidators',
	'pos_getValidator',
	'pos_getStaker',
	'pos_getConstants',
	'pos_getPoSTokenID',
	'pos_getClaimableRewards',
	'pos_getLockedReward',
	'pos_getLockedStakedAmount',
	'pos_getValidatorsByStake',
	'pos_getPendingUnlocks',
	'pos_getRegistrationFee',
	'pos_getExpectedSharedRewards',
	'random_isSeedRevealValid',
	'random_setHashOnion',
	'random_getHashOnionSeeds',
	'random_hasHashOnion',
	'random_getHashOnionUsage',
	'token_getBalance',
	'token_getBalances',
	'token_getTotalSupply',
	'token_getSupportedTokens',
	'token_isSupported',
	'token_getEscrowedAmounts',
	'token_getInitializationFees',
	'token_hasUserAccount',
	'token_hasEscrowAccount',
	'validators_validateBLSKey',
	'validators_getValidator',
];

const engineEndpoints = [
	{
		name: 'chain_getBlockByHeight',
		request: {
			$id: '/lisk/chain/getBlockByHeightRequest',
			type: 'object',
			required: ['height'],
			properties: {
				height: {
					type: 'integer',
					minimum: 0,
				},
			},
		},
	},
	{
		name: 'system_getNodeInfo',
		request: null,
	},
];

const allRegisteredEndpoints = engineEndpoints
	.map(e => e.name)
	.concat(registeredEndpoints);

module.exports = {
	registeredEndpoints,
	engineEndpoints,
	allRegisteredEndpoints,
};

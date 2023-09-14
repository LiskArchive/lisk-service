const mockTxRequest = {
	transaction: {
		module: 'token',
		command: 'transfer',
		nonce: '1',
		senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
		params: {
			tokenID: '0000000000000000',
			amount: '100000000000',
			receivingChainID: '00000001',
			recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			data: '',
		},
		id: 'd96c777b67576ddf4cd933a97a60b4311881e68e3c8bef1393ac0020ec8a506c',
	},
};

const mockTransferCrossChainTxRequest = {
	transaction: {
		module: 'token',
		command: 'transferCrossChain',
		fee: '100000',
		nonce: '1',
		senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
		params: {
			tokenID: '0200000000000000',
			amount: '100000000000',
			receivingChainID: '02000000',
			recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			data: '',
			messageFee: '10000000',
			messageFeeTokenID: '0200000000000000',
		},
		id: '0f77248481c050fcf4f88ef7b967548452869879137364df3b33da09cc419395',
	},
};

const mockInteroperabilitySubmitMainchainCrossChainUpdateTxRequest = {
	transaction: {
		module: 'interoperability',
		command: 'submitMainchainCrossChainUpdate',
		fee: '100000',
		nonce: '1',
		senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
		params: {
			tokenID: '0200000000000000',
			amount: '100000000000',
			receivingChainID: '02000000',
			recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			data: '',
			messageFee: '10000000',
			messageFeeTokenID: '0200000000000000',
			sendingChainID: '04000000',
			certificate: '0a2020dbc6528e1ff1d6d052adcb5c64f6e4a2e89e734fad19f03f8e872de1c4819d109f16189a8cffa5062220e6cec02a3ed23506a23149e4458b3477555c97f06726c01727a63baff29a6d4b2a2066300d82c14fe864b94177ebbfe7aa80ac9a07ef9fac31a02cee97b8221cb36132011f3a608d58b25b9924fbed599a663efca3186f4a14546f4ac0405c8d4744893e3e09cd7855922fdb82b1e4a318a0c7f38fa0ec0423e8865f5338f6437969e06c97b7d4bc822c92e13d00cfb9497cb37c26b1417e683d6284b225a98185ca1713119889',
			activeValidatorsUpdate: {
				blsKeysUpdate: [],
				bftWeightsUpdate: [],
				bftWeightsUpdateBitmap: '',
			},
			certificateThreshold: 4,
			inboxUpdate: {
				crossChainMessages: [],
				messageWitnessHashes: [],
				outboxRootWitness: {
					bitmap: '',
					siblingHashes: [],
				},
			},
		},
	},
};

const mockInteroperabilitySubmitMainchainCrossChainUpdateTxResult = {
	data: {
		transaction: {
			fee: {
				tokenID: '0400000000000000',
				minimum: '166000',
			},
			params: {},
		},
	},
	meta: {
		breakdown: {
			fee: {
				minimum: {
					byteFee: '167000',
					additionalFees: {},
				},
			},
		},
	},
};

const mockInteroperabilityRegisterSidechainTxRequest = {
	transaction: {
		module: 'interoperability',
		command: 'registerSidechain',
		fee: '100000',
		nonce: '1',
		senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
		params: {
			chainID: '02001337',
			name: 'minichain',
			sidechainValidators: [
				{
					blsKey: '81819334f20e5669a4ac38047d312112ff07d7a4a5705455204bc25f9360b1be95835ec50db7d7a600a944a3abd69753',
					bftWeight: '1',
				},
				{
					blsKey: '837166d173d699501ab5da3a6fe1e340659efd932d870c6f271cc28119662e22a3f6715b4118c25baeae40ac955b21c1',
					bftWeight: '1',
				},
				{
					blsKey: 'a35a7e57ea1efe4fb8102807a3c896236b696bcf3efb574950cf603bfbc2f104878499b4e20070718562dac0022345a1',
					bftWeight: '1',
				},
				{
					blsKey: 'a889835e7d1d3fd6ab6a3903a6c3a3337d13545fda5f67581d28fa64938d169119e1ff3b825fe3b2a625aa4612e6b78c',
					bftWeight: '1',
				},
				{
					blsKey: 'aed4794dc57abd9cbd67d72705a2dad2d0bf11e8709b2c268bf2d72c219e2945c5e57acbefb9d7906518242de4b1a807',
					bftWeight: '1',
				},
			],
			sidechainCertificateThreshold: '5',
		},
	},
};

const mockInteroperabilityRegisterSidechainTxResult = {
	data: {
		transaction: {
			fee: {
				tokenID: '0400000000000000',
				minimum: '166000',
			},
			params: {},
		},
	},
	meta: {
		breakdown: {
			fee: {
				minimum: {
					byteFee: '166000',
					additionalFees: {
						chainRegistrationFee: '100000000',
					},
				},
			},
		},
	},
};

const mockTxResult = {
	data: {
		transaction: {
			fee: {
				tokenID: '0400000000000000',
				minimum: '130000',
			},
			params: {},
		},
	},
	meta: {
		breakdown: {
			fee: {
				minimum: {
					byteFee: '160000',
					additionalFees: {
						userAccountInitializationFee: '1',
					},
				},
			},
		},
	},
};

const mockTransferCrossChainTxResult = {
	data: {
		transaction: {
			fee: {
				tokenID: '0400000000000000',
				minimum: '130000',
			},
			params: {
				messageFee: {
					amount: '1',
					tokenID: '0400000000000000',
				},
			},
		},
	},
	meta: {
		breakdown: {
			fee: {
				minimum: {
					byteFee: '160000',
					additionalFees: {},
				},
			},
			params: {
				messageFee: {
					additionalFees: {
						userAccountInitializationFee: '1',
					},
					ccmByteFee: '0',
				},
			},
		},
	},
};

const mockRegisterValidatorTxResult = {
	data: {
		transaction: {
			fee: {
				tokenID: '0400000000000000',
				minimum: '130000',
			},
			params: {},
		},
	},
	meta: {
		breakdown: {
			fee: {
				minimum: {
					byteFee: '160000',
					additionalFees: {
						validatorRegistrationFee: '1',
					},
				},
			},
		},
	},
};

const mockTxsenderAddress = 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad';

const mockTxAuthAccountInfo = {
	data: {
		nonce: '2',
		numberOfSignatures: 0,
		mandatoryKeys: [],
		optionalKeys: [],
	},
};

const mockTxrequestConnector = {
	module: 'token',
	command: 'transfer',
	fee: '100000000',
	nonce: '1',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	signatures: [
		'c7fd1abf9a552fa9c91b4121c87ae2c97cb0fc0aecc87d0ee8b1aa742238eef4a6815ddba31e21144c9652a7bd5c05577ae1100eac34fba43da6fc4879b8f206',
	],
	params: {
		tokenID: '0000000000000000',
		amount: '100000000000',
		recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
		data: '',
	},
	id: 'd96c777b67576ddf4cd933a97a60b4311881e68e3c8bef1393ac0020ec8a506c',
	size: 167,
	minFee: '166000',
};

const mockTransferCrossChainTxrequestConnector = {
	module: 'token',
	command: 'transferCrossChain',
	fee: '100000000',
	nonce: '1',
	senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
	signatures: [
		'c7fd1abf9a552fa9c91b4121c87ae2c97cb0fc0aecc87d0ee8b1aa742238eef4a6815ddba31e21144c9652a7bd5c05577ae1100eac34fba43da6fc4879b8f206',
	],
	params: {
		tokenID: '0000000000000000',
		amount: '100000000000',
		recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
		receivingChainID: '02000000',
		data: '',
		messageFee: '10000000',
		messageFeeTokenID: '0200000000000000',
	},
	id: 'd96c777b67576ddf4cd933a97a60b4311881e68e3c8bef1393ac0020ec8a506c',
	size: 167,
	minFee: '166000',
};

const mockRegisterValidatorTxrequestConnector = {
	transaction: {
		module: 'pos',
		command: 'registerValidator',
		fee: '100000000',
		nonce: '1',
		senderPublicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
		signatures: [
			'c7fd1abf9a552fa9c91b4121c87ae2c97cb0fc0aecc87d0ee8b1aa742238eef4a6815ddba31e21144c9652a7bd5c05577ae1100eac34fba43da6fc4879b8f206',
		],
		params: {
			name: 'test_validator',
			blsKey: 'a984c12c76b42b2d6ef2cae7ce09951e7d71eb160abdedbfba51bd216c42f2f3eda04a2e57b2cfb01768b94419b65190',
			proofOfPossession: 'ab7661489a290464310c8615b387117ff27a209742e0e711f22d5ba3e7480de4eda293a651a48be9ae57b569a977d65e101179e1fcd73ab32c6c3fef4a1aedc7119e90eb2af7a3450399b15743c145bb49fdcb61b333817345c1d46769005d04',
			generatorKey: 'b9c0211c8eb94ee61154a4dc7af36d2a36e14dd1644b43aa250186bfa107ce6b',
		},
		id: 'd96c777b67576ddf4cd933a97a60b4311881e68e3c8bef1393ac0020ec8a506c',
		size: 167,
		minFee: '166000',
	},
};

const posConstants = {
	data: {
		factorSelfStakes: 10,
		maxLengthName: 20,
		maxNumberSentStakes: 10,
		maxNumberPendingUnlocks: 20,
		failSafeMissedBlocks: 50,
		failSafeInactiveWindow: 260000,
		punishmentWindowStaking: 241920,
		punishmentWindowSelfStaking: 725760,
		roundLength: 103,
		minWeightStandby: '100000000000',
		numberActiveValidators: 101,
		numberStandbyValidators: 2,
		posTokenID: '0400000000000000',
		maxBFTWeightCap: 1000,
		commissionIncreasePeriod: 260000,
		maxCommissionIncreaseRate: 500,
		useInvalidBLSKey: false,
		baseStakeAmount: '1000000000',
		lockingPeriodStaking: 26000,
		lockingPeriodSelfStaking: 260000,
		reportMisbehaviorReward: '100000000',
		reportMisbehaviorLimitBanned: 5,
		weightScaleFactor: '100000000000',
		extraCommandFees: {
			validatorRegistrationFee: '1000000000',
		},
	},
	meta: {},
};

const mockTxFeeEstimate = {
	blockHeight: 4756,
	low: 0,
	med: 0,
	high: 0,
	updated: 1687337100,
	blockID: 'a00ea9194baa4667078fd65372b8010c88aba6adb8b1cdc28f234798205d2d53',
	feeTokenID: '0400000000000000',
	minFeePerByte: 1000,
};

const mockEscrowAccountExistsRequestConnector = {
	exists: {
		escrowAccountExists: true,
	},
};

const mockAuthAccountInfo = { numberOfSignatures: 0, mandatoryKeys: [], optionalKeys: [] };

const mockAuthInfoForMultisigAccount = {
	...mockAuthAccountInfo,
	mandatoryKeys: [
		'4d9c2774f1c98accafb8554c164ce5689f66a32d768b64a9f694d5bd51dc1b4d',
	],
	optionalKeys: [
		'b1353e202043ead83083ce8b7eb3a9d04fb49cdcf8c73c0e81567d55d114c076',
	],
};

module.exports = {
	mockTxRequest,
	mockTransferCrossChainTxRequest,
	mockTxResult,
	mockTxsenderAddress,
	mockTxAuthAccountInfo,
	mockTxrequestConnector,
	mockTxFeeEstimate,
	posConstants,
	mockEscrowAccountExistsRequestConnector,
	mockTransferCrossChainTxrequestConnector,
	mockTransferCrossChainTxResult,
	mockAuthAccountInfo,
	mockAuthInfoForMultisigAccount,
	mockRegisterValidatorTxrequestConnector,
	mockRegisterValidatorTxResult,

	mockInteroperabilitySubmitMainchainCrossChainUpdateTxRequest,
	mockInteroperabilitySubmitMainchainCrossChainUpdateTxResult,
	mockInteroperabilityRegisterSidechainTxRequest,
	mockInteroperabilityRegisterSidechainTxResult,
};

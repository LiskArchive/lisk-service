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
const _ = require('lodash');
const {
	utils: { getRandomBytes },
} = require('@liskhq/lisk-cryptography');

const { validator } = require('@liskhq/lisk-validator');

const {
	HTTP,
	Exceptions: { ValidationException, InvalidParamsException },
	Logger,
} = require('lisk-service-framework');

const { resolveMainchainServiceURL, resolveChannelInfo, getCurrentChainID } = require('./interoperability');
const { dryRunTransactions } = require('./transactionsDryRun');
const { tokenHasUserAccount, getTokenConstants } = require('./token');
const { getSchemas } = require('./schemas');

const {
	MODULE,
	COMMAND,
	EVENT,
	LENGTH_BYTE_SIGNATURE,
	LENGTH_BYTE_ID,
	DEFAULT_NUM_OF_SIGNATURES,
} = require('../../constants');

const { getLisk32AddressFromPublicKey } = require('../../utils/account');
const { parseToJSONCompatObj, parseInputBySchema } = require('../../utils/parser');
const { requestConnector } = require('../../utils/request');
const config = require('../../../config');

const { getPosConstants } = require('./pos/constants');
const { getInteroperabilityConstants } = require('./interoperability/constants');
const { getFeeEstimates } = require('./feeEstimates');

const DEFAULT_MESSAGE_FEE = '10000000';
const DEFAULT_MESSAGE_FEE_TOKEN_ID = '0000000000000000';

const logger = Logger();

const { bufferBytesLength: BUFFER_BYTES_LENGTH } = config.estimateFees;

const OPTIONAL_TRANSACTION_PROPERTIES = Object.freeze({
	FEE: {
		propName: 'fee',
		defaultValue: () => '0',
	},
	SIGNATURES: {
		propName: 'signatures',
		defaultValue: (params) => new Array(params.numberOfSignatures)
			.fill()
			.map(() => getRandomBytes(LENGTH_BYTE_SIGNATURE).toString('hex')),
	},
	ID: {
		propName: 'id',
		defaultValue: () => getRandomBytes(LENGTH_BYTE_ID).toString('hex'),
	},
});

const OPTIONAL_TRANSACTION_PARAMS_PROPERTIES = Object.freeze({
	MESSAGE_FEE: {
		propName: 'messageFee',
		defaultValue: () => '0',
	},
	MESSAGE_FEE_TOKEN_ID: {
		propName: 'messageFeeTokenID',
		defaultValue: (params) => params.messageFeeTokenID,
	},
});

const mockOptionalProperties = (inputObject, inputObjectOptionalProps, additionalParams) => {
	Object
		.values(inputObjectOptionalProps)
		.forEach(optionalPropInfo => {
			if (!(optionalPropInfo.propName in inputObject)) {
				inputObject[optionalPropInfo.propName] = optionalPropInfo.defaultValue(additionalParams);
			}
		});

	return inputObject;
};

const filterOptionalProps = (inputObject, optionalProps) => _.omit(inputObject, optionalProps);

const mockTransaction = async (_transaction, numberOfSignatures) => {
	if (!_transaction) throw new Error('No transaction passed.');

	const transactionCopy = _.cloneDeep(_transaction);
	const txWithRequiredProps = filterOptionalProps(
		transactionCopy,
		Object.values(OPTIONAL_TRANSACTION_PROPERTIES).map(optionalProp => optionalProp.propName),
	);

	const mockedTransaction = mockOptionalProperties(
		txWithRequiredProps,
		OPTIONAL_TRANSACTION_PROPERTIES,
		{ numberOfSignatures },
	);

	const channelInfo = txWithRequiredProps.module === MODULE.TOKEN
		&& txWithRequiredProps.command === COMMAND.TRANSFER_CROSS_CHAIN
		? await resolveChannelInfo(txWithRequiredProps.params.receivingChainID)
		: {};

	const { messageFeeTokenID } = channelInfo;

	const mockedTransactionParams = messageFeeTokenID
		? mockOptionalProperties(
			filterOptionalProps(
				txWithRequiredProps.params,
				Object
					.values(OPTIONAL_TRANSACTION_PARAMS_PROPERTIES)
					.map(optionalProp => optionalProp.propName),
			),
			OPTIONAL_TRANSACTION_PARAMS_PROPERTIES,
			{ messageFeeTokenID },
		)
		: txWithRequiredProps.params;

	return { ...mockedTransaction, params: mockedTransactionParams };
};

const getNumberOfSignatures = async (address) => {
	try {
		const authAccountInfo = await requestConnector('getAuthAccount', { address });
		const numberOfSignatures = (authAccountInfo.mandatoryKeys.length
			+ authAccountInfo.optionalKeys.length) || DEFAULT_NUM_OF_SIGNATURES;
		return numberOfSignatures;
	} catch (error) {
		logger.warn(`Error while retrieving auth information for the account ${address}.`);
		return DEFAULT_NUM_OF_SIGNATURES;
	}
};

const getCcmBuffer = async (transaction) => {
	if (transaction.module !== MODULE.TOKEN
		|| transaction.command !== COMMAND.TRANSFER_CROSS_CHAIN) return null;

	// TODO: Add error handling
	const { data: { events } } = await dryRunTransactions({ transaction, skipVerify: true });
	const ccmSendSuccess = events.find(event => event.name === EVENT.CCM_SEND_SUCCESS);

	// Encode CCM (required to calculate CCM length)
	const { ccm } = ccmSendSuccess.data;
	const ccmEncoded = await requestConnector('encodeCCM', { ccm });
	const ccmBuffer = Buffer.from(ccmEncoded, 'hex');

	return ccmBuffer;
};

const calcDynamicFeeEstimates = (estimatePerByte, minFee, size) => ({
	low: BigInt(minFee) + (BigInt(estimatePerByte.low) * BigInt(size)),
	medium: BigInt(minFee) + (BigInt(estimatePerByte.med) * BigInt(size)),
	high: BigInt(minFee) + (BigInt(estimatePerByte.high) * BigInt(size)),
});

const calcAdditionalFees = async (transaction) => {
	const additionalFees = {
		fee: {},
		params: {},
		total: BigInt(0),
	};

	if (transaction.module === MODULE.TOKEN) {
		const { tokenID } = transaction.params;

		if (transaction.command === COMMAND.TRANSFER) {
			const { data: { isExists } } = await tokenHasUserAccount({
				tokenID,
				address: transaction.params.recipientAddress,
			});

			if (!isExists) {
				const { data: { extraCommandFees } } = await getTokenConstants();
				additionalFees.fee = {
					userAccountInitializationFee: extraCommandFees.userAccountInitializationFee,
				};
				additionalFees.total += BigInt(extraCommandFees.userAccountInitializationFee);
			}
		} else if (transaction.command === COMMAND.TRANSFER_CROSS_CHAIN) {
			const mainchainServiceURL = await resolveMainchainServiceURL();
			const { data: appMetadataResponse } = await HTTP
				.get(`${mainchainServiceURL}/api/v3/blockchain/apps/meta?chainID=${transaction.params.receivingChainID}`);

			if (!appMetadataResponse || !appMetadataResponse.data
				|| appMetadataResponse.data.length === 0) {
				throw new ValidationException(`Application off-chain metadata is not available for the chain: ${transaction.params.receivingChainID}.`);
			}

			const { data: [{ serviceURLs: [{ http: receivingServiceURL }] }] } = appMetadataResponse;
			const { data: tokenConstantsResponse } = await HTTP.get(`${receivingServiceURL}/api/v3/token/constants`);
			const { data: { extraCommandFees } } = tokenConstantsResponse;

			// Check if escrow account exists only when tokenID specified in the params is a native token
			const currentChainID = await getCurrentChainID();
			if (tokenID.startsWith(currentChainID)) {
				const { exists: escrowAccountExists } = await requestConnector('tokenHasEscrowAccount', { tokenID, escrowChainID: transaction.params.receivingChainID });
				if (!escrowAccountExists) {
					additionalFees.fee = {
						escrowAccountInitializationFee: extraCommandFees.escrowAccountInitializationFee,
					};
					additionalFees.total += BigInt(extraCommandFees.escrowAccountInitializationFee);
				}
			}

			// Check if user account exists on the receiving chain
			const { data: accountExistsResponse } = await HTTP
				.get(`${receivingServiceURL}/api/v3/token/account/exists?tokenID=${tokenID}&address=${transaction.params.recipientAddress}`);
			const { data: { isExists: userAccountExists } } = accountExistsResponse;
			if (!userAccountExists) {
				additionalFees.params = {
					messageFee: {
						userAccountInitializationFee: extraCommandFees.userAccountInitializationFee,
					},
				};
			}
		}
	} else if (transaction.module === MODULE.POS) {
		if (transaction.command === COMMAND.REGISTER_VALIDATOR) {
			const posConstants = await getPosConstants();
			additionalFees.fee = {
				validatorRegistrationFee: posConstants.data.validatorRegistrationFee,
			};
			additionalFees.total += BigInt(posConstants.data.validatorRegistrationFee);
		}
	} else if (transaction.module === MODULE.INTEROPERABILITY) {
		if ([COMMAND.REGISTER_MAINCHAIN, COMMAND.REGISTER_SIDECHAIN].includes(transaction.command)) {
			const interoperabilityConstants = await getInteroperabilityConstants();
			additionalFees.fee = {
				chainRegistrationFee: interoperabilityConstants.data.chainRegistrationFee,
			};
			additionalFees.total += BigInt(interoperabilityConstants.data.chainRegistrationFee);
		}
	}

	return additionalFees;
};

const validateTransactionParams = async transaction => {
	// Mock optional values if not present before schema validation.
	if (transaction.module === MODULE.TOKEN
		&& transaction.command === COMMAND.TRANSFER_CROSS_CHAIN) {
		if (!('messageFee' in transaction.params)) {
			transaction.params.messageFee = DEFAULT_MESSAGE_FEE;
		}

		if (!('messageFeeTokenID' in transaction.params)) {
			transaction.params.messageFeeTokenID = DEFAULT_MESSAGE_FEE_TOKEN_ID;
		}
	}

	const allSchemas = await getSchemas();
	const txCommand = allSchemas.data.commands.find(e => e.moduleCommand === `${transaction.module}:${transaction.command}`);

	if (!txCommand || !txCommand.schema) {
		throw new ValidationException(`${transaction.module}:${transaction.command} is not a valid transaction.`);
	}

	const txParamsSchema = txCommand.schema;
	const parsedTxParams = parseInputBySchema(transaction.params, txParamsSchema);

	try {
		validator.validate(txParamsSchema, parsedTxParams);
	} catch (err) {
		throw new InvalidParamsException(err);
	}
};

const estimateTransactionFees = async params => {
	const estimateTransactionFeesRes = {
		data: {
			transaction: { params: {} },
		},
		meta: {},
	};

	await validateTransactionParams(params.transaction);

	const senderAddress = getLisk32AddressFromPublicKey(params.transaction.senderPublicKey);
	const numberOfSignatures = await getNumberOfSignatures(senderAddress);

	const trxWithMockProps = await mockTransaction(params.transaction, numberOfSignatures);
	const additionalFees = await calcAdditionalFees(trxWithMockProps);
	let formattedTransaction = await requestConnector(
		'formatTransaction',
		{ transaction: trxWithMockProps, additionalFee: additionalFees.total.toString() },
	);
	const feeEstimatePerByte = getFeeEstimates();

	// Calculate message fee for cross-chain transfers
	if (
		params.transaction.module === MODULE.TOKEN
		&& params.transaction.command === COMMAND.TRANSFER_CROSS_CHAIN
	) {
		// Calculate message fee
		const ccmBuffer = await getCcmBuffer({
			...formattedTransaction,
			fee: formattedTransaction.minFee,
		});
		const ccmLength = ccmBuffer.length;
		const channelInfo = await resolveChannelInfo(params.transaction.params.receivingChainID);

		const ccmByteFee = BigInt(ccmLength) * BigInt(channelInfo.minReturnFeePerByte);
		const totalMessageFee = additionalFees.params.messageFee
			? ccmByteFee + BigInt(additionalFees.params.messageFee.userAccountInitializationFee)
			: ccmByteFee;

		estimateTransactionFeesRes.data.transaction.params = {
			messageFee: {
				tokenID: channelInfo.messageFeeTokenID,
				amount: totalMessageFee,
			},
		};

		// Calculate the transaction size and minFee with updated params, for higher accuracy
		formattedTransaction = await requestConnector(
			'formatTransaction',
			{
				transaction: {
					...trxWithMockProps,
					params: {
						...trxWithMockProps.params,
						messageFeeTokenID: channelInfo.messageFeeTokenID,
						messageFee: totalMessageFee.toString(),
					},
				},
				additionalFee: additionalFees.total.toString(),
			},
		);

		// Add params to meta
		estimateTransactionFeesRes.meta.breakdown = {
			...estimateTransactionFeesRes.meta.breakdown,
			params: {
				messageFee: {
					ccmByteFee,
					additionalFees: BUFFER_BYTES_LENGTH
						? {
							...additionalFees.params.messageFee,
							bufferBytes: BigInt(BUFFER_BYTES_LENGTH * feeEstimatePerByte.minFeePerByte),
						} : {
							...additionalFees.params.messageFee,
						},
				},
			},
		};
	}

	const { minFee, size } = formattedTransaction;

	// TODO: Remove BUFFER_BYTES_LENGTH support after RC is tagged
	const estimatedMinFee = BigInt(minFee)
		+ BigInt(BUFFER_BYTES_LENGTH * feeEstimatePerByte.minFeePerByte);

	// Populate the response with transaction minimum fee information
	estimateTransactionFeesRes.data = {
		...estimateTransactionFeesRes.data,
		transaction: {
			...estimateTransactionFeesRes.data.transaction,
			fee: {
				tokenID: feeEstimatePerByte.feeTokenID,
				minimum: estimatedMinFee.toString(),
			},
		},
	};
	estimateTransactionFeesRes.meta = {
		...estimateTransactionFeesRes.meta,
		breakdown: {
			...estimateTransactionFeesRes.meta.breakdown,
			fee: {
				minimum: {
					byteFee: (BigInt(size) * BigInt(feeEstimatePerByte.minFeePerByte)).toString(),
					additionalFees: BUFFER_BYTES_LENGTH
						? {
							...additionalFees.fee,
							bufferBytes: BigInt(BUFFER_BYTES_LENGTH * feeEstimatePerByte.minFeePerByte),
						}
						: { ...additionalFees.fee },
				},
			},
		},
	};

	// Add priority only when the priority fee values are non-zero
	const { low, med, high } = feeEstimatePerByte;
	if (low !== 0 || med !== 0 || high !== 0) {
		const dynamicFeeEstimates = calcDynamicFeeEstimates(
			feeEstimatePerByte, estimatedMinFee, size);

		estimateTransactionFeesRes.transaction.fee.priority = dynamicFeeEstimates;
	}

	return parseToJSONCompatObj(estimateTransactionFeesRes);
};

module.exports = {
	estimateTransactionFees,

	// Export for the unit tests
	calcDynamicFeeEstimates,
	mockTransaction,
	calcAdditionalFees,
	filterOptionalProps,
	getNumberOfSignatures,
	validateTransactionParams,
};

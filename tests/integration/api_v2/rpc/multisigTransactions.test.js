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
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	jsonRpcEnvelopeSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	multisigTransactionSchema,
} = require('../../../schemas/api_v2/multisigTransaction.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v2`;
const getTransactions = async params => request(wsRpcUrl, 'get.transactions.multisig', params);
const createMultisigTransaction = async params => request(wsRpcUrl, 'post.transactions.multisig', params);
const updateMultisigTransaction = async params => request(wsRpcUrl, 'patch.transactions.multisig', params);
const rejectMultisigTransaction = async params => request(wsRpcUrl, 'delete.transactions.multisig', params);

describe('Multisignature Transactions API', () => {
	let refTransaction;
	let registerMultisigAccountTrx;
	let tokenTransferTrx;
	let delegateRegistrationTrx;
	let votingTrx;
	let unlockingTrx;
	let pomTrx;

	beforeAll(async () => {
		const response1 = await getTransactions({ limit: 1 });
		[refTransaction] = response1.result.data;

		registerMultisigAccountTrx = {
			nonce: '0',
			senderPublicKey: '2f3dfb37326c6c42af28d04e6b6a76865430ade3d26969f1b86e3987b500bbaf',
			moduleAssetId: '4:0',
			asset: {
				mandatoryKeys: [
					'2f3dfb37326c6c42af28d04e6b6a76865430ade3d26969f1b86e3987b500bbaf',
					'520bd47952f98ba475bba6aafa926f730f8ddbcb4c362a826be1ac6618be3d3e',
				],
				optionalKeys: [
					'd1e267fd2cfdba3ee1f657c75a88f3d41aae3ca98d82286a21e4be12aaa6a388',
				],
				numberOfSignatures: 3,
			},
			fee: '414000',
			// expires: Math.floor(Date.now() / 1000) + 31556952,
			signatures: [{
				publicKey: '2f3dfb37326c6c42af28d04e6b6a76865430ade3d26969f1b86e3987b500bbaf',
				signature: 'b7ec0e305d7f8f8ca533eda1576f0c39e6ab256979b2e10a1ca2dd1db89228b4bac0dd63a469852ceafea3b8ed8c38e327aab420694c35f1324f19fc37db0702',
			}],
		};

		tokenTransferTrx = {
			nonce: '1',
			senderPublicKey: '2f3dfb37326c6c42af28d04e6b6a76865430ade3d26969f1b86e3987b500bbaf',
			moduleAssetId: '2:0',
			asset: {
				amount: '2000000000',
				recipientAddress: 'lskhyoacr3xdfjy24mnzagb6tyt7wkqf2s6fezxn8',
				data: '',
			},
			fee: '217000',
			// expires: Math.floor(Date.now() / 1000) + 31556952,
			signatures: [{
				publicKey: '2f3dfb37326c6c42af28d04e6b6a76865430ade3d26969f1b86e3987b500bbaf',
				signature: 'b80f5d3d14063e7a74a8005ab6cc80ae04335731a4afb43a6a5e59f17b9f99254cac196ffba714fb1634b6d7b97d2e27a7f6d033f3b0f314ed099e0bbb7adc05',
			}],
		};

		delegateRegistrationTrx = {
			nonce: '2',
			senderPublicKey: '2f3dfb37326c6c42af28d04e6b6a76865430ade3d26969f1b86e3987b500bbaf',
			moduleAssetId: '5:0',
			asset: {
				username: 'multisig_delegateacc',
			},
			fee: '1000268000',
			// expires: Math.floor(Date.now() / 1000) + 31556952,
			signatures: [{
				publicKey: '2f3dfb37326c6c42af28d04e6b6a76865430ade3d26969f1b86e3987b500bbaf',
				signature: '9105041cb8dc0d20def295cfbf1fa10e242e121ca82de5d63d5ae457e1a6a81c8ae92d2ca445b369bc73aec9838f10f779b0f5788220713a5e7f0bfb103ace0c',
			}],
		};

		votingTrx = {
			nonce: '0',
			senderPublicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
			moduleAssetId: '5:1',
			asset: {
				votes: [{
					delegateAddress: '',
					amount: '',
				}],
			},
			fee: '1000000',
			// expires: Math.floor(Date.now() / 1000) + 31556952,
			signatures: [{
				publicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
				signature: '72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a',
			}],
		};

		unlockingTrx = {
			nonce: '0',
			senderPublicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
			moduleAssetId: '5:2',
			asset: {
				unlockObjects: [{
					delegateAddress: '',
					amount: '',
					unvoteHeight: '',
				}],
				numberOfSignatures: 3,
			},
			fee: '1000000',
			// expires: Math.floor(Date.now() / 1000) + 31556952,
			signatures: [{
				publicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
				signature: '72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a',
			}],
		};

		pomTrx = {
			nonce: '0',
			senderPublicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
			moduleAssetId: '5:3',
			asset: {
				header1: {
					version: 2,
					timestamp: 1629113026,
					height: 260,
					previousBlockId: '49805b699dbbdea4cae184bfdee4d226fe104aa829b6dfbe5ae739479034d250',
					transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
					generatorPublicKey: 'fc65777c1d4c00f1af5880c23ba7f60cd3bf84d1bf5c697abc4ffe17cf7acac0',
					reward: '0',
					asset: {
						maxHeightPreviouslyForged: 0,
						maxHeightPrevoted: 250,
						seedReveal: 'e51d43685e396db67ac63a076729a895',
					},
					signature: '0020ac0be05fd805b56403074ea4f1251f451940eb59975ef601673276672b67e66fdeb24c3720cbe517c6f159a9459e7e266ea05d6c47416b30bcf67d89fe0a',
				},
				header2: {
					version: 2,
					timestamp: 1636363196,
					height: 510,
					previousBlockId: '7faf12b9abdc9f78421c77b8cf6e1f5b0f57cccf69fa4c1fc6ef5bc7e843b969',
					transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
					generatorPublicKey: 'fc65777c1d4c00f1af5880c23ba7f60cd3bf84d1bf5c697abc4ffe17cf7acac0',
					reward: '0',
					asset: {
						maxHeightPreviouslyForged: 0,
						maxHeightPrevoted: 250,
						seedReveal: '396bef641b5c32c199dc7e6e7819a370',
					},
					signature: '3fdc9f15e53106bd8a5999e96929a96e19994427e9c549a175bf850cb09c6f0a19d511af5aeddbd70608d185761184e7fc81ccd9c95e710e5c66e6efdd89630b',
				},
			},
			fee: '1000000',
			// expires: Math.floor(Date.now() / 1000) + 31556952,
			signatures: [{
				publicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
				signature: '72c9b2aa734ec1b97549718ddf0d4737fd38a7f0fd105ea28486f2d989e9b3e399238d81a93aa45c27309d91ce604a5db9d25c9c90a138821f2011bc6636c60a',
			}],
		};
	});

	describe('Add multisignature transactions to the pool (POST)', () => {
		it('Account registration', async () => {
			const response = await createMultisigTransaction(registerMultisigAccountTrx);
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(multisigTxn => {
				expect(multisigTxn).toMap(multisigTransactionSchema);
				expect(multisigTxn.moduleAssetId).toBe(registerMultisigAccountTrx.moduleAssetId);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Token transfer', async () => {
			const response = await createMultisigTransaction(tokenTransferTrx);
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(multisigTxn => {
				expect(multisigTxn).toMap(multisigTransactionSchema);
				expect(multisigTxn.moduleAssetId).toBe(tokenTransferTrx.moduleAssetId);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Delegate registration', async () => {
			const response = await createMultisigTransaction(delegateRegistrationTrx);
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(multisigTxn => {
				expect(multisigTxn).toMap(multisigTransactionSchema);
				expect(multisigTxn.moduleAssetId).toBe(delegateRegistrationTrx.moduleAssetId);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Voting', async () => {
			const response = await createMultisigTransaction(votingTrx);
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(multisigTxn => {
				expect(multisigTxn).toMap(multisigTransactionSchema);
				expect(multisigTxn.moduleAssetId).toBe(votingTrx.moduleAssetId);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Unlocking', async () => {
			const response = await createMultisigTransaction(unlockingTrx);
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(multisigTxn => {
				expect(multisigTxn).toMap(multisigTransactionSchema);
				expect(multisigTxn.moduleAssetId).toBe(unlockingTrx.moduleAssetId);
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Proof of Misbehavior', async () => {
			const response = await createMultisigTransaction(pomTrx);
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(multisigTxn => {
				expect(multisigTxn).toMap(multisigTransactionSchema);
				expect(multisigTxn.moduleAssetId).toBe(pomTrx.moduleAssetId);
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Update multisignature transactions in the pool (PATCH)', () => {
		it('Add a new valid signature', async () => {
			const signaturePatch = {
				serviceId: refTransaction.serviceId,
				signatures: [{
					publicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf341b',
					signature: 'a3733254aad600fa787d6223002278c3400be5e8ed4763ae27f9a15b80e20c22ac9259dc926f4f4cabdf0e4f8cec49308fa8296d71c288f56b9d1e11dfe81e07',
				}],
			};

			const response = await updateMultisigTransaction(signaturePatch);
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(multisigTxn => {
				expect(multisigTxn).toMap(multisigTransactionSchema);
				expect(multisigTxn.serviceId).toBe(signaturePatch.serviceId);
				expect(
					multisigTxn.signatures.some(entry => entry.signature === signaturePatch.signatures[0].signature),
				).toBeTruthy();
			});
			expect(result.meta).toMap(metaSchema);
		});

		xit('Add a new invalid signature', async () => {
			const signaturePatch = {
				serviceId: refTransaction.serviceId,
				signatures: [{
					publicKey: '968ba2fa993ea9dc27ed740da0daf49eddd740dbd7cb1cb4fc5db3a20baf3410',
					signature: 'a3733254aad600fa78inc223002278c3400be5e8ed4763ae27f9a15b80e20c22ac9259dc926f4f4cabdf0e4f8cec49308fa8296d71c288f56b9d1e11dfe81e07',
				}],
			};

			const response = await updateMultisigTransaction(signaturePatch);
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(multisigTxn => {
				expect(multisigTxn).toMap(multisigTransactionSchema);
				expect(multisigTxn.serviceId).toBe(signaturePatch.serviceId);
				expect(
					multisigTxn.signatures.some(entry => entry.signature === signaturePatch.signatures[0].signature),
				).toBeTruthy();
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve multisignature transactions from the pool', () => {
		it('returns list of multisignature transactions', async () => {
			const response = await getTransactions({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(transaction => expect(transaction).toMap(multisigTransactionSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns multisignature transactions with known serviceId', async () => {
			const response = await getTransactions({ serviceId: refTransaction.serviceId });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(transaction => expect(transaction)
				.toMap(multisigTransactionSchema, { serviceId: refTransaction.serviceId }));
			expect(result.meta).toMap(metaSchema);
		});

		xit('returns multisignature transactions with known address', async () => {
			const response = await getTransactions({ address: 'lskdwsyfmcko6mcd357446yatromr9vzgu7eb8y99' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(transaction => expect(transaction)
				.toMap(multisigTransactionSchema, { address: refTransaction.address }));
			expect(result.meta).toMap(metaSchema);
		});

		it('returns multisignature transactions with known publicKey', async () => {
			const response = await getTransactions({ publicKey: refTransaction.senderPublicKey });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(transaction => expect(transaction)
				.toMap(multisigTransactionSchema, { senderPublicKey: refTransaction.senderPublicKey }));
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Reject multisignature transactions in the transaction pool', () => {
		it('Existing transaction', async () => {
			const response = await rejectMultisigTransaction({
				serviceId: refTransaction.serviceId,
				signatures: tokenTransferTrx.signatures,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBe(1);
			result.data.forEach(multisigTxn => {
				expect(multisigTxn).toMap(multisigTransactionSchema);
				expect(multisigTxn.rejected).toBe(true);
			});
			expect(result.meta).toMap(metaSchema);
		});
	});
});

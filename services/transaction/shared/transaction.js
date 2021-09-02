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
const {
	Exceptions: { ServiceUnavailableException },
} = require('lisk-service-framework');

const mysqlIndex = require('./indexdb/mysql');
const MultisigTxIndexSchema = require('./schema/multisignature');

const getMultiSigTxIndex = () => mysqlIndex('MultisignatureTx', MultisigTxIndexSchema);

const createMultisigTransaction = async () => {
	const multisigTxDB = await getMultiSigTxIndex();
	// Replace when implementation for create multisignature is done
	const transaction = {
		data: [{
			serviceId: 'dc3e23b-f840-4a73-b793',
			nonce: '1',
			senderPublicKey: '3e50549cd4d98760064ff2fe51801afba4e5e8623335275cece0eeff8495a81b',
			asset: {
				numberOfSignatures: 2,
				mandatoryKeys: [
					'228c865b903dab827342aa6611676bf883e982e7cd467c9168a7966cdabb391c',
					'9bc945f92141d5e11e97274c275d127dc7656dda5c8fcbf1df7d44827a732664',
				],
				optionalKeys: [],
			},
			moduleAssetId: '4:0',
			fee: '314000',
			expires: 1629276090,
			signatures: [
				{
					publicKey: '228c865b903dab827342aa6611676bf883e982e7cd467c9168a7966cdabb391c',
					address: 'lskj6t9e89orwxnqqou5vhobfvdfudxy7v2f5t9te',
					signature: '5bdf4cbc97a3681e1305e953910b351fa2eb8615ce1b1c13b90911c73ba79d11fa254b5fe1bdc69cacdddb4fa9ec910518d5249e6f9f36a48ae1f6725a27650f',
					accountRole: 'mandatoryAccount',
				},
				{
					publicKey: '9bc945f92141d5e11e97274c275d127dc7656dda5c8fcbf1df7d44827a732664',
					address: 'lskhszrdpk5yzngd885cvsvsuxcko7trsvdpn2moz',
					signature: '5bdf4cbc97a3681e1305e953910b351fa2eb8615ce1b1c13b90911c73ba79d11fa254b5fe1bdc69cacdddb4fa9ec910518d5249e6f9f36a48ae1f6725a27650f',
					accountRole: 'mandatoryAccount',
				},
			],
		}],
		meta: {
			count: 1, Offset: 0, total: 1,
		},
	};

	await multisigTxDB.upsert(transaction);
	if (!transaction.data.length) throw new ServiceUnavailableException('Service is not ready yet');

	return transaction;
};

module.exports = {
	createMultisigTransaction,
};

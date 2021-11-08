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
const { hash } = require('@liskhq/lisk-cryptography');
const { getBytes } = require('@liskhq/lisk-transactions');

const { getHexAddressFromBase32 } = require('./accountUtils');
const { getAssetSchema } = require('./validators');

const requestRpc = require('./rpcBroker');

const computeServiceId = transaction => {
	const {
		nonce, senderPublicKey, moduleAssetId, fee, asset,
	} = transaction;

	const serviceId = hash(Buffer.from([nonce, senderPublicKey, moduleAssetId, fee, JSON.stringify(asset)]), 'hex');
	return serviceId.toString('hex');
};

const convertToCoreTransaction = transaction => {
	const {
		moduleAssetId,
		nonce,
		fee,
		senderPublicKey,
		asset,
		signatures,
	} = transaction;

	// TODO: Use constant mappings for moduleAssetId comparisons and break into a separate method
	if (moduleAssetId === '2:0') {
		asset.recipientAddress = getHexAddressFromBase32(asset.recipientAddress);
	} else if (moduleAssetId === '4:0') {
		asset.mandatoryKeys = asset.mandatoryKeys.map(k => Buffer.from(k, 'hex'));
		asset.optionalKeys = asset.optionalKeys.map(k => Buffer.from(k, 'hex'));
	} else if (moduleAssetId === '5:1') {
		asset.votes = asset.votes.map(a => Buffer.from(a, 'hex'));
	} else if (moduleAssetId === '5:2') {
		asset.unlockObjects = asset.unlockObjects
			.map(u => ({ ...u, delegateAddress: getHexAddressFromBase32(u.delegateAddress) }));
	}

	const [moduleID, assetID] = moduleAssetId.split(':');
	const coreTransaction = {
		moduleID,
		assetID,
		nonce,
		fee,
		senderPublicKey: Buffer.from(senderPublicKey, 'hex'),
		asset,
		signatures: signatures.map(s => Buffer.from(s, 'hex')),
	};

	return coreTransaction;
};

const broadcastTransaction = coreTransaction => {
	const {
		data: [{ schema: txAssetSchema }],
	} = await getAssetSchema(`${coreTransaction.moduleID}:${coreTransaction.assetID}`);

	const txBytes = getBytes(txAssetSchema, coreTransaction);
	return requestRpc('core.transactions.post', { transaction: txBytes });
};

module.exports = {
	computeServiceId,
	convertToCoreTransaction,
	broadcastTransaction,
};

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
const MODULE_ASSET_ID_TOKEN_TRANSFER = '2:0';
const MODULE_ASSET_ID_RECLAIM_TRANSACTION = '1000:0';

const beddowsToLsk = (beddows) => (beddows / 10 ** 8).toFixed(8);

const normalizeTransactionAmount = (address, tx) => {
	if (!('amount' in tx.asset)) return null;

	const isReclaim = tx.moduleAssetId === MODULE_ASSET_ID_RECLAIM_TRANSACTION;
	const isTokenTransfer = tx.moduleAssetId === MODULE_ASSET_ID_TOKEN_TRANSFER;

	const isSender = address === tx.senderId;
	const isRecipient = isTokenTransfer && address === tx.asset.recipient.address;

	const sign = (isSender && isReclaim) || (isRecipient && isTokenTransfer)
		? 1 : -1;
	return beddowsToLsk(sign * tx.asset.amount);
};

const normalizeTransactionFee = (address, tx) => {
	const isTokenTransfer = tx.moduleAssetId === MODULE_ASSET_ID_TOKEN_TRANSFER;
	if (!isTokenTransfer) return beddowsToLsk(tx.fee);

	const isRecipient = address === tx.asset.recipient.address;
	return isRecipient ? beddowsToLsk(0) : beddowsToLsk(tx.fee);
};

module.exports = {
	beddowsToLsk,
	normalizeTransactionAmount,
	normalizeTransactionFee,
};

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
const { Logger } = require('lisk-service-framework');

const logger = Logger();

// Module specific constants
const moduleID = 0;
const assetID_actionType0 = 0;
const assetID_actionType1 = 0;

// Custom implementation
const processActionType0Transaction = async (tx) => Promise.resolve(tx);
const processActionType1Transaction = async (tx) => Promise.resolve(tx);

const processTransaction = async (tx) => {
    if (tx.moduleID !== moduleID) {
        throw Error(`Invoked transaction processor for module: ${moduleName} (${moduleID}) for transaction: module: ${tx.moduleName} (${tx.moduleID}), asset: ${tx.assetName} (${tx.assetID})`);
    }

    logger.debug(`Inside processTransaction for module: ${moduleName} (${moduleID}), asset: ${tx.assetName} (${tx.assetID})`);

    // Custom implementation invocation based on the assetID
    if (tx.assetID === assetID_actionType0) {
        return processActionType0Transaction(tx);
    } else if (tx.assetID === assetID_actionType1) {
        return processActionType1Transaction(tx);
    }

    logger.warn(`Transaction processor for module: ${tx.moduleName} (${tx.moduleID}), asset: ${tx.assetName} (${tx.assetID}) is not defined`);
};

const updateAccount = async (tx) => {
    logger.debug(`Inside updateAccount for moduleId: ${tx.moduleID}, assetId: ${tx.assetID}`);
};

module.exports = {
    processTransaction,
    updateAccount,
};

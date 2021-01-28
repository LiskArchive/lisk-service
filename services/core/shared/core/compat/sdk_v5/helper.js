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
const BluebirdPromise = require('bluebird');

const { getAccounts } = require('./accounts');
const { getRegisteredModuleAssets } = require('../common');

const availableLiskModuleAssets = getRegisteredModuleAssets();

const indexAccountbyBlock = async blocks => {
    await BluebirdPromise.map(
        blocks,
        async block => {
            await getAccounts({ address: block.generatorAddress });
        },
        { concurrency: blocks.length },
    );
};

const indexAccountbyTxs = async txs => {
    await BluebirdPromise.map(
        txs,
        async tx => {
            await getAccounts({ address: tx.senderId });
        },
        { concurrency: txs.length },
    );
};

const resolveModuleAsset = (moduleAssetVal) => {
    const [module, asset] = moduleAssetVal.split(':');
    let response;
    if (!Number.isNaN(Number(module)) && !Number.isNaN(Number(asset))) {
        const [{ name }] = (availableLiskModuleAssets
            .filter(moduleAsset => moduleAsset.id === moduleAssetVal));
        response = name;
    } else {
        const [{ id }] = (availableLiskModuleAssets
            .filter(moduleAsset => moduleAsset.name === moduleAssetVal));
        response = id;
    }
    if ([undefined, null, '']
        .includes(response)) return new Error(`Incorrect moduleAsset ID/Name combination: ${moduleAssetVal}`);
    return response;
};

module.exports = {
    indexAccountbyBlock,
    indexAccountbyTxs,
    resolveModuleAsset,
};

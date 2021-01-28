/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
const { getAccounts } = require('./accounts');

const getDelegates = async () => {
    const delegates = {
        data: [],
        meta: {},
    };

    const punishmentHeight = 780000;
    const response = await getAccounts({ isDelegate: true });
    if (response.data) delegates.data = response.data;
    if (response.meta) delegates.meta = response.meta;

    delegates.data.map(delegate => {
        delegate.account = {};
        delegate.account = {
            address: delegate.address,
            publicKey: delegate.publicKey,
        };
        delegate.pomHeights = delegate.dpos.delegate.pomHeights
            .sort((a, b) => a - b).reverse().slice(0, 5)
            .map(height => ({ start: height, end: height + punishmentHeight }));
        return delegate;
    });

    return delegates;
};

module.exports = {
    getDelegates,
};

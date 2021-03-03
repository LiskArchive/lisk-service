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
const mysqlIndex = require('../../../indexdb/mysql');
const blocksIndexSchema = require('./schema/blocks');
const { getIsSyncFullBlockchain, getIndexReadyStatus } = require('../common');

const getBlocksIndex = () => mysqlIndex('blocks', blocksIndexSchema);

const getDelegates = async (params) => {
    const blocksDB = await getBlocksIndex();
    const delegates = {
        data: [],
        meta: {},
    };
    const punishmentHeight = 780000;
    const response = await getAccounts({ isDelegate: true, limit: params.limit });
    if (response.data) delegates.data = response.data;
    if (response.meta) delegates.meta = response.meta;

    await BluebirdPromise.map(
        delegates.data, async delegate => {
            delegate.account = {};
            delegate.account = {
                address: delegate.address,
                publicKey: delegate.publicKey,
            };
            if (getIsSyncFullBlockchain() && getIndexReadyStatus()) {
                const [{ total }] = await blocksDB.find({
                    generatorPublicKey: delegate.publicKey, aggregate: 'reward',
                });
                delegate.rewards = total;
                delegate.producedBlocks = await blocksDB.count({
                    generatorPublicKey: delegate.publicKey,
                });
            }
            const adder = (acc, curr) => BigInt(acc) + BigInt(curr.amount);
            const totalVotes = delegate.dpos.sentVotes.reduce(adder, BigInt(0));
            const selfVote = delegate.dpos.sentVotes
                .find(vote => vote.delegateAddress === delegate.address);
            const selfVoteAmount = selfVote ? BigInt(selfVote.amount) : BigInt(0);
            const cap = selfVoteAmount * BigInt(10);

            delegate.totalVotesReceived = totalVotes - selfVoteAmount;
            const voteWeight = BigInt(totalVotes) > cap ? cap : delegate.totalVotesReceived;

            delegate.delegateWeight = voteWeight;
            delegate.username = delegate.dpos.delegate.username;
            delegate.balance = delegate.token.balance;
            delegate.pomHeights = delegate.dpos.delegate.pomHeights
                .sort((a, b) => b - a).slice(0, 5)
                .map(height => ({ start: height, end: height + punishmentHeight }));
            return delegate;
        },
        { concurrency: delegates.data.length },
    );

    return delegates;
};

module.exports = {
    getDelegates,
};

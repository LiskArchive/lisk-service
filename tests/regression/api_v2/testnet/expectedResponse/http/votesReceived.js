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
const votesReceived = {
	data: {
		account: {
			address: 'lskk4cgd3e57wp8kumgacpa2rppbefjo3xez2b7s6',
			username: 'andzios2',
			votesReceived: 33,
		},
		votes: [
			{
				address: 'lskk4cgd3e57wp8kumgacpa2rppbefjo3xez2b7s6',
				amount: '-2750000000000',
				username: 'andzios2',
			},
			{
				address: 'lskgxvhewkr67kuwsj27o35ph85use8vvrvyg3nn9',
				amount: '-1750000000000',
			},
			{
				address: 'lskoavozzbcbxt8buuwe9qk46pap5vdr84npydpd4',
				amount: '-2000000000000',
				username: 'andzios',
			},
			{
				address: 'lskoavozzbcbxt8buuwe9qk46pap5vdr84npydpd4',
				amount: '150000000000',
				username: 'andzios',
			},
			{
				address: 'lskgxvhewkr67kuwsj27o35ph85use8vvrvyg3nn9',
				amount: '150000000000',
			},
			{
				address: 'lskk4cgd3e57wp8kumgacpa2rppbefjo3xez2b7s6',
				amount: '500000000000',
				username: 'andzios2',
			},
			{
				address: 'lskoavozzbcbxt8buuwe9qk46pap5vdr84npydpd4',
				amount: '600000000000',
				username: 'andzios',
			},
			{
				address: 'lskgxvhewkr67kuwsj27o35ph85use8vvrvyg3nn9',
				amount: '450000000000',
			},
			{
				address: 'lskk4cgd3e57wp8kumgacpa2rppbefjo3xez2b7s6',
				amount: '500000000000',
				username: 'andzios2',
			},
			{
				address: 'lskgxvhewkr67kuwsj27o35ph85use8vvrvyg3nn9',
				amount: '450000000000',
			},
		],
	},
	meta: {
		count: 10,
		offset: 0,
		total: 33,
	},
};

const noVotesReceived = {
	data: {
		account: {
			address: 'lskk6o6ucuzx2sar3nppb39uq8y6yzuarummmkw2e',
			username: 'bzh',
			votesReceived: 0,
		},
	},
	meta: {
		count: 0,
		offset: 0,
		total: 0,
	},
};

module.exports = {
	votesReceived,
	noVotesReceived,
};

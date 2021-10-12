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
const votesSent = {
	jsonrpc: '2.0',
	result: {
		data: {
			account: {
				address: 'lsks3nfpf5bt6xa5qo73ftgaersg89t8fx5ov9d9z',
				username: 'gr33ndrag0n',
				votesUsed: 1,
			},
			votes: [
				{
					address: 'lsks3nfpf5bt6xa5qo73ftgaersg89t8fx5ov9d9z',
					amount: '250000000000000',
					username: 'gr33ndrag0n',
				},
			],
		},
		meta: {
			count: 1,
			total: 1,
		},
	},
	id: 1,
};

const noVotesSent = {
	jsonrpc: '2.0',
	result: {
		data: {
			account: {
				address: 'lskk4cgd3e57wp8kumgacpa2rppbefjo3xez2b7s6',
				username: 'andzios2',
				votesUsed: 0,
			},
		},
		meta: {
			count: 0,
			total: 0,
		},
	},
	id: 1,
};

module.exports = {
	votesSent,
	noVotesSent,
};

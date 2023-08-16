/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

// TODO: Propulate data after indexing.
const getNFTs = async () => ({
	data: [
		{
			id: '0000000000000000000000000000000000',
			nft: {
				chainID: '00000000',
				collectionID: '10000000',
				index: 1,
			},
			owner: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
			attributesArray: [{
				module: 'customModule',
				attributes: 'represent as a string',
			}],
			lockingModule: 'customModule', // Module name that locked the NFT
			isNftEscrowerd: true,
			escrowedChainID: '04000002', // optional
		},
	],
	meta: {
		count: 10,
		offset: 20,
		total: 1023,
	},
});
module.exports = {
	getNFTs,
};

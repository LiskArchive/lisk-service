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
const blocks = [
	{
		version: 2,
		timestamp: 1668685948,
		height: 15,
		previousBlockID: 'ecd7dd76778e558bce1d891029ddbec14ff61b58f255366aad9b0edae91eab6f',
		stateRoot: 'dcf9badce634516121b167dbfc5f38c18f1b553ca7226333abaa643a44563030',
		assetRoot: '7cf1a34dd0a9ee4b9b523c1d7b283885bcbcb611d67abdf09740e4ab811fa8d8',
		eventRoot: '85bc35bbb2e462529a16a0e5f316b61274065fa4d474c000615c92ac317eb650',
		transactionRoot: '3f84c4fc1ea0756e03f166871719556d6437d12f0908d6e3846dce54f2cc9c73',
		validatorsHash: '1a450b4a730015a6ffc4d6af31c6e94a29e578bd5cbc969ecf47432967c4983b',
		generator: {
			address: 'lsko469zfpojsv6zpm3amgo9b2aj24kswrwvmsjun',
			name: 'genesis_100',
			publicKey: '7fb87fd7fdfef8037d9b6ca705d17000b9f639b4c7aa6f13383d178c783bbdfd',
		},
		aggregateCommit: {
			height: 0,
			aggregationBits: '',
			certificateSignature: '',
		},
		generatorAddress: 'lsko469zfpojsv6zpm3amgo9b2aj24kswrwvmsjun',
		maxHeightPrevoted: 0,
		maxHeightGenerated: 0,
		impliesMaxPrevotes: true,
		signature: '82e8916fc8a839518cb9e2a2c7b092c40e7d0ade90de8ec99925efc1a1480927d51dc2c889f755e0eef5425689be6edb2f2cbe726fcbb60aaebf7f5c24b52809',
		id: 'c1c7c28f5b123135cb5a25f210390f200cd0ed7cc901c0b5997f084e2998c9cc',
		totalBurnt: '0',
		totalForged: '0',
		isFinal: false,
		reward: 0,
	},
	{
		version: 2,
		timestamp: 1693909420,
		height: 136,
		previousBlockID: '39eca1dc8d865bb3d831a5a3579d535e368536ad9c6b197acb1571ccf720b85c',
		eventRoot: '85bc35bbb2e462529a16a0e5f316b61274065fa4d474c000615c92ac317eb650',
		transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		assetRoot: '55fc3a918f838d609cdecaacf6507331d30b72a27a1e38928372f0dd89097d66',
		stateRoot: '94d5ef8e2dda50119afef87c9d40e0b9531cc32e7d4f50dc972239c09c5e6fc3',
		validatorsHash: '1a450b4a730015a6ffc4d6af31c6e94a29e578bd5cbc969ecf47432967c4983b',
		generator: {
			address: 'lskx6f4vp5n9vmdwdkf7fynov42tzugsn29sj545s',
			name: 'genesis_98',
			publicKey: '40737d025fe4989c3909b8df7f7df12c526631803ec85a91f7b05fe430730b5c',
		},
		aggregateCommit: {
			height: 0,
			aggregationBits: '',
			certificateSignature: '',
		},
		generatorAddress: 'lskx6f4vp5n9vmdwdkf7fynov42tzugsn29sj545s',
		maxHeightPrevoted: 0,
		maxHeightGenerated: 0,
		impliesMaxPrevotes: true,
		signature: 'fdbcd50af2298cd5635c7925a63811297ab80aac588dac394ce73b16eafa9cd6367b7f5107368d3f109cf0300550d719c0d2643f36d57883b5776e2a74da130f',
		id: '92bc032502b98d2638efb27958ce42fb5b9afc6436e71109bb636c4464d896fbx',
		totalBurnt: '0',
		totalForged: '0',
		isFinal: false,
		reward: 0,
	},
];

module.exports = {
	blocks,
};

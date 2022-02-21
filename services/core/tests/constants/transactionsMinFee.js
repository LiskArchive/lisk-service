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

/* eslint-disable camelcase */
const transactionType_2_0 = {
	moduleID: 2,
	assetID: 0,
	nonce: BigInt('0'),
	fee: BigInt('200000'),
	senderPublicKey: Buffer.from('e7578b785d52d269e0e3cb5b6e14eaa4d1d26d8eb1e2484b74cd6e8cfd6a0d40', 'hex'),
	asset: {
		amount: BigInt('98329383000'),
		recipientAddress: Buffer.from('ec7619fc7ce58ee9ecefdc1498a3db7ae8789450', 'hex'),
		data: '',
	},
	signatures: [
		Buffer.from('80596e90ab92e002c9c91a53667094f83ad5b2bf709a4b9fdbfce5392a9487edd5fd35e0fa34b576ea63034b41f1a76f01588851e644e033519da60e11c8c008', 'hex'),
	],
	id: '55e92fb474fca13e3a1d0cb746c968ecf7fabbf967269bc55d48289c0a3b24a6',
};

const transactionType_4_0 = {
	moduleID: 4,
	assetID: 0,
	nonce: BigInt('1'),
	fee: BigInt('314000'),
	senderPublicKey: Buffer.from('399caa3a20183ee3cd7d046c5396b71eb055ce7d8df47c6c718b76ef6fa1bac1', 'hex'),
	asset: {
		numberOfSignatures: 2,
		mandatoryKeys: [
			Buffer.from('399caa3a20183ee3cd7d046c5396b71eb055ce7d8df47c6c718b76ef6fa1bac1', 'hex'),
			Buffer.from('ebea49b191809174c5e98953ef7f12dc1b86cd999593e4096c90fc7665840ec8', 'hex'),
		],
		optionalKeys: [],
	},
	signatures: [
		Buffer.from('8d2ce359e9d7e4f98b19d4f0900f2b8bc2043e692ee4b6165c4dc7b613fc0d62c5a8dde6fd8cea3ca7615a4df53dc6461ef6466bba6948b2536f61236856cf0d', 'hex'),
		Buffer.from('8d2ce359e9d7e4f98b19d4f0900f2b8bc2043e692ee4b6165c4dc7b613fc0d62c5a8dde6fd8cea3ca7615a4df53dc6461ef6466bba6948b2536f61236856cf0d', 'hex'),
		Buffer.from('463165fd75c2f16221d3cd669d4093530b8096f850b64db44681c9ea0b54728f7f25ce8c1056e7cd1a349fd91e8629275ba06e8d6f8379723a9383fda76bef01', 'hex'),
	],
	id: '366c1e53b96d03767da1e8e41faf7bb6339a9ac6c8c765e785c22582e3337d74',
};

const transactionType_5_0 = {
	moduleID: 5,
	assetID: 0,
	nonce: BigInt('0'),
	fee: BigInt('1000122000'),
	senderPublicKey: Buffer.from('279bc0ca5830bba271d483124fdd82af109d4bde62240814750dbdbc4039c6c3', 'hex'),
	asset: {
		username: 'fridge',
	},
	signatures: [
		Buffer.from('0db7583da4242bfd00c897349b30fcdab5f7714e8919671683d8c1fcf26c986a9b6025848245ec3005ff31bfd15ff93bfaea7da6d7858c360855f33a4748f805', 'hex'),
	],
	id: '2339841dc8e1266707d3bd60dec0d6469d522941b512890304bdfae4c91a7cab',
};

const transactionType_5_1 = {
	moduleID: 5,
	assetID: 1,
	nonce: BigInt('15'),
	fee: BigInt('143000'),
	senderPublicKey: Buffer.from('99ca30f83d99881399b37a5d86b3c82dbe2fff6822688309bfbd8433b3917d27', 'hex'),
	asset: {
		votes: [
			{
				delegateAddress: Buffer.from('97135ed0faab7ac429a06c8b42dcbec9da8a8945', 'hex'),
				amount: BigInt('40000000000'),
			},
		],
	},
	signatures: [
		Buffer.from('1d7d7f26d2005c8dd6eadcc2b58804b8e1205dc4059d2b4768cb86f985ad151f5aa2ad9681ce39f41c706ebb406f9f1ec49097541d78e859b65df0daf6287b06', 'hex'),
	],
	id: '18455db887c81e0f80e2f33803e4188459c7e5d3834de0b0158d10455c74b848',
};

const transactionType_5_2 = {
	moduleID: 5,
	assetID: 2,
	nonce: BigInt('19'),
	fee: BigInt('184000'),
	senderPublicKey: Buffer.from('459bc9edc8e7485f29fb259f016d94422fd708fe8539ada53ea958d8aca79985', 'hex'),
	asset: {
		unlockObjects: [
			{
				delegateAddress: Buffer.from('37a12683e25e36c123e9483f9b106d95363fde60', 'hex'),
				amount: BigInt('500000000000'),
				unvoteHeight: 17810754,
			},
			{
				delegateAddress: Buffer.from('9f63748a33e8fd3719c78fffb6bc293695c2c06a', 'hex'),
				amount: BigInt('1000000000000'),
				unvoteHeight: 17810754,
			},
		],
	},
	signatures: [
		Buffer.from('23df8bf1426f351c53325c8f850e82435de1b6695c5cb1578f05eee653870a195396779663d343a4d92110fbbf5609c4e838a6d8a2dd3b39e4522f67677dad0a', 'hex'),
	],
	id: '24c296c54971e3c8e35716bfaafd5173e1a37e2fa124a635c8217516d48a2d19',
};

const transactionType_5_3 = {
	moduleID: 5,
	assetID: 3,
	nonce: BigInt('45'),
	fee: BigInt('1000000'),
	senderPublicKey: Buffer.from('d1d951c46376e108bab5e7a9f1dce725bb33f9823442a4a34841b6774bbb5b2f', 'hex'),
	asset: {
		header1: {
			version: 2,
			timestamp: 1642719840,
			height: 17570646,
			previousBlockID: Buffer.from('6afa61a177e4e56785ad9d1c2054afd51ea80eea07ed4cceac45cfbb107357df', 'hex'),
			transactionRoot: Buffer.from('4a0048139004b4ac632364591247f00d5e0999ba19aee9bf1cff11d69041e5ed', 'hex'),
			generatorPublicKey: Buffer.from('eddeb37070a19e1277db5ec34ea12225e84ccece9e6b2bb1bb27c3ba3999dac7', 'hex'),
			reward: BigInt('100000000'),
			asset: {
				maxHeightPreviouslyForged: 17570558,
				maxHeightPrevoted: 17570578,
				seedReveal: Buffer.from('8f64e618d7cdbdb6c4e8ecf94d1b622c', 'hex'),
			},
			signature: Buffer.from('9c1db0929a1c01de5c225af674e39e38cb36ab20521b9e9870a6a7d47337d6feba921ef91e4f77a95fc97df52dc876a501d094a1b9a9388de35eb00705d3760d', 'hex'),
		},
		header2: {
			version: 2,
			timestamp: 1642740560,
			height: 17572148,
			previousBlockID: Buffer.from('c6a19da2895bfaa34532d5cb48effdf7b78dfaf016c674ffecc295abbb62ee37', 'hex'),
			transactionRoot: Buffer.from('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'hex'),
			generatorPublicKey: Buffer.from('eddeb37070a19e1277db5ec34ea12225e84ccece9e6b2bb1bb27c3ba3999dac7', 'hex'),
			reward: BigInt('100000000'),
			asset: {
				maxHeightPreviouslyForged: 17570558,
				maxHeightPrevoted: 17572058,
				seedReveal: Buffer.from('b3e6d72a6d982fd6326b49263a861cfd', 'hex'),
			},
			signature: Buffer.from('f4628fc7b7cc8dd99914819626c9a6e8fa80fb236a048ebd79f2ea7b6d7f23ce04da570d71800cb8d1f87bbed92ba490c25b5b28afa4f6e19f79c5e43d5be10b', 'hex'),
		},
	},
	signatures: [
		Buffer.from('1adb4001dc495518c3527f8d0c4b2505351e95a9313e41a243f62569ef17d12e597d6b9c5c5e53e241136b8e1d49da6404c7f46e9a095fee8ad4d60c385a7000', 'hex'),
	],
	id: 'ea13b45572d4378fc77252222eb4b843da0adc426ee1b98483ac0e81491f2178',
};

const transactionType_1000_0 = {
	moduleID: 1000,
	assetID: 0,
	nonce: BigInt('0'),
	fee: BigInt('118000'),
	senderPublicKey: Buffer.from('cfa8e3d2cf8bbe0e5c1ebeb321afb3acdd4038fcea40c3f4ca2578164a1e3994', 'hex'),
	asset: {
		amount: BigInt('109108506'),
	},
	signatures: [
		Buffer.from('1221cac1c47b90124c655277e9280fb4f8f0ac0aef920faa537591904444ed085d9b8ff32aa3311d0e9fb13b20a1dafbe2ddef23d0db34203aadc89c917b0b0c', 'hex'),
	],
	id: 'a6372f4aece8ff3647399d44ff1679faeefd7571e9a0ce1b618455e29a5dd9b0',
};

const multisig_transactionType_2_0 = {
	moduleID: 2,
	assetID: 0,
	nonce: BigInt('13'),
	fee: BigInt('217000'),
	senderPublicKey: Buffer.from('0cff7751b07124a79d985b376204eebf92d98c9e84639e5f7b7d88e19067f925', 'hex'),
	asset: {
		amount: BigInt('500000000'),
		recipientAddress: Buffer.from('57ea25402b703ab7104f3e7fae13a894b6db887c', 'hex'),
		data: 'Testing',
	},
	signatures: [
		Buffer.from('e57822cd326a6430c48775103935c638ce06001510759549bf46a4a388393a285ee3d9d63cdf32553d6915878eb61afea3a533ca1f4f05947f1671567f952e0d', 'hex'),
		Buffer.from('64bb009d5ce9d8c6fe8e5838fa26453a2ca561253b325ccb92ae12ce0a5b69da9d20b749c71825b1342505a645fd4e4382a81eb00d4adb725b7d9bb93f21350f', 'hex'),
		Buffer.from('', 'hex'),
	],
	id: '62e5b0a9a87561e902a6f6147a34318deec517f0be2b1696b5f1fca489047c71',
};

const multisig_transactionType_4_0 = {
	moduleID: 4,
	assetID: 0,
	nonce: BigInt('1'),
	fee: BigInt('314000'),
	senderPublicKey: Buffer.from('399caa3a20183ee3cd7d046c5396b71eb055ce7d8df47c6c718b76ef6fa1bac1', 'hex'),
	asset: {
		numberOfSignatures: 2,
		mandatoryKeys: [
			Buffer.from('399caa3a20183ee3cd7d046c5396b71eb055ce7d8df47c6c718b76ef6fa1bac1', 'hex'),
			Buffer.from('ebea49b191809174c5e98953ef7f12dc1b86cd999593e4096c90fc7665840ec8', 'hex'),
		],
		optionalKeys: [],
	},
	signatures: [
		Buffer.from('8d2ce359e9d7e4f98b19d4f0900f2b8bc2043e692ee4b6165c4dc7b613fc0d62c5a8dde6fd8cea3ca7615a4df53dc6461ef6466bba6948b2536f61236856cf0d', 'hex'),
		Buffer.from('8d2ce359e9d7e4f98b19d4f0900f2b8bc2043e692ee4b6165c4dc7b613fc0d62c5a8dde6fd8cea3ca7615a4df53dc6461ef6466bba6948b2536f61236856cf0d', 'hex'),
		Buffer.from('463165fd75c2f16221d3cd669d4093530b8096f850b64db44681c9ea0b54728f7f25ce8c1056e7cd1a349fd91e8629275ba06e8d6f8379723a9383fda76bef01', 'hex'),
	],
	id: '366c1e53b96d03767da1e8e41faf7bb6339a9ac6c8c765e785c22582e3337d74',
};

const multisig_transactionType_5_0 = {
	moduleID: 5,
	assetID: 0,
	nonce: BigInt('0'),
	fee: BigInt('1000186000'),
	senderPublicKey: Buffer.from('1222fbc38427a750985338abd9559fa2845299d99353c7ef4e97f66cfadadf2c', 'hex'),
	asset: {
		username: 'kazu',
	},
	signatures: [
		Buffer.from('f853bb05b867b7e2973ee60818923e8e7a15156bbbbe9ba6f95b8a9634dd067894fb981a7b3657313ef366a310d9be4f082d0b2dc137a90374e133999139630e', 'hex'),
		Buffer.from('e3e60018f1a1821c37d5f29ab149aafd366d51cf28aa0f3e044c430edc502f4527bafca09e91c523f1675c0f681286fd0667547fb25642a25850c769c7688005', 'hex'),
	],
	id: 'f959683dd70ea486f20ac11dcf990500fb891fa3585b3b6240b881167d621d58',
};

const multisig_transactionType_5_1 = {
	moduleID: 5,
	assetID: 1,
	nonce: BigInt('100'),
	fee: BigInt('209000'),
	senderPublicKey: Buffer.from('9c8e9ff301267988d94aa3872e025917ea1e2c88366a45eae6c06ab0e285ddde', 'hex'),
	asset: {
		votes: [
			{
				delegateAddress: Buffer.from('2877a05b18c554cd7ce7405c3bb1416c43341672', 'hex'),
				amount: BigInt('-1500000000000'),
			},
		],
	},
	signatures: [
		Buffer.from('8ffdfdf2a0871d65083032e6ecd7456585ce2e4c4581f8cfd7b01fd716195e5288d9f95d0cc2a911a1d2a38c23c09df421d4e3a39b7a166b7bd9beb8cd646e09', 'hex'),
		Buffer.from('0bc5544e8bbdda136536101dae9f548b2053045207ca2cea5bae6f6bb58ac1c4d737bda2a7bf7591220bd1821af4efd077e5894a624e68ab8c3ac1f37398590c', 'hex'),
	],
	id: '3ffaf6a6cc2dceb4de61028ca7a9c40f70fb1d1635b0a0946673c7b48b288eec',
};

const multisig_transactionType_5_2 = {
	moduleID: 5,
	assetID: 2,
	nonce: BigInt('2'),
	fee: BigInt('539000'),
	senderPublicKey: Buffer.from('27e2817256325762fe505cd6a3a4b18386ef594dbfd379bf404dd606cb43e462', 'hex'),
	asset: {
		unlockObjects: [
			{
				delegateAddress: Buffer.from('0912fcd54a38ea386c98c5ce5e5d53f1ea2157fe', 'hex'),
				amount: BigInt('185000000000'),
				unvoteHeight: 17811745,
			},
			{
				delegateAddress: Buffer.from('1a1b74d7e786ee2c1ab2b7950b7d0eff0a59cf4a', 'hex'),
				amount: BigInt('185000000000'),
				unvoteHeight: 17811745,
			},
			{
				delegateAddress: Buffer.from('422e7cddcde0825d91fa017188945080a5cc9fca', 'hex'),
				amount: BigInt('185000000000'),
				unvoteHeight: 17811745,
			},
			{
				delegateAddress: Buffer.from('573574811f0ef76c38ca2beb1b80767710e8d865', 'hex'),
				amount: BigInt('185000000000'),
				unvoteHeight: 17811745,
			},
			{
				delegateAddress: Buffer.from('5d6ecd5a84b59c2927daf66a7d480f773168038c', 'hex'),
				amount: BigInt('185000000000'),
				unvoteHeight: 17811745,
			},
			{
				delegateAddress: Buffer.from('6971ba1493582c37535135eb935b002d345b526e', 'hex'),
				amount: BigInt('185000000000'),
				unvoteHeight: 17811745,
			},
			{
				delegateAddress: Buffer.from('788cf609a8f04cd48b24feb2ccc42512c9fedb08', 'hex'),
				amount: BigInt('185000000000'),
				unvoteHeight: 17811745,
			},
			{
				delegateAddress: Buffer.from('7e72b9ae9ea15e6fc3ea34f509e2d494524cb2cc', 'hex'),
				amount: BigInt('185000000000'),
				unvoteHeight: 17811745,
			},
			{
				delegateAddress: Buffer.from('8f495138833cd09ca7c6f5eaf0104a4297d357be', 'hex'),
				amount: BigInt('185000000000'),
				unvoteHeight: 17811745,
			},
			{
				delegateAddress: Buffer.from('f097e230a06de9e8b096efa5d84a771a28d4db4a', 'hex'),
				amount: BigInt('185000000000'),
				unvoteHeight: 17811745,
			},
		],
	},
	signatures: [
		Buffer.from('2c03c25ad1e69c25bc5b4d0814a32d853bccf4e0b6b022ed5328b0e969a0edae569401c13e521062ddb7f7151a3e29ced4a142f56b2bf5aeb66e70bdec395002', 'hex'),
		Buffer.from('48d973ffc95954754a445cb10b37caa2d2ff014088f7381fc35a496828ace34cdfe0c553dbe29c83fe0f0260f2f189df28a19ad4dae99b5c42b00f8d0be38c06', 'hex'),
	],
	id: '58c61621d215df503e0a64e38ab03867713807d6eb30c496ac17530ce1e095b1',
};

module.exports = {
	transactions: {
		transactionType_2_0,
		transactionType_4_0,
		transactionType_5_0,
		transactionType_5_1,
		transactionType_5_2,
		transactionType_5_3,
		transactionType_1000_0,
		multisig_transactionType_2_0,
		multisig_transactionType_4_0,
		multisig_transactionType_5_0,
		multisig_transactionType_5_1,
		multisig_transactionType_5_2,
	},
	minFees: {
		transactionType_2_0: BigInt('143000'),
		transactionType_4_0: BigInt('244000'),
		transactionType_5_0: BigInt('1000114000'),
		transactionType_5_1: BigInt('112000'),
		transactionType_5_2: BigInt('112000'),
		transactionType_5_3: BigInt('112000'),
		transactionType_1000_0: BigInt('118000'),
		multisig_transactionType_2_0: BigInt('217000'),
		multisig_transactionType_4_0: BigInt('244000'),
		multisig_transactionType_5_0: BigInt('1000180000'),
		multisig_transactionType_5_1: BigInt('178000'),
		multisig_transactionType_5_2: BigInt('178000'),
	},
};

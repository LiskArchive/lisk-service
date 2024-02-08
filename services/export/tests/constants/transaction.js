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
const reclaimTransaction = {
	id: '6cff643daaa2bd1112d1b4591abef3e62f9e4f6e37a260fcd7508ce6a06f061c',
	moduleCommand: 'legacy:reclaimLSK',
	fee: '119000',
	minFee: '165000',
	size: 165,
	nonce: '0',
	block: {
		id: 'c3a515cbfacd65402500ba423710ef9debf87f2877bd9c47d35097a9d4c28b7b',
		height: 424,
		timestamp: 1629456896,
		isFinal: true,
	},
	sender: {
		address: 'lskqz6gpqfu9tb5yc2jtqmqvqp3x8ze35g99u2zfd',
		publicKey: '10bdf57ee21ff657ab617395acab81814c3983f608bf6f0be6e626298225331d',
		name: null,
	},
	signatures: [
		'a639b29d0a28054968bd6185e0785927b0e61b90c9f88a37c9d97adfa3b3d9cef46887b7d13f52f461017ffe11462e1d11506d6904088916d61727cdc23aa503',
	],
	params: {
		amount: '16500000000',
	},
	executionStatus: 'successful',
	index: 0,
};

const tokenTransferTransaction = {
	id: 'd41e8fbb909fdf44ffccef6f5b0fb5edf853f0dcf699243a0a92403d2a4f1d1d',
	moduleCommand: 'token:transfer',
	nonce: '3',
	fee: '167000',
	minFee: '165000',
	size: 165,
	sender: {
		address: 'lskxud8mwmw4et3zhrr6cee9q4d8thhe2b3x6yqdp',
		publicKey: '1a315a7c7ccfb44ee0730f22cac4370307a7ef29710b938cff52e653cac753ad',
		name: null,
	},
	params: {
		tokenID: '0400000000000000',
		amount: '1200000000',
		recipientAddress: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
		data: '',
	},
	block: {
		id: '227c65bb47ba5a061a98ea9c459be750ba4e66a36c68e2c45b096fdeb6bb29fc',
		height: 1745,
		timestamp: 1689785580,
		isFinal: true,
	},
	meta: {
		recipient: {
			address: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
			publicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
			name: 'genesis_0',
		},
	},
	executionStatus: 'successful',
	index: 0,
};

const tokenTransferTransactionSelf = {
	id: 'd41e8fbb909fdf44ffccef6f5b0fb5edf853f0dcf699243a0a92403d2a4f1d1d',
	moduleCommand: 'token:transfer',
	nonce: '3',
	fee: '167000',
	minFee: '165000',
	size: 165,
	sender: {
		address: 'lskxud8mwmw4et3zhrr6cee9q4d8thhe2b3x6yqdp',
		publicKey: '1a315a7c7ccfb44ee0730f22cac4370307a7ef29710b938cff52e653cac753ad',
		name: null,
	},
	params: {
		tokenID: '0400000000000000',
		amount: '1200000000',
		recipientAddress: 'lskxud8mwmw4et3zhrr6cee9q4d8thhe2b3x6yqdp',
		data: '',
	},
	block: {
		id: '227c65bb47ba5a061a98ea9c459be750ba4e66a36c68e2c45b096fdeb6bb29fc',
		height: 1745,
		timestamp: 1689785580,
		isFinal: true,
	},
	meta: {
		recipient: {
			address: 'lskxud8mwmw4et3zhrr6cee9q4d8thhe2b3x6yqdp',
			publicKey: '1a315a7c7ccfb44ee0730f22cac4370307a7ef29710b938cff52e653cac753ad',
			name: 'genesis_0',
		},
	},
	executionStatus: 'successful',
	index: 0,
};

const stakeTransaction = {
	id: 'c8179da88d441e876e0a60a2fb12427ed0d6ea78d50c27df8becde2a0fe0f825',
	moduleCommand: 'pos:stake',
	nonce: '0',
	fee: '20000000',
	minFee: '151000',
	size: 152,
	sender: {
		address: 'lskcgfpjvt23ygspv2fx4s8o3p2dfhm7grmqxpzx3',
		publicKey: '8f2027e3a7416e352aef5f9f204a18f70bb6c75148eb761eaf7d9950038aebb5',
		name: 'genesis_20',
	},
	params: {
		stakes: [
			{
				validatorAddress: 'lskcgfpjvt23ygspv2fx4s8o3p2dfhm7grmqxpzx3',
				amount: '100000000000',
			},
		],
	},
	block: {
		id: '27660fcce66ae954d65042bbfcfb7a7207202d1157525fdcf473c0d1cedc56c9',
		height: 698,
		timestamp: 1689775110,
		isFinal: true,
	},
	executionStatus: 'successful',
	index: 1,
};

const tokenTransferCrossChainTransaction = {
	id: '2ceda7b8ccfaa6c452651e6ba2e0a8acf88350aeeb0cde4da98701419e0657c6',
	moduleCommand: 'token:transferCrossChain',
	nonce: '4',
	fee: '100000000',
	minFee: '217000',
	size: 218,
	sender: {
		address: 'lskguo9kqnea2zsfo3a6qppozsxsg92nuuma3p7ad',
		publicKey: '3972849f2ab66376a68671c10a00e8b8b67d880434cc65b04c6ed886dfa91c2c',
		name: 'genesis_0',
	},
	params: {
		tokenID: '0400000000000000',
		amount: '100000000000',
		receivingChainID: '04000001',
		recipientAddress: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
		data: 'Cross chain transfer',
		messageFee: '10000000',
		messageFeeTokenID: '0400000000000000',
	},
	block: {
		id: '48790249bb8c73c5f74faf8fecf4130ab292fbafcd7eaf8df641981597fa9718',
		height: 215,
		timestamp: 1689691860,
		isFinal: false,
	},
	meta: {
		recipient: {
			address: 'lskyvvam5rxyvbvofxbdfcupxetzmqxu22phm4yuo',
		},
	},
	executionStatus: 'successful',
	index: 1,
};

const posClaimedRewards = {
	id: '732923c6e8780251c1dcd179e3e657827ae9318a6df920de595d743f1ed70a40',
	moduleCommand: 'pos:claimRewards',
	nonce: '92',
	fee: '127000',
	minFee: '127000',
	size: 127,
	block: {
		id: 'd6be2fd9ebd06406122ed971b7638621b8f5104f84b46e21d4067fd28b3db72e',
		height: 21304948,
		timestamp: 1707134570,
		isFinal: true,
	},
	sender: {
		address: 'lskmg3sdmjp4smz6x9k2cuyuwags5ehgtexe4w2ds',
		publicKey: 'f0fda0461215e4e63a68d12c79d293833c32519cfe3a5e01ca08b0a0a7493de5',
		name: null,
	},
	params: {},
	signatures: [
		'd219f9362bd2a6fcd8357bcfdc26b66efade5526407d884e4f34750934965b1f3367f7f71e9ddfd29160f6b101a0136ee456a1b7721519d85fff6d6ca65be401',
	],
	executionStatus: 'successful',
	index: 0,
};

const transferCrossChain = {
	id: '34548b99aa37a5a450712c7e3f1e13b62be872d65dd7a8c1d54859408ca4914b',
	moduleCommand: 'token:transferCrossChain',
	nonce: '41',
	fee: '10000000',
	minFee: '194000',
	size: 195,
	block: {
		id: 'bc62dabae94b2d146a9fb72424b87d65cfdc4b41d57d7e95343a8bd246b74b75',
		height: 21016494,
		timestamp: 1704198870,
		isFinal: true,
	},
	sender: {
		address: 'lsk56p8e53k3kar8epeqwpbxa2yd4urn8ouzhfvgs',
		publicKey: '344c75738c096e4bd94459fe81eba45503382181d003a9d2c8be75a2f38b49fa',
		name: null,
	},
	params: {
		tokenID: '0400000000000000',
		amount: '100000000',
		receivingChainID: '04000002',
		recipientAddress: 'lsk56p8e53k3kar8epeqwpbxa2yd4urn8ouzhfvgs',
		data: '',
		messageFee: '109000',
		messageFeeTokenID: '0400000000000000',
	},
	signatures: [
		'cbe755352a175b11a3dc4ae4b5e890ebc4ce1d5cc11c6dbdf5cf21b19f7605e7845b4650779191fdbfc1a1afe90edc1a049717b60858f140f4ae0ad67e93d505',
	],
	executionStatus: 'successful',
	index: 0,
	meta: {
		recipient: {
			address: 'lsk56p8e53k3kar8epeqwpbxa2yd4urn8ouzhfvgs',
			publicKey: '344c75738c096e4bd94459fe81eba45503382181d003a9d2c8be75a2f38b49fa',
			name: null,
		},
	},
};

const submitMainchainCrossChainUpdate = {
	id: 'd16d1cb5fa32df64988b4ab5de66b7d43c8fbfdaf043aca84d649f914d66189f',
	moduleCommand: 'interoperability: submitMainchainCrossChainUpdate',
	nonce: '140',
	fee: '3000000',
	minFee: '422000',
	size: 423,
	block: {
		id: '5333974cf1763909f6e63e4a419d942ae4a6a0a2f3477e620f214cf23a4c7342',
		height: 21102804,
		timestamp: 1705079500,
		isFinal: true,
	},
	sender: {
		address: 'lskcd7tbbhkyebmg2fhdd4w4omvnfhzp5rb7wmz4d',
		publicKey: 'b5e96c1a5ab6f9d96eb08360cbfe4f1d8826591c515d307b9b9eeb1567a19013',
		name: null,
	},
	params: {
		sendingChainID: '04000000',
		certificate:
			'0a20e38e39a33032916b31c6f092047d6aa4919d88760b9185fe631c19d1669a45fc10f60418f4ac84ad0622204dd143faa3c027e456369f75c89bd32befb9229dfcc3cd0b83ecbbca1e0656a42a2076965cc0331adc28fd8d16e63a64d6520397ee3fb3397da59afe60a506bcd909320dffffffffffffffffffffffff013a60b42c2b251e7621e8fd4915167a8360967860898484f29d0faf1e5536ba74bae59da15de420e209182843f884e6aea1b7078095fbeffdbac4169ac3689d06a49e49abd9a4aa9ee78708b7978e2de477993589ed0d2114d3fca5267da867510502',
		activeValidatorsUpdate: {
			blsKeysUpdate: [],
			bftWeightsUpdate: ['0'],
			bftWeightsUpdateBitmap: '00000000000000000020000000',
		},
		certificateThreshold: '65',
		inboxUpdate: {
			crossChainMessages: [],
			messageWitnessHashes: [],
			outboxRootWitness: {
				bitmap: '',
				siblingHashes: [],
			},
		},
	},
	signatures: [
		'ded5534277972e71ca062b3ac58ce1e6e71fe5f9b5a91c091e5e8ddc879726263c2c6cd23bc1ca1e18f5cdc36767ca243773180ee05caa7bbe724324c20a300d',
	],
	executionStatus: 'failed',
	index: 0,
};

const reportMisbehavior = {
	id: 'ce7082673acce922263e0256e717dc151fe86a88c6827bf53d42038ee387eca1',
	moduleCommand: 'pos:reportMisbehavior',
	nonce: '67',
	fee: '1000000',
	minFee: '789000',
	size: 789,
	block: {
		id: 'a8704e713299fd3e379686261aaffb792ef0f78950a0802dd65d0e7f07bc075c',
		height: 23840061,
		timestamp: 1706374150,
		isFinal: true,
	},
	sender: {
		address: 'lskhtpeyg2944gcjwubrc7vwp52qoshtu4fs9wmfn',
		publicKey: 'd1d951c46376e108bab5e7a9f1dce725bb33f9823442a4a34841b6774bbb5b2f',
		name: 'pom',
	},
	params: {
		header1:
			'080210e691d4ad0618ed81af0b2220f7ce365adcd30b8df395e05de8a423462ad405cb15c1e20e0cb7188ce91a45952a142f2680402c5484860db58e4e4259caed3182bc793220e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8553a2083bf0bd3e2f270aab3d73a79d6e89fc7b7acf688340aa16af3a330d50b43a1454220967365364a7508afd9b9f6fc62b664108e009f45a1af480e3009d70ad999a1214a20729640338fcada3f24103beab6f27b7725ca5cb23da58603073680de42157cdb509b81af0b580060016a2081253514d52a57c27425f7002ef7eb4bdffa9a199037a8cd0bfe16c06142ae85720908c980af0b12001a007a40046e73201f12ec38e37b41d0b46e0af8c35eee296c66c11850093daaf018d25cc1945d387420416f7a4298a7feef1900df54289e3143d0622739234fae182608',
		header2:
			'080210fce7d4ad0618bc8aaf0b22208bb8a469affa254ae2d0120e8de964dfd0b0e4b82f6dc27399cc0c37a90ca8f62a142f2680402c5484860db58e4e4259caed3182bc793220e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8553a20b863a36ba1cd1ae5106829aab159687c538e89451fb74b5cbd6b885590dbabe94220aab8361878bc8e35f1e5cff77817468806c904b3134c26c5f2141d927ba5ff954a20b5297e3a641cf61d79f316fa202643cf8c5f03b1ba2b4cac02c7812cf8f25e9450f189af0b580060016a20d53b9b41c0acd2d90969f6e3f9e3e3519be9b941a284288409fecaf8a190f63a720908b289af0b12001a007a4090f68d23abb5cb688c83c9cecd4636be7424c6aa69e1102e4b341a49aa3df5049f3a01f33fbb0dd864d88e8fe2fad777938fceba3f5ead1133adf6b257011700',
	},
	signatures: [
		'f965d9cd093e8a765b0f8088b04517f7aca91882855a83abe8825f4f06e8c73145572b79607ef1729c390ff97999939be510c2e3da97e0df8b2123c6afdea001',
	],
	executionStatus: 'successful',
	index: 0,
};

module.exports = {
	transactions: {
		reclaim: reclaimTransaction,
		tokenTransfer: tokenTransferTransaction,
		tokenTransferSelf: tokenTransferTransactionSelf,
		tokenTransferCrossChain: tokenTransferCrossChainTransaction,
		stake: stakeTransaction,
		claimedRewards: posClaimedRewards,
		transferCrossChain,
		submitMainchainCrossChainUpdate,
		reportMisbehavior,
	},
};

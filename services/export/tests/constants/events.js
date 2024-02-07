/*
 * LiskHQ/lisk-service
 * Copyright © 2024 Lisk Foundation
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
const tokenMintedEvent = {
	id: '000f293a862a5b5c55f44cba8fb656cdab94ce4ebd99cc9f97329b87a70248f3',
	module: 'token',
	name: 'lock',
	data: {
		address: 'lskbrukhb5ctdodhy8z6any4b6u2qrkugz43w78pr',
		module: 'fee',
		tokenID: '0100000000000000',
		amount: '161000',
		result: 0,
	},
	topics: [
		'041c425c907ba819e64da0166de38fe50ae9de29d9a3fd2bbeda2e89c045917fe3',
		'lskbrukhb5ctdodhy8z6any4b6u2qrkugz43w78pr',
	],
};

const tokenLockedEvent = {
	id: 'e2e8622d572985863166015c62b90ad0c8339f6eb9331eff7eb8011d89882358',
	module: 'token',
	name: 'mint',
	data: {
		address: 'lskywqe2cuw5j9burca4sm6rpfxnxyzksv5r99b9g',
		tokenID: '0100000000000000',
		amount: '131000',
		result: 0,
	},
	topics: ['03', 'lskywqe2cuw5j9burca4sm6rpfxnxyzksv5r99b9g'],
};

const genFeeProcessed = {
	id: 'ab21335d06196f58608c60c77fa2cfc285697a5471d95fa295521d6798d32e5d',
	module: 'fee',
	name: 'generatorFeeProcessed',
	data: {
		senderAddress: 'lskmv6entvj8cnrhfdoa38ojx34pv4rd9q44788r7',
		generatorAddress: 'lskme8ohf9geuno8nwpvdqm8wr8bvz5nzguftwpxp',
		burntAmount: '179000',
		generatorAmount: '21000',
	},
	topics: [
		'04d41e8fbb909fdf44ffccef6f5b0fb5edf853f0dcf699243a0a92403d2a4f1d1d',
		'lskmv6entvj8cnrhfdoa38ojx34pv4rd9q44788r7',
		'lskme8ohf9geuno8nwpvdqm8wr8bvz5nzguftwpxp',
	],
};

const rewardsAssigned = {
	id: '5630ae1886ab96412db5924193ee1782ac4acc72c6196e8eadb0cf8adbef3de2',
	module: 'pos',
	name: 'rewardsAssigned',
	data: {
		stakerAddress: 'lskmg3sdmjp4smz6x9k2cuyuwags5ehgtexe4w2ds',
		validatorAddress: 'lsk26s9p9rb74ygzxayuf9cx6x7x5wuvp2v9yrns7',
		tokenID: '0100000000000000',
		amount: '87694485125',
	},
	topics: [
		'04732923c6e8780251c1dcd179e3e657827ae9318a6df920de595d743f1ed70a40',
		'lskmg3sdmjp4smz6x9k2cuyuwags5ehgtexe4w2ds',
	],
};

const relayerFeeProcessed = {
	id: '40f44afac6097dcec6dfd945000990f0ea95e7a1ad9e86562cb02ee36ee39e4c',
	module: 'interoperability',
	name: 'relayerFeeProcessed',
	data: {
		ccmID: 'e6a22f3c4489ceba8e20eeea0ce617d9c385e92aeb9a710a53eb941d34b5f92e',
		relayerAddress: 'lskmg3sdmjp4smz6x9k2cuyuwags5ehgtexe4w2ds',
		burntAmount: '10000000',
		relayerAmount: '50000',
	},
	topics: ['lskmg3sdmjp4smz6x9k2cuyuwags5ehgtexe4w2ds'],
};

const ccmSendSuccess = {
	id: 'df34de3aa6461285698e023135edf6708e963510048a9be5b5a7acfe1ecd3ac1',
	module: 'interoperability',
	name: 'ccmSendSuccess',
	data: {
		ccm: {
			module: 'token',
			crossChainCommand: 'transferCrossChain',
			nonce: '57',
			fee: '109000',
			sendingChainID: '04000000',
			receivingChainID: '04000002',
			params:
				'0a0801000000000000001080c2d72f1a145a88fb2d14453327d896adc860e711d26123bd9022145a88fb2d14453327d896adc860e711d26123bd902a00',
			status: 0,
		},
	},
	topics: [
		'0434548b99aa37a5a450712c7e3f1e13b62be872d65dd7a8c1d54859408ca4914b',
		'01000000',
		'01000002',
		'5ec6bd1dbbcecaef8edad082cfd333c7cf1fdbfeb248c8a80a236179484d06c8',
	],
};

const transferCrossChain = {
	id: 'f01ba39c143282f7a21e2680b50f7b9b8450afcabc24c35dd72793e389a1bcab',
	module: 'token',
	name: 'transferCrossChain',
	data: {
		senderAddress: 'lsk56p8e53k3kar8epeqwpbxa2yd4urn8ouzhfvgs',
		recipientAddress: 'lsk56p8e53k3kar8epeqwpbxa2yd4urn8ouzhfvgs',
		tokenID: '0400000000000000',
		amount: '100000000',
		receivingChainID: '04000002',
		result: 0,
	},
	topics: [
		'0434548b99aa37a5a450712c7e3f1e13b62be872d65dd7a8c1d54859408ca4914b',
		'lsk56p8e53k3kar8epeqwpbxa2yd4urn8ouzhfvgs',
		'lsk56p8e53k3kar8epeqwpbxa2yd4urn8ouzhfvgs',
		'01000002',
	],
};

const ccmTransfer = {
	id: 'f01ba39c143282f7a21e2680b50f7b9b8450afcabc24c35dd72793e389a1bcab',
	module: 'token',
	name: 'transferCrossChain',
	data: {
		senderAddress: 'lsk56p8e53k3kar8epeqwpbxa2yd4urn8ouzhfvgs',
		recipientAddress: 'lsk56p8e53k3kar8epeqwpbxa2yd4urn8ouzhfvgs',
		tokenID: '0400000000000000',
		amount: '100000000',
		receivingChainID: '04000002',
		result: 0,
	},
	topics: [
		'05d16d1cb5fa32df64988b4ab5de66b7d43c8fbfdaf043aca84d649f914d66189f',
		'lsk56p8e53k3kar8epeqwpbxa2yd4urn8ouzhfvgs',
		'lsk56p8e53k3kar8epeqwpbxa2yd4urn8ouzhfvgs',
	],
};

const accountReclaimed = {
	id: 'fe7ff8cbfd1243f0134271c868c73abf6a726bc9965440fcffdcb4cd03b582ba',
	module: 'legacy',
	name: 'accountReclaimed',
	data: {
		legacyAddress: '15297866638783057016L',
		address: 'lskqz6gpqfu9tb5yc2jtqmqvqp3x8ze35g99u2zfd',
		amount: '100000000',
	},
	topics: [
		'046cff643daaa2bd1112d1b4591abef3e62f9e4f6e37a260fcd7508ce6a06f061c',
		'15297866638783057016L',
		'lskqz6gpqfu9tb5yc2jtqmqvqp3x8ze35g99u2zfd',
	],
};

const validatorPunished = {
	id: 'dae4b1bb546e9bdd15a05432f37ddf42ffcf1ad4dc790cb2f6391e830db49e28',
	module: 'pos',
	name: 'validatorPunished',
	data: {
		address: 'lskmjt3zuxo6rv3oc9qyanppe76hk22m8ca2ra7h5',
		height: 1745,
	},
	topics: [
		'04cd41e8fbb909fdf44ffccef6f5b0fb5edf853f0dcf699243a0a92403d2a4f1d1d',
		'lskmjt3zuxo6rv3oc9qyanppe76hk22m8ca2ra7h5',
	],
};

const tokenTransfer = {
	id: '957c72e2cd0e057c7c251c35bd1149e35e9aa621ef8ab5d016373fe4ec786660',
	module: 'token',
	name: 'transfer',
	data: {
		senderAddress: 'lskmjt3zuxo6rv3oc9qyanppe76hk22m8ca2ra7h5',
		recipientAddress: 'lskmjt3zuxo6rv3oc9qyanppe76hk22m8ca2ra7h5',
		tokenID: '0400000000000000',
		amount: '100000000',
		result: 0,
	},
	topics: [
		'04ce7082673acce922263e0256e717dc151fe86a88c6827bf53d42038ee387eca1',
		'lskmjt3zuxo6rv3oc9qyanppe76hk22m8ca2ra7h5',
		'lskmjt3zuxo6rv3oc9qyanppe76hk22m8ca2ra7h5',
	],
};

module.exports = {
	events: {
		tokenMintedEvent,
		tokenLockedEvent,
		genFeeProcessed,
		rewardsAssigned,
		relayerFeeProcessed,
		ccmSendSuccess,
		transferCrossChain,
		ccmTransfer,
		accountReclaimed,
		validatorPunished,
		tokenTransfer,
	},
};

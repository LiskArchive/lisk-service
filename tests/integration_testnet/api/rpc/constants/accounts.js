const accounts = {
	genesis: {
		address: '16009998050678037905L',
		balance: '-9999989700000000',
		delegate: {},
		knowledge: {},
		multisignatureAccount: {},
		publicKey: '73ec4adbd8f99f0d46794aeda3c3d86b245bd9d27be2b282cdd38ad21988556b',
		secondPublicKey: '',
		transactionCount: {
			incoming: '3',
			outgoing: '1',
		},
	},
	delegate: {
		address: '5201600508578320196L',
		balance: '180575678451785',
		delegate: {
			approval: '88.83',
			missedBlocks: 194,
			producedBlocks: 127987,
			productivity: '99.85',
			rank: 1,
			rewards: '45343200000000',
			username: 'cc001',
			vote: '12522207004079810',
		},
		knowledge: {},
		multisignatureAccount: {},
		publicKey: '473c354cdf627b82e9113e02a337486dd3afc5615eb71ffd311c5a0beda37b8c',
		secondPublicKey: '02bb04b8b15f10edcd5fbc067c6107841b527a39d57dd33156de616714863bae',
		transactionCount: {
			incoming: '4616',
			outgoing: '2420',
		},
	},
	'testnet guy': {
		address: '9819477579273755847L',
		balance: 200000000,
		delegate: {},
		knowledge: {},
		multisignatureAccount: {},
		publicKey: '44b414eb2ac09a878feb677972cb57160d3d286fc0c32c9a608c32c40c979f63',
		secondPublicKey: '',
		transactionCount: {
			incoming: '6',
			outgoing: '4',
		},
	},
	'mainnet delegate': {
		address: '2433857930558702776L',
		username: 'tembo',
	},
};
accounts['any account'] = accounts.genesis;


module.exports = accounts;

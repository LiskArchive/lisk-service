const tokensNotPresent = {
	title: 'Lisk - Mainnet - Native tokens',
};

const tokensIncorrect = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: 'Tokens',
};

const tokenIDNotPresent = {
	title: 'Lisk - Mainnet',
	description: 'Metadata configuration for the Lisk blockchain (mainchain) in mainnet',
	chainName: 'lisk_mainchain',
	displayName: 'Lisk',
	chainID: '00000000',
	networkType: 'mainnet',
	genesisURL: 'https://downloads.lisk.com/lisk/mainnet/genesis_block.json.tar.gz',
	projectPage: 'https://lisk.com',
	logo: {
		png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
		svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
	},
	backgroundColor: '#f7f9fb',
	serviceURLs: [
		{
			http: 'https://mainnet-service.lisk.com',
			ws: 'wss://mainnet-service.lisk.com',
		},
	],
	explorers: [],
	appNodes: [
		{
			url: 'wss://mainnet.lisk.com',
			maintainer: 'Lightcurve GmbH',
		},
	],
};

const tokenNameNotPresent = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
			},
		},
	],
};

const denomUnitsNotPresent = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
			},
		},
	],
};

const denomUnitsDecimalsIncorrect = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: '<INCORRECT>',
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
			},
		},
	],
};

const denomUnitsDecimalsNotPresent = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
			},
		},
	],
};

const denomUnitsDenomNotPresent = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
			},
		},
	],
};

const baseDenomNotPresent = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
			},
		},
	],
};

const displayDenomNotPresent = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
			},
		},
	],
};

const symbolNotPresent = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
			},
		},
	],
};

const logoNotPresent = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
			},
		},
	],
};

const logoPngNotPresent = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
			},
		},
	],
};

const logoSvgNotPresent = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
			},
		},
	],
};

const logoPNGIncorrect = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: '<INCORRECT_URL>',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.svg',
			},
		},
	],
};

const logoSVGIncorrect = {
	title: 'Lisk - Mainnet - Native tokens',
	tokens: [
		{
			tokenID: '0000000000000000',
			tokenName: 'Lisk',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows',
					decimals: 0,
					aliases: [
						'Beddows',
					],
				},
				{
					denom: 'lsk',
					decimals: 8,
					aliases: [
						'Lisk',
					],
				},
			],
			baseDenom: 'beddows',
			displayDenom: 'lsk',
			symbol: 'LSK',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/lisk.png',
				svg: '<INCORRECT_URL>',
			},
		},
	],
};

module.exports = {
	tokensNotPresent,
	tokensIncorrect,
	tokenIDNotPresent,
	tokenNameNotPresent,
	denomUnitsNotPresent,
	denomUnitsDecimalsIncorrect,
	denomUnitsDecimalsNotPresent,
	denomUnitsDenomNotPresent,
	baseDenomNotPresent,
	displayDenomNotPresent,
	symbolNotPresent,
	logoNotPresent,
	logoPngNotPresent,
	logoSvgNotPresent,
	logoPNGIncorrect,
	logoSVGIncorrect,
};

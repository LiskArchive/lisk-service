const appConfig = {
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
			apiCertificatePublicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwAOGlgzeePs8O7FjSU9a\nUKQg4EYSJNgQqkwD/ITAJ6TzcXRCUK+N230NaFcQ8EFJw/8Al0r8mpjpOOEpPZDq\n+WljcCRkVHXZCJMvgDNcstzdrt1fKzsCrER2jB3hDUXt04xzzlk8ArJG0JeD/CmW\nAsQqL/S6v/GRVTuViHqzWm2eF2XrduUK8wIbQ1y+7HoVdgZDf5MpuvEXluVX4IeJ\nMyzbn9djdrDkHkcbml8dOHyLE6GOS5jKtXj+bKhyTVlSZFbexxKYiBqCpR6kMUnM\nVrURmWGT+jb7UhGkJiP7EpFB7MjAB+yXMiygd6lz67qjG6wFky1wB9NYGJ/50rrV\nDQIDAQAB\n-----END PUBLIC KEY-----',

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

const nativeTokenConfig = {
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

module.exports = {
	appConfig,
	nativeTokenConfig,
};

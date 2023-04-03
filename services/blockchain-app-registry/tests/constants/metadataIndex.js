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
const indexAppMetaInput = {
	title: 'testChain999 - Betanet',
	description: 'Metadata configuration for the testChain999 blockchain (mainchain) in betanet',
	chainName: 'testChain999',
	chainID: '02999999',
	networkType: 'betanet',
	genesisURL: 'https://downloads.lisk.com/lisk/betanet/genesis_block.json.tar.gz',
	projectPage: 'https://lisk.com',
	logo: {
		png: 'https://lisk-qa.ams3.digitaloceanspaces.com/Artboard%201%20copy%2019.png',
		svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/Logo-20.svg',
	},
	backgroundColor: '#f7f9fb',
	serviceURLs: [
		{
			http: 'https://betanet-service.lisk.com',
			ws: 'wss://betanet-service.lisk.com',
		},
	],
	explorers: [
		{
			url: 'https://betanet.liskscan.com',
			txnPage: 'https://betanet.liskscan.com/transactions',
		},
	],
	appNodes: [
		{
			url: 'https://betanet.lisk.com',
			maintainer: 'Lightcurve GmbH',
		},
		{
			url: 'wss://betanet.lisk.com',
			maintainer: 'Lightcurve GmbH',
		},
	],
	appDirName: 'testChain999',
};

const indexTokenMetaInput = {
	title: 'Lisk - Betanet - Native tokens',
	tokens: [
		{
			tokenID: '0299999900000000',
			tokenName: 'Lisk-test',
			description: 'Default token for the entire Lisk ecosystem',
			denomUnits: [
				{
					denom: 'beddows-test',
					decimals: 0,
					aliases: [
						'Beddows-test',
					],
				},
				{
					denom: 'lsk-test',
					decimals: 8,
					aliases: [
						'Lisk-test',
					],
				},
			],
			baseDenom: 'beddows-test',
			displayDenom: 'lsk-test',
			symbol: 'LSK-test',
			logo: {
				png: 'https://lisk-qa.ams3.digitaloceanspaces.com/Artboard%201%20copy%2019.png',
				svg: 'https://lisk-qa.ams3.digitaloceanspaces.com/Logo-20.svg',
			},
		},
	],
};

module.exports = {
	indexAppMetaInput,
	indexTokenMetaInput,
};

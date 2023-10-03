/*
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
 */

const path = require('path');

const config = {};

// Root directory which holds networks
config.rootDir = path.join(__dirname, '../');

// Directories corresponding the known networks
config.knownNetworks = ['devnet', 'betanet', 'testnet', 'mainnet'];
config.securedNetworks = ['testnet', 'mainnet'];

// Schema directory
config.schemaDir = path.join(config.rootDir, 'schema');

// API suffix to get chain ID for service endpoints
config.LS_HTTP_ENDPOINT_NET_STATUS = '/api/v3/network/status';
config.LS_WS_API_NAMESPACE = '/rpc-v3';
config.LS_WS_ENDPOINT_NET_STATUS = 'get.network.status';

// API suffix to get chain ID for node endpoints
config.NODE_HTTP_API_RPC_NAMESPACE = '/rpc';
config.NODE_WS_API_RPC_NAMESPACE = '/rpc-ws';

// API timeout
config.API_TIMEOUT = 5000;

// Filenames
config.filename = {
	APP_JSON: 'app.json',
	NATIVE_TOKENS: 'nativetokens.json',
};

// Files whitelisted
config.whitelistedFilesPath = path.join(__dirname, 'whitelistedFiles');

// Repo URL
config.repositoryURL = 'https://raw.githubusercontent.com/LiskHQ/app-registry';
config.repositoryDefaultBranch = 'main';
config.repositoryHashURLRegex = new RegExp(`^${config.repositoryURL}/[0-9a-f]{40}$`);

// Image sesolutions
config.image = {
	DEFAULT_HEIGHT: 64,
	DEFAULT_WIDTH: 64,
};

module.exports = config;

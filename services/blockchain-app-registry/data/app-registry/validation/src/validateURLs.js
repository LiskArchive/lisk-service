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
const sharp = require('sharp');

const { readJsonFile } = require('./utils/fs');
const config = require('../config');

const { httpRequest, wsRequest, requestInfoFromLiskNodeWSEndpoint, requestInfoFromLiskNodeHTTPEndpoint } = require('./utils/request/index');
const { readFile } = require('./utils/fs');

const validateExplorerUrls = async (explorers) => {
	const validationErrors = [];

	for (let i = 0; i < explorers.length; i++) {
		const explorer = explorers[i];
		/* eslint-disable no-await-in-loop */
		const { url: explorerURL, txnPage: explorerTxnPage } = explorer;

		try {
			await httpRequest(explorerURL);
		} catch (error) {
			validationErrors.push(`Validation of explorer URL (${explorerURL}) failed with error: ${error.message}.`);
		}

		try {
			await httpRequest(explorerTxnPage);
		} catch (error) {
			validationErrors.push(`Validation of explorer txn page URL (${explorerTxnPage}) failed with error: ${error.message}.`);
		}
		/* eslint-enable no-await-in-loop */
	}

	return validationErrors;
};

const validateGenesisURL = async (genesisURL) => {
	const validationErrors = [];

	try {
		await httpRequest(genesisURL);
	} catch (error) {
		validationErrors.push(`Validation of genesis URL (${genesisURL}) failed with error: ${error.message}.`);
	}

	return validationErrors;
};

const validateProjectPageURL = async (projectPageURL) => {
	const validationErrors = [];

	try {
		await httpRequest(projectPageURL);
	} catch (error) {
		validationErrors.push(`Validation of project page URL (${projectPageURL}) failed with error: ${error.message}.`);
	}

	return validationErrors;
};

const validateImageResolution = async (params) => {
	const validationErrors = [];

	const { url, filePath } = params;
	let imageBuffer;

	try {
		if (url) {
			const response = await httpRequest(url, { responseType: 'arraybuffer' });
			imageBuffer = Buffer.from(response.data);
		} else if (filePath) {
			imageBuffer = await readFile(filePath);
		} else {
			throw Error('Either URL or filePath needs to be supplied to verify the image resolution.');
		}

		// Use sharp to get the image dimensions
		const metadata = await sharp(imageBuffer).metadata();
		const { width, height } = metadata;

		if (height !== config.image.DEFAULT_HEIGHT || width !== config.image.DEFAULT_WIDTH) {
			const logo = url || filePath;
			validationErrors.push(`Validation of logo (${logo}) failed with error: Image resolution must be ${config.image.DEFAULT_HEIGHT}px x ${config.image.DEFAULT_WIDTH}px.`);
		}
	} catch (error) {
		const logo = url || filePath;
		validationErrors.push(`Validation of logo (${logo}) failed with error: ${error.message}.`);
	}

	return validationErrors;
};

const validateLogoURLs = async (logos, allChangedFiles) => {
	const validationErrors = [];
	const { png: pngURL, svg: svgURL } = logos;

	if (pngURL) {
		if (!pngURL.endsWith('.png')) {
			validationErrors.push(`Validation of PNG logo URL (${pngURL}) failed with error: Provided URL is not in PNG format.`);
		} else {
			try {
				if (pngURL.startsWith(`${config.repositoryURL}/`) && !config.repositoryHashURLRegex.test(pngURL)) {
					if (pngURL.startsWith(`${config.repositoryURL}/${config.repositoryDefaultBranch}/`)) {
						// If logo is part of main branch but pushed in current branch
						const filePath = pngURL.replace(`${config.repositoryURL}/${config.repositoryDefaultBranch}/`, '');
						if (!allChangedFiles.includes(filePath)) {
							// If logo is already part of main branch
							validationErrors.push(...await validateImageResolution({ url: pngURL }));
						} else {
							validationErrors.push(...await validateImageResolution({ filePath: path.join(config.rootDir, filePath) }));
						}
					} else { // If logo URL doesn't reference the default branch or commit hash
						validationErrors.push(`Validation of PNG logo URL (${pngURL}) failed with error:  URL needs to be associated with the '${config.repositoryDefaultBranch}' branch or a commit hash.`);
					}
				} else {
					validationErrors.push(...await validateImageResolution({ url: pngURL }));
				}
			} catch (error) {
				validationErrors.push(`Validation of PNG logo URL (${pngURL}) failed with error: ${error.message}.`);
			}
		}
	}

	if (svgURL) {
		if (!svgURL.endsWith('.svg')) {
			validationErrors.push(`Validation of SVG logo URL (${svgURL}) failed with error: Provided URL is not in SVG format.`);
		} else {
			try {
				if (svgURL.startsWith(`${config.repositoryURL}/`) && !config.repositoryHashURLRegex.test(svgURL)) {
					if (svgURL.startsWith(`${config.repositoryURL}/${config.repositoryDefaultBranch}/`)) {
						// If logo is part of main branch but pushed in current branch

						const filePath = svgURL.replace(`${config.repositoryURL}/${config.repositoryDefaultBranch}/`, '');
						if (!allChangedFiles.includes(filePath)) {
							// If logo is already part of main branch
							validationErrors.push(...await validateImageResolution({ url: svgURL }));
						} else {
							validationErrors.push(...await validateImageResolution({ filePath: path.join(config.rootDir, filePath) }));
						}
					} else { // If logo url dosent refrance default branch or commit hash
						validationErrors.push(`Validation of SVG logo URL (${svgURL}) failed with error:  URL needs to be associated with the '${config.repositoryDefaultBranch}' branch or a commit hash.`);
					}
				} else {
					validationErrors.push(...await validateImageResolution({ url: svgURL }));
				}
			} catch (error) {
				validationErrors.push(`Validation of SVG logo URL (${svgURL}) failed with error: ${error.message}.`);
			}
		}
	}

	return validationErrors;
};

const validateAppNodeUrls = async (appNodeInfos, chainID, isSecuredNetwork) => {
	const validationErrors = [];

	for (let i = 0; i < appNodeInfos.length; i++) {
		const appNodeInfo = appNodeInfos[i];
		/* eslint-disable no-await-in-loop */
		const { url: appNodeUrl, apiCertificatePublicKey: publicKey } = appNodeInfo;

		const { protocol } = new URL(appNodeUrl);

		if (isSecuredNetwork && (protocol !== 'https:' || protocol !== 'wss:' || !publicKey)) {
			validationErrors.push(`Require secure URLs and API certificate public key in case of the following networks: ${config.securedNetworks}.`);
		}

		try {
			if (protocol === 'ws:' || protocol === 'wss:') {
				// Validate ws app node URLs
				const nodeSystemInfo = await requestInfoFromLiskNodeWSEndpoint(appNodeUrl, publicKey);
				if (nodeSystemInfo.chainID !== chainID) {
					validationErrors.push(`ChainID mismatch on node: ${appNodeUrl}.\nNode chainID: ${nodeSystemInfo.chainID}.\napp.json chainID: ${chainID}.\nPlease ensure that the supplied values in the config are accurate.`);
				}
			} else if (protocol === 'http:' || protocol === 'https:') {
				// Validate HTTP app node URLs
				const nodeSystemInfo = await requestInfoFromLiskNodeHTTPEndpoint(appNodeUrl, publicKey);
				if (nodeSystemInfo.chainID !== chainID) {
					validationErrors.push(`ChainID mismatch on node: ${appNodeUrl}.\nNode chainID: ${nodeSystemInfo.chainID}.\napp.json chainID: ${chainID}.\nPlease ensure that the supplied values in the config are accurate.`);
				}
			} else {
				validationErrors.push(`Incorrect URL protocol: ${appNodeUrl}.`);
			}
		} catch (error) {
			validationErrors.push(`Establishing connection with node (${appNodeUrl}) failed due error: ${error.message}.`);
		}
		/* eslint-enable no-await-in-loop */
	}

	return validationErrors;
};

const validateServiceURLs = async (serviceURLs, chainID, isSecuredNetwork) => {
	const validationErrors = [];

	for (let i = 0; i < serviceURLs.length; i++) {
		const serviceURL = serviceURLs[i];

		/* eslint-disable no-await-in-loop */
		const { http: httpServiceURL, ws: wsServiceUrl, apiCertificatePublicKey: publicKey } = serviceURL;

		const { protocol: httpProtocol } = new URL(httpServiceURL);
		const { protocol: wsProtocol } = new URL(wsServiceUrl);

		if (isSecuredNetwork && (httpProtocol !== 'https:' || wsProtocol !== 'wss:' || !publicKey)) {
			validationErrors.push(`Require secure URLs and API certificate public key in case of the following networks: ${config.securedNetworks}.`);
		} else if (!isSecuredNetwork && !((httpProtocol === 'https:' && wsProtocol === 'wss:' && publicKey) || (httpProtocol === 'http:' && wsProtocol === 'ws:'))) {
			validationErrors.push('Require Lisk Service HTTP and WS URLs. For secured deployments, please provide apiCertificatePublicKey as well.');
		} else {
			// Validate HTTP service URLs
			if (httpServiceURL) {
				try {
					const httpRes = await httpRequest(httpServiceURL + config.LS_HTTP_ENDPOINT_NET_STATUS, {}, publicKey);
					const chainIDFromServiceURL = httpRes.data.data.chainID;
					if (chainIDFromServiceURL !== chainID) {
						validationErrors.push(`ChainID mismatch in HTTP URL: ${httpServiceURL}.\nService URL chainID: ${chainIDFromServiceURL}.\napp.json chainID: ${chainID}.\nPlease ensure that the supplied values in the config is correct.`);
					}
				} catch (error) {
					validationErrors.push(`Validation of URL (${httpServiceURL}) failed with error: ${error.message}.`);
				}
			}

			// Validate ws service URLs
			if (wsServiceUrl) {
				try {
					const wsRes = await wsRequest(wsServiceUrl + config.LS_WS_API_NAMESPACE, config.LS_WS_ENDPOINT_NET_STATUS, {}, publicKey);
					if (wsRes.result.data.chainID !== chainID) {
						validationErrors.push(`ChainID mismatch in WS URL: ${wsServiceUrl}.\nService URL chainID: ${wsRes.chainID}.\napp.json chainID: ${chainID}.\nPlease ensure that the supplied values in the config is correct.`);
					}
				} catch (error) {
					validationErrors.push(`Validation of URL (${wsServiceUrl}) failed with error: ${error.message}.`);
				}
			}
		}

		/* eslint-enable no-await-in-loop */
	}

	return validationErrors;
};

const validateURLs = async (changedAppFiles, allChangedFiles) => {
	let validationErrors = [];

	const securedNetworkPaths = [];
	// eslint-disable-next-line no-restricted-syntax
	for (const network of config.securedNetworks) {
		securedNetworkPaths.push(path.join(config.rootDir, network));
	}

	// Get all app.json files
	const appFiles = changedAppFiles.filter((filename) => filename.endsWith(config.filename.APP_JSON));

	const nativetokenFiles = changedAppFiles.filter((filename) => filename.endsWith(config.filename.NATIVE_TOKENS));

	for (let i = 0; i < appFiles.length; i++) {
		const appFile = appFiles[i];
		/* eslint-disable no-await-in-loop */
		const data = await readJsonFile(appFile);

		// Check if app file belongs to a secured network
		let isSecuredNetwork = false;
		// eslint-disable-next-line no-restricted-syntax
		for (const securedNetworkPath of securedNetworkPaths) {
			if (appFile.startsWith(securedNetworkPath)) {
				isSecuredNetwork = true;
				break;
			}
		}

		// Validate service URLs
		const serviceURLValidationErrors = await validateServiceURLs(data.serviceURLs, data.chainID, isSecuredNetwork);

		// Validate logo URLs
		const logoValidationErrors = await validateLogoURLs(data.logo, allChangedFiles);

		// Validate genesis URLs
		const genesisURLValidationErrors = await validateGenesisURL(data.genesisURL);

		// Validate project page URLs
		const projectPageURLValidationErrors = await validateProjectPageURL(data.projectPage);

		// Validate explorer URLs
		const explorerURLValidationErrors = await validateExplorerUrls(data.explorers);

		// Validate appNodes URLs
		const appNodeURLValidationErrors = await validateAppNodeUrls(data.appNodes, data.chainID, isSecuredNetwork);
		/* eslint-enable no-await-in-loop */

		validationErrors = [...validationErrors,
			...serviceURLValidationErrors,
			...logoValidationErrors,
			...projectPageURLValidationErrors,
			...genesisURLValidationErrors,
			...explorerURLValidationErrors,
			...appNodeURLValidationErrors];
	}

	// Validate URLs for nativetokens.json file
	for (let i = 0; i < nativetokenFiles.length; i++) {
		const nativetokenFile = nativetokenFiles[i];
		/* eslint-disable no-await-in-loop */
		const data = await readJsonFile(nativetokenFile);

		if (data.tokens) {
			// eslint-disable-next-line no-restricted-syntax
			for (const token of data.tokens) {
				// Validate logo URLs
				const logoValidationErrors = await validateLogoURLs(token.logo, allChangedFiles);
				validationErrors = [...validationErrors, ...logoValidationErrors];
			}
		}
		/* eslint-enable no-await-in-loop */
	}

	return validationErrors;
};

module.exports = {
	validateURLs,
};

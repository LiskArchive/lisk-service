/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
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
const registerApi = require('./shared/registerRpcApi');

const defaultConfig = {
	whitelist: [],
	aliases: {},
};

module.exports = {
	'/rpc': registerApi('http-version1', { ...defaultConfig }),
	'/rpc-v1': registerApi('http-version1', { ...defaultConfig }),
	'/rpc-test': registerApi('http-test', { ...defaultConfig }),
	'/blockchain': {
		events: {
		  'call': {
			mappingPolicy: 'restrict',
			aliases: {
			  'update.block': 'block.change'
			},
			onAfterCall:async function(socket, data){
				socket.emit('update.block', data)
		    },
			callOptions: {}
		  }
		}
	  }
};

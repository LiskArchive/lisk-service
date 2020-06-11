/*
 * LiskHQ/lisk-service
 * Copyright © 2020 Lisk Foundation
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
import { api } from '../../helpers/socketIoRpcRequest';
import networkStatusSchema from '../schemas/networkStatus.schema';

const requestNetworkStatus = async params => api.getJsonRpcV1('get.network.status', params);

describe('get.network.status', () => {
	it('returns network status', async () => {
		const response = await requestNetworkStatus();
		expect(response).toMap(networkStatusSchema);
	});
});


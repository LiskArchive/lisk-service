/*
 * LiskHQ/lisk-service
 * Copyright © 2022 Lisk Foundation
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
const { Logger, Signals } = require('lisk-service-framework');

const logger = Logger();

module.exports = [
	{
		name: 'update.metadata',
		description: 'Emit event when the database is successfully synchronized',
		controller: async callback => {
			const updateMetadataListener = async (data) => {
				logger.debug('Database has been successfully synchronized');
				callback(data);
			};
			Signals.get('metadataUpdated').add(updateMetadataListener);
		},
	},
];

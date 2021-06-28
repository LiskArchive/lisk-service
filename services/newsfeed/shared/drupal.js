/*
 * LiskHQ/lisk-service
 * Copyright © 2021 Lisk Foundation
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
const { HTTP } = require('lisk-service-framework');

const requestLib = HTTP.request;
const config = require('../config');
const { normalizeData } = require('./normalizers');

const mysqlIndex = require('./indexdb/mysql');
const newsfeedIndexSchema = require('./schema/newsfeed');

const getnewsfeedIndex = () => mysqlIndex('newsfeed', newsfeedIndexSchema);

const reloadDrupalAnnouncements = async (url) => {
	const newsfeedDB = await getnewsfeedIndex();
	const response = await requestLib(url);
	let normalizedData = normalizeData(config.sources.drupal_lisk_announcements, response.data, 'newsfeed');
	normalizedData = normalizedData.map(acc => {
		acc.content_orig = acc.content;
		acc.content_t = `${acc.content.substring(0, 10)}...`;
		return acc;
	});
	await newsfeedDB.upsert(normalizedData);
};

const reloadDrupalGeneral = async (url) => {
	const newsfeedDB = await getnewsfeedIndex();
	const response = await requestLib(url);
	let normalizedData = normalizeData(config.sources.drupal_lisk_general, response.data, 'newsfeed');
	normalizedData = normalizedData.map(acc => {
		acc.content_orig = acc.content;
		acc.content_t = `${acc.content.substring(0, 10)}...`;
		return acc;
	});
	await newsfeedDB.upsert(normalizedData);
};

const reloadNewsFromDrupal = async () => {
	await reloadDrupalAnnouncements(config.endpoints.drupal_lisk_announcements);
	await reloadDrupalGeneral(config.endpoints.drupal_lisk_general);
};

module.exports = {
	reloadNewsFromDrupal,
};

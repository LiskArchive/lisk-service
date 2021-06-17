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
const { retrieveDataFromDb } = require('../../shared/postgres');
const sources = require('../../config.sources.js');

const enabledSources = Object.values(sources)
    .filter(({ enabled }) => enabled)
    .map(({ name }) => name);

const getNewsfeed = async ({ limit, offset, source = enabledSources }) => {
    const data = await retrieveDataFromDb(
        `SELECT newsfeed.id, newsfeed.hash, newsfeed.source, newsfeed.title, news_content.content_short, newsfeed.url, newsfeed.timestamp, newsfeed.author, newsfeed.image_url
		FROM newsfeed 
		LEFT JOIN news_content ON newsfeed.hash = news_content.hash
		WHERE source IN ($<source:csv>)
		ORDER BY timestamp DESC
		LIMIT $<limit>
		OFFSET $<offset>`,
        { limit, offset, source });

    return {
        data: {
            data,
            meta: {
                count: data.length,
                limit,
                offset,
                source,
            },
            links: {},
        },
    };
};

module.exports = {
    getNewsfeed,
};

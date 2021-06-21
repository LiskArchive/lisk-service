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

const getNewsfeedArticles = async ({ offset, limit, source: sources }) => {
    // TODO: Perform DB Ops based on the request params
    const data = [
        {
            "author": "LiskHQ",
            "content_t": "RT @newsbtc: Lisk.js 2021 Recap https://t.co/QpZOkBfrgA",
            "image_url": null,
            "source": "twitter_lisk",
            "source_id": "4584a7d2db15920e130eeaf1014f87c99b5af329",
            "ctime": 1623053809,
            "mtime": 1623053809,
            "title": "",
            "url": "https://t.co/QpZOkBfrgA",
        }
    ].slice(offset, offset + limit);

    // Send 'Service Unavailable' when no data is available
    if (!data.length) throw new ServiceUnavailableException('Service not available');

    return {
        data,
        meta: {
            count: data.length,
            limit,
            offset,
            source: sources,
        },
    };
};

module.exports = { getNewsfeedArticles };

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
const { codec } = require('@liskhq/lisk-codec');

const {
    MySQL: {
        getTableInstance,
    },
} = require('lisk-service-framework');
const event = require('../../../../gateway/sources/version3/mappings/event');

const config = require('../../../config');

const blocksIndexSchema = require('../../database/schema/blocks');
const eventsIndexSchema = require('../../database/schema/events');
const eventTopicsIndexSchema = require('../../database/schema/eventsTopics');

const { normalizeRangeParam } = require('../../utils/paramUtils');

const MYSQL_ENDPOINT = config.endpoints.mysql;

const getBlocksIndex = () => getTableInstance('blocks', blocksIndexSchema, MYSQL_ENDPOINT);
const getEventsIndex = () => getTableInstance('events', eventsIndexSchema, MYSQL_ENDPOINT);
const getEventTopicsIndex = () => getTableInstance('events_topics', eventTopicsIndexSchema, MYSQL_ENDPOINT);

const decodeEvent = async (event) => {
    const schemas = await requestConnector('getSchema');
    const eventID = codec.decode(schemas.event, event);
    return eventID;
};

const getModuleNameByID = async (moduleID) => {
    const response = await requestConnector('getSystemMetadata');
    const module = response.modules.map(module => module.id === moduleID);
    return module.name;
};

const getEvents = async (params) => {
    const blocksDB = await getBlocksIndex();
    const eventsDB = await getEventsIndex();
    const eventTopicsDB = await getEventTopicsIndex();

    const events = {
        data: [],
        meta: {},
    };

    if (params.height && typeof params.height === 'string' && params.height.includes(':')) {
        params = normalizeRangeParam(params, 'height');
    }

    if (params.transactionID) {
        const { transactionID, ...remParams } = params;
        params = remParams;
        params.whereIn = { property: 'topic', values: transactionID };
    }

    if (params.senderAddress) {
        const { senderAddress, ...remParams } = params;
        params = remParams;
        params.whereIn = { property: 'topic', values: senderAddress };
    }

    if (params.blockID) {
        const { blockID, ...remParams } = params;
        params = remParams;
        const [block] = await blocksDB.find({ id: blockID }, ['height']);
        params.height = block.height;
    }

    const response = await eventTopicsDB.find(params, ['height']);
    const total = await eventTopicsDB.count(params);

    events.data = await response.map(acc => {
        const [eventInfo] = await eventsDB.find({ height: acc.height }, ['event']);
        const [blockInfo] = await blocksDB.find({ height: acc.height }, ['id', 'timestamp']);

        const decodedEvent = await decodeEvent(eventInfo.event);
        decodedEvent.moduleName =  await getModuleNameByID(decodedEvent.moduleID);

        return {
            ...decodedEvent,
            block: {
                id: blockInfo.id,
                height: blockInfo.height,
                timestamp: blockInfo.timestamp,
            }
        }
    })

    events.meta = {
        count: events.data.length,
        offset: params.offset,
        total,
    }

    return events;
};

module.exports = {
    getEvents,
};

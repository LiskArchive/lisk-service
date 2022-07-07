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
    Exceptions: { ValidationException },
    MySQL: {
        getTableInstance,
    },
} = require('lisk-service-framework');

const config = require('../../../config');

const blocksIndexSchema = require('../../database/schema/blocks');
const eventsIndexSchema = require('../../database/schema/events');
const eventTopicsIndexSchema = require('../../database/schema/eventTopics');

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

    if (params.timestamp && params.timestamp.includes(':')) {
        params = normalizeRangeParam(params, 'timestamp');
    }

    if (params.blockID) {
        const { blockID, ...remParams } = params;
        params = remParams;
        const [block] = await blocksDB.find({ id: blockID }, ['height']);
        if ('height' in params && params.height !== block.height) {
            throw new ValidationException(`Invalid combination of blockID: ${blockID} and height: ${params.height}`);
        }
        params.height = block.height;
    }

    if (params.transactionID) {
        const { transactionID, ...remParams } = params;
        params = remParams;
        params.topic = transactionID;
    }

    if (params.senderAddress) {
        const { senderAddress, topic, ...remParams } = params;
        params = remParams;
        if (!topic) {
            params.topic = senderAddress;
        } else {
            params.andWhere = { topic: senderAddress };
        }
    }

    const total = await eventTopicsDB.count(params);
    const response = await eventTopicsDB.find(params, ['id']);

    const eventIDs = response.map(entry => entry.id);
    const eventsInfo = await eventsDB.find({ whereIn: { property: 'id', values: eventIDs } }, ['event', 'height']);

    events.data = await eventsInfo.map(eventInfo => {
        const decodedEvent = await decodeEvent(eventInfo.event);
        decodedEvent.moduleName = await getModuleNameByID(decodedEvent.moduleID);

        const [blockInfo] = await blocksDB.find({ height: eventInfo.height }, ['id', 'timestamp']);

        return {
            ...decodedEvent,
            block: {
                id: blockInfo.id,
                height: eventInfo.height,
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

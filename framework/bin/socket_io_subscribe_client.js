#!/usr/bin/env node
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
/* eslint-disable no-console */

const io = require('socket.io-client');
const colorize = require('json-colorizer');
const { webSocket, events } = require('../constants/event');

const socket = io(process.env.WS_ENDPOINT || webSocket.endpoint, {
	forceNew: true,
	transports: ['websocket'],
});

const { onevent } = socket;
socket.onevent = function (packet) {
    const args = packet.data || [];
    onevent.call(this, packet);
    packet.data = ['*'].concat(args);
    onevent.call(this, packet);
};

events.forEach(item => {
	socket.on(item, res => {
		console.log(`Event: ${item}, res: ${res || '-'}`);
	});
});

['status'].forEach(eventName => {
	socket.on(eventName, eventPayload => {
		console.log(
			`Received data from ${webSocket.endpoint}/${eventName}: ${eventPayload}`,
		);
	});
});

const subscribe = subscribeEvent => {
	socket.on(
		subscribeEvent,
		(...args) => {
			let eventName;
			let eventPayload;

			if (subscribeEvent === '*') {
				[eventName, eventPayload] = args;
			} else {
				eventName = subscribeEvent;
				[eventPayload] = args;
			}

			console.log(`====== ${eventName} ======`);
			console.log(colorize(JSON.stringify(eventPayload, null, 2)));
		},
	);
};

// subscribe('*'); // Listen to all the events
subscribe('new.block');
subscribe('new.transactions');
subscribe('delete.block');
subscribe('delete.transactions');
subscribe('update.round');
subscribe('update.generators');
subscribe('update.fee_estimates');
subscribe('update.metadata');
subscribe('update.index.status');

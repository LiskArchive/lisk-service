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
import moment from 'moment';

const config = require('../../../config');
const { api } = require('../../../helpers/api');

const {
	goodRequestSchema,
	badRequestSchema,
	metaSchema,
} = require('../../../schemas/httpGenerics.schema');

const {
	eventSchema,
} = require('../../../schemas/api_v3/event.schema');

const baseAddress = config.SERVICE_ENDPOINT;
const baseUrl = `${baseAddress}/api/v3`;
const endpoint = `${baseUrl}/events`;

describe('Events API', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await api.get(`${baseUrl}/transactions?limit=1&moduleCommand=token:transfer`);
		[refTransaction] = response.data;
	});

	describe('Retrieve events', () => {
		it('returns all events', async () => {
			const response = await api.get(`${endpoint}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i - 1];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns events by limit=5', async () => {
			const response = await api.get(`${endpoint}?limit=5`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i - 1];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve event list by transactionID', () => {
		it('returns event with known transactionID', async () => {
			const response = await api.get(`${endpoint}?transactionID=${refTransaction.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(event => {
				expect(event).toMap(eventSchema);
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty transactionID -> ok', async () => {
			const response = await api.get(`${endpoint}?transactionID=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i - 1];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('short invalid transactionID -> empty data', async () => {
			const response = await api.get(`${endpoint}?transactionID=41287`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('long invalid transactionID -> 400', async () => {
			const response = await api.get(`${endpoint}?transactionID=a0833fb5b5534a0c53c3a766bf356c92df2a28e1730fba85667b24f139f65b35578`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve event list by blockID', () => {
		it('return event with known block -> ok', async () => {
			const response = await api.get(`${endpoint}?blockID=${refTransaction.block.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(event => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.id) {
					expect(event.block.id).toBe(refTransaction.block.id);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty blockID -> ok', async () => {
			const response = await api.get(`${endpoint}?blockID=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i - 1];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid blockID -> 400', async () => {
			const response = await api.get(`${endpoint}?blockID=1000000000000000000000000'`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve event list by height', () => {
		it('known height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=${refTransaction.block.height}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(event => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.height) {
					expect(event.block.height).toBe(refTransaction.block.height);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty height -> ok', async () => {
			const response = await api.get(`${endpoint}?height=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i - 1];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid height -> 400', async () => {
			const response = await api.get(`${endpoint}?height=1000000000000000000000000'`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve event list by senderAddress', () => {
		it('known address -> ok', async () => {
			const response = await api.get(`${endpoint}?senderAddress=${refTransaction.sender.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i - 1];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('empty senderAddress -> ok', async () => {
			const response = await api.get(`${endpoint}?senderAddress=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i - 1];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('invalid senderAddress -> 400', async () => {
			const response = await api.get(`${endpoint}?senderAddress=lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve event list within timestamps', () => {
		it('events within set timestamps are returned', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const toTimestamp = refTransaction.block.timestamp;
			const response = await api.get(`${endpoint}?timestamp=${from}:${toTimestamp}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.timestamp) {
					expect(event.block.timestamp).toBeGreaterThanOrEqual(from);
					expect(event.block.timestamp).toBeLessThanOrEqual(toTimestamp);
					if (i > 0) {
						const prevEvent = response.data[i];
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('events with half bounded range: fromTimestamp', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const response = await api.get(`${endpoint}?timestamp=${from}:`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.timestamp) {
					expect(event.block.timestamp).toBeGreaterThanOrEqual(from);
					if (i > 0) {
						const prevEvent = response.data[i];
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('events with half bounded range: toTimestamp', async () => {
			const toTimestamp = refTransaction.block.timestamp;
			const response = await api.get(`${endpoint}?timestamp=:${toTimestamp}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.timestamp) {
					expect(event.block.timestamp).toBeLessThanOrEqual(toTimestamp);
					if (i > 0) {
						const prevEvent = response.data[i];
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Retrieve event list within height range', () => {
		it('events within set heights are returned', async () => {
			const minHeight = refTransaction.block.height;
			const maxHeight = refTransaction.block.height + 100;
			const response = await api.get(`${endpoint}?height=${minHeight}:${maxHeight}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.height) {
					expect(event.block.height).toBeGreaterThanOrEqual(minHeight);
					expect(event.block.height).toBeLessThanOrEqual(maxHeight);
				}
				if (i > 0) {
					const prevEvent = response.data[i];
					if (event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('events with half bounded range: fromHeight', async () => {
			const minHeight = refTransaction.block.height;
			const response = await api.get(`${endpoint}?height=${minHeight}:`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.height) {
					expect(event.block.height).toBeGreaterThanOrEqual(minHeight);
				}
				if (i > 0) {
					const prevEvent = response.data[i];
					if (event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('events with half bounded range: toHeight', async () => {
			const maxHeight = refTransaction.block.height + 100;
			const response = await api.get(`${endpoint}?height=:${maxHeight}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.height) {
					expect(event.block.height).toBeLessThanOrEqual(maxHeight);
				}
				if (i > 0) {
					const prevEvent = response.data[i];
					if (event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('events with minHeight greater than maxHeight -> BAD_REQUEST', async () => {
			const expectedStatusCode = 500;
			const minHeight = refTransaction.block.height;
			const maxHeight = refTransaction.block.height + 100;
			const response = await api.get(`${endpoint}?height=${maxHeight}:${minHeight}&limit=100`, expectedStatusCode);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Events sorted by timestamp', () => {
		it('returns events sorted by timestamp descending', async () => {
			const response = await api.get(`${endpoint}?sort=timestamp:desc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns events sorted by timestamp ascending', async () => {
			const response = await api.get(`${endpoint}?sort=timestamp:asc`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeLessThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Fetch events based on multiple request params', () => {
		it('returns event when queried with transactionID and blockID', async () => {
			const response = await api.get(`${endpoint}?transactionID=${refTransaction.id}&blockID=${refTransaction.block.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(event => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.id) {
					expect(event.block.id).toBe(refTransaction.block.id);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns event when queried with transactionID and height', async () => {
			const response = await api.get(`${endpoint}?transactionID=${refTransaction.id}&height=${refTransaction.block.height}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(event => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.height) {
					expect(event.block.height).toBe(refTransaction.block.height);
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns 400 BAD REQUEST with unsupported params', async () => {
			const expectedStatusCode = 400;
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}`, expectedStatusCode);
			expect(response).toMap(badRequestSchema);
		});

		it('returns events when queried with limit and offset', async () => {
			const response = await api.get(`${endpoint}?limit=5&offset=1`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(5);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});
	describe('Retrieve events by topic', () => {
		it('returns event with topic as transactionID', async () => {
			const response = await api.get(`${endpoint}?topic=${refTransaction.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(event => expect(event).toMap(eventSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns event with topic as CSV - transactionID,senderAddress', async () => {
			const topic = refTransaction.id.concat(',', refTransaction.sender.address);
			const response = await api.get(`${endpoint}?topic=${topic}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(event => expect(event).toMap(eventSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('returns event with topic as senderAddress', async () => {
			const response = await api.get(`${endpoint}?topic=${refTransaction.sender.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(event => expect(event).toMap(eventSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('empty topic -> ok', async () => {
			const response = await api.get(`${endpoint}?topic=`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i - 1];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});

	describe('Events ordered by index', () => {
		it('returns events ordered by index descending', async () => {
			const order = 'index:desc';
			const response = await api.get(`${endpoint}?order=${order}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i - 1];
					if (event.block.height === prevEvent.block.height) {
						if (order.endsWith('asc')) {
							expect(prevEvent.index).toBe(event.index - 1);
						} else {
							expect(prevEvent.index).toBe(event.index + 1);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});

		it('returns events ordered by index ascending', async () => {
			const order = 'index:asc';
			const response = await api.get(`${endpoint}?order=${order}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = response.data[i - 1];
					if (event.block.height === prevEvent.block.height) {
						if (order.endsWith('asc')) {
							expect(prevEvent.index).toBe(event.index - 1);
						} else {
							expect(prevEvent.index).toBe(event.index + 1);
						}
					}
				}
			});
			expect(response.meta).toMap(metaSchema);
		});
	});
});

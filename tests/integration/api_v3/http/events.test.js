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

const { invalidAddresses, invalidBlockIDs, invalidOffsets, invalidLimits } = require('../constants/invalidInputs');

describe('Events API', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await api.get(`${baseUrl}/transactions?limit=1&moduleCommand=token:transfer`);
		[refTransaction] = response.data;
	});

	describe('Retrieve events', () => {
		it('should return all events', async () => {
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

		it('should return events by limit=5', async () => {
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

		it('should return bad request for invalid limit', async () => {
			for (let i = 0; i < invalidLimits.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?blockID=${invalidLimits[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});

		it('should return bad request for invalid offset', async () => {
			for (let i = 0; i < invalidOffsets.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?offset=${invalidOffsets[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});
	});

	describe('Retrieve event list by transactionID', () => {
		it('should return event with known transactionID', async () => {
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

		it('should return valid response when called with empty transactionID', async () => {
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

		it('should return bad request for short invalid transactionID', async () => {
			const response = await api.get(`${endpoint}?transactionID=41287`, 400);
			expect(response).toMap(badRequestSchema);
		});

		it('should return bad request for long invalid transactionID', async () => {
			const response = await api.get(`${endpoint}?transactionID=a0833fb5b5534a0c53c3a766bf356c92df2a28e1730fba85667b24f139f65b35578`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve event list by blockID', () => {
		it('should return event with known block', async () => {
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

		it('should return valid response when called with empty blockID', async () => {
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

		it('should return bad request for invalid block ID', async () => {
			for (let i = 0; i < invalidBlockIDs.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?blockID=${invalidBlockIDs[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});
	});

	describe('Retrieve event list by height', () => {
		it('should return known height', async () => {
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

		it('should return empty height', async () => {
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

		it('should return invalid height', async () => {
			const response = await api.get(`${endpoint}?height=1000000000000000000000000'`, 400);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Retrieve event list by senderAddress', () => {
		it('should return known address', async () => {
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

		it('should return valid response when called with empty senderAddress', async () => {
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

		it('should return bad request for invalid sender address', async () => {
			for (let i = 0; i < invalidAddresses.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await api.get(`${endpoint}?senderAddress=${invalidAddresses[i]}`, 400);
				expect(response).toMap(badRequestSchema);
			}
		});
	});

	describe('Retrieve event list within timestamps', () => {
		it('should return events within set timestamps', async () => {
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

		it('should return events with half bounded range: fromTimestamp', async () => {
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

		it('should return events with half bounded range: toTimestamp', async () => {
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
		it('should return events within set heights', async () => {
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

		it('should return events with half bounded range: fromHeight', async () => {
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

		it('should return events with half bounded range: toHeight', async () => {
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

		it('should return events with minHeight greater than maxHeight -> INTERNAL_SERVER_ERROR', async () => {
			const expectedStatusCode = 500;
			const minHeight = refTransaction.block.height;
			const maxHeight = refTransaction.block.height + 100;
			const response = await api.get(`${endpoint}?height=${maxHeight}:${minHeight}&limit=100`, expectedStatusCode);
			expect(response).toMap(badRequestSchema);
		});
	});

	describe('Events sorted by timestamp', () => {
		it('should return events sorted by timestamp descending', async () => {
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

		it('should return events sorted by timestamp ascending', async () => {
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
		it('should return event when queried with transactionID and blockID', async () => {
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

		it('should return event when queried with transactionID and height', async () => {
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

		it('should return 400 BAD REQUEST with unsupported params', async () => {
			const expectedStatusCode = 400;
			const response = await api.get(`${endpoint}?address=${refTransaction.sender.address}`, expectedStatusCode);
			expect(response).toMap(badRequestSchema);
		});

		it('should return events when queried with limit and offset', async () => {
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
		it('should return event with topic as transactionID', async () => {
			const response = await api.get(`${endpoint}?topic=${refTransaction.id}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(event => expect(event).toMap(eventSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should return event with topic as CSV - transactionID,senderAddress', async () => {
			const topic = refTransaction.id.concat(',', refTransaction.sender.address);
			const response = await api.get(`${endpoint}?topic=${topic}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(event => expect(event).toMap(eventSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should return event with topic as senderAddress', async () => {
			const response = await api.get(`${endpoint}?topic=${refTransaction.sender.address}`);
			expect(response).toMap(goodRequestSchema);
			expect(response.data).toBeInstanceOf(Array);
			expect(response.data.length).toBeGreaterThanOrEqual(1);
			expect(response.data.length).toBeLessThanOrEqual(10);
			response.data.forEach(event => expect(event).toMap(eventSchema));
			expect(response.meta).toMap(metaSchema);
		});

		it('should return valid response when called with empty topic', async () => {
			const response = await api.get(`${endpoint}?topic=`);
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

	describe('Events ordered by index', () => {
		it('should return events ordered by index descending', async () => {
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

		it('should return events ordered by index ascending', async () => {
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

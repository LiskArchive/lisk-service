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
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	emptyResultEnvelopeSchema,
	emptyResponseSchema,
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
	metaSchema,
} = require('../../../schemas/rpcGenerics.schema');

const {
	eventSchema,
} = require('../../../schemas/api_v3/event.schema');

const wsRpcUrl = `${config.SERVICE_ENDPOINT}/rpc-v3`;
const getEvents = async params => request(wsRpcUrl, 'get.events', params);
const getTransactions = async params => request(wsRpcUrl, 'get.transactions', params);

describe('Method get.events', () => {
	let refTransaction;
	beforeAll(async () => {
		const response = await getTransactions({ moduleCommandID: '2:0', limit: 1 });
		[refTransaction] = response.result.data;
	});

	describe('Retrieve events', () => {
		it('returns list of events', async () => {
			const response = await getEvents({});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = result.data[i];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns list of events with limit=5 and offset=1', async () => {
			const response = await getEvents({ limit: 5, offset: 1 });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(5);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = result.data[i];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('is able to retrieve event using transactionID', () => {
		it('known transactionID -> ok', async () => {
			const response = await getEvents({ transactionID: refTransaction.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeArrayOfSize(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = result.data[i];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('empty transactionID -> empty response', async () => {
			const response = await getEvents({ transactionID: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve event using blockID', () => {
		it('known blockID -> ok', async () => {
			const response = await getEvents({ blockID: refTransaction.block.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(event => expect(event).toMap(eventSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty blockID ->  empty response', async () => {
			const response = await getEvents({ blockID: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve event by senderAddress', () => {
		it('known senderAddress -> ok', async () => {
			const response = await getEvents({ senderAddress: refTransaction.sender.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = result.data[i];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('empty senderAddress -> empty response', async () => {
			const response = await getEvents({ senderAddress: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('invalid senderAddress -> invalid params', async () => {
			const response = await getEvents({ senderAddress: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve events using height', () => {
		it('known height -> ok', async () => {
			const response = await getEvents({ height: String(refTransaction.block.height) });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(event => expect(event).toMap(eventSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty height -> empty response', async () => {
			const response = await getEvents({ height: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});

		it('Events with min...max height -> ok', async () => {
			const minHeight = refTransaction.block.height;
			const maxHeight = refTransaction.block.height + 100;
			const response = await getEvents({ height: `${minHeight}:${maxHeight}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.height) {
					expect(event.block.height).toBeGreaterThanOrEqual(minHeight);
					expect(event.block.height).toBeLessThanOrEqual(maxHeight);
				}
				if (i > 0) {
					const prevEvent = result.data[i];
					if (event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Events with min... height -> ok', async () => {
			const minHeight = refTransaction.block.height;
			const response = await getEvents({ height: `${minHeight}:` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.height) {
					expect(event.block.height).toBeGreaterThanOrEqual(minHeight);
				}
				if (i > 0) {
					const prevEvent = result.data[i];
					if (event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Events with ...max height -> ok', async () => {
			const maxHeight = refTransaction.block.height + 100;
			const response = await getEvents({ height: `:${maxHeight}` });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.height) {
					expect(event.block.height).toBeLessThanOrEqual(maxHeight);
				}
				if (i > 0) {
					const prevEvent = result.data[i];
					if (event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Events with max...min height -> empty response', async () => {
			const minHeight = refTransaction.block.height;
			const maxHeight = refTransaction.block.height + 100;
			const response = await getEvents({ height: `${maxHeight}:${minHeight}` });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});

	describe('is able to retrieve events using timestamps', () => {
		it('from to -> ok', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const toTimestamp = refTransaction.block.timestamp;
			const response = await getEvents({ timestamp: `${from}:${toTimestamp}` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.timestamp) {
					expect(event.block.timestamp).toBeGreaterThanOrEqual(from);
					expect(event.block.timestamp).toBeLessThanOrEqual(toTimestamp);
					if (i > 0) {
						const prevEvent = result.data[i];
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Half bounded range from -> ok', async () => {
			const from = moment(refTransaction.block.timestamp * 10 ** 3).subtract(1, 'day').unix();
			const response = await getEvents({ timestamp: `${from}:` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.timestamp) {
					expect(event.block.timestamp).toBeGreaterThanOrEqual(from);
					if (i > 0) {
						const prevEvent = result.data[i];
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('Half bounded range to -> ok', async () => {
			const toTimestamp = refTransaction.block.timestamp;
			const response = await getEvents({ timestamp: `:${toTimestamp}` });

			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.timestamp) {
					expect(event.block.timestamp).toBeLessThanOrEqual(toTimestamp);
					if (i > 0) {
						const prevEvent = result.data[i];
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Events sorted by timestamp', () => {
		it('returns events sorted by timestamp descending', async () => {
			const response = await getEvents({ sort: 'timestamp:desc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = result.data[i];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeGreaterThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns eventss sorted by timestamp ascending', async () => {
			const response = await getEvents({ sort: 'timestamp:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = result.data[i];
					if (event.block && event.block.timestamp) {
						if (prevEvent.block && prevEvent.block.timestamp) {
							const prevEventTimestamp = prevEvent.block.timestamp;
							expect(prevEventTimestamp).toBeLessThanOrEqual(event.block.timestamp);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Fetch events based on multiple request params', () => {
		it('returns event when queried with transactionID and blockID', async () => {
			const response = await getEvents({
				transactionID: refTransaction.id,
				blockID: refTransaction.block.id,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(event => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.id) {
					expect(event.block.id).toBe(refTransaction.block.id);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns event when queried with transactionID and height', async () => {
			const response = await getEvents({
				transactionID: refTransaction.id,
				height: String(refTransaction.block.height),
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toEqual(1);
			result.data.forEach(event => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.height) {
					expect(event.block.height).toBe(refTransaction.block.height);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('returns invalid params response with unsupported params', async () => {
			const response = await getEvents({ address: refTransaction.sender.address });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve events using topic', () => {
		it('known transactionID -> ok', async () => {
			const response = await getEvents({ topic: refTransaction.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(event => expect(event).toMap(eventSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('as CSV transactionID,senderrAddress -> ok', async () => {
			const topic = refTransaction.id.concat(',', refTransaction.sender.address);
			const response = await getEvents({ topic });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(event => expect(event).toMap(eventSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('known senderAddress -> ok', async () => {
			const response = await getEvents({ topic: refTransaction.sender.address });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(event => expect(event).toMap(eventSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('empty topic -> empty response', async () => {
			const response = await getEvents({ topic: '' });
			expect(response).toMap(emptyResponseSchema);
			const { result } = response;
			expect(result).toMap(emptyResultEnvelopeSchema);
		});
	});
});

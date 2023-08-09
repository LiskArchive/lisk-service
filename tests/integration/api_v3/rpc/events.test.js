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
import { invalidAddresses, invalidBlockIDs, invalidLimits, invalidOffsets } from '../constants/invalidInputs';

const config = require('../../../config');
const { request } = require('../../../helpers/socketIoRpcRequest');

const {
	resultEnvelopeSchema,
	jsonRpcEnvelopeSchema,
	invalidParamsSchema,
	metaSchema,
	serverErrorSchema,
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
		const response = await getTransactions({ moduleCommand: 'token:transfer', limit: 1 });
		[refTransaction] = response.result.data;
	});

	describe('Retrieve events', () => {
		it('should return list of events', async () => {
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

		it('should return list of events with limit=5 and offset=1', async () => {
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

		it('should return bad request for invalid limit', async () => {
			for (let i = 0; i < invalidLimits.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await getEvents({ limit: invalidLimits[i] });
				expect(response).toMap(serverErrorSchema);
			}
		});

		it('should return bad request for invalid offset', async () => {
			for (let i = 0; i < invalidOffsets.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await getEvents({ offset: invalidOffsets[i] });
				expect(response).toMap(serverErrorSchema);
			}
		});
	});

	describe('is able to retrieve event using transactionID', () => {
		it('should return success for known transactionID', async () => {
			const response = await getEvents({ transactionID: refTransaction.id });
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

		it('should return server error for empty transactionID', async () => {
			const response = await getEvents({ transactionID: '' });
			expect(response).toMap(serverErrorSchema);
		});
	});

	describe('is able to retrieve event using blockID', () => {
		it('should return success for known blockID', async () => {
			const response = await getEvents({ blockID: refTransaction.block.id });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(event => expect(event).toMap(eventSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return server error for empty blockID', async () => {
			const response = await getEvents({ blockID: '' });
			expect(response).toMap(serverErrorSchema);
		});

		it('should return bad request for invalid block ID', async () => {
			for (let i = 0; i < invalidBlockIDs.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await getEvents({ blockID: invalidBlockIDs[i] });
				expect(response).toMap(serverErrorSchema);
			}
		});
	});

	describe('is able to retrieve event by senderAddress', () => {
		it('should return success for known senderAddress', async () => {
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

		it('should return server error for empty senderAddress', async () => {
			const response = await getEvents({ senderAddress: '' });
			expect(response).toMap(serverErrorSchema);
		});

		it('should return invalid param for invalid senderAddress', async () => {
			const response = await getEvents({ senderAddress: 'lsydxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yj' });
			expect(response).toMap(invalidParamsSchema);
		});

		it('should return bad request for invalid senderAddress', async () => {
			for (let i = 0; i < invalidBlockIDs.length; i++) {
				// eslint-disable-next-line no-await-in-loop
				const response = await getEvents({ senderAddress: invalidAddresses[i] });
				expect(response).toMap(serverErrorSchema);
			}
		});
	});

	describe('is able to retrieve events using height', () => {
		it('should return known height', async () => {
			const response = await getEvents({ height: String(refTransaction.block.height) });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach(event => expect(event).toMap(eventSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return empty height', async () => {
			const response = await getEvents({ height: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(event => expect(event).toMap(eventSchema));
			expect(result.meta).toMap(metaSchema);
		});

		it('should return events with min...max height', async () => {
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

		it('should return events with min... height', async () => {
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

		it('should return events with ...max height', async () => {
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

		it('should return events with max...min height -> server error', async () => {
			const minHeight = refTransaction.block.height;
			const maxHeight = refTransaction.block.height + 100;
			const response = await getEvents({ height: `${maxHeight}:${minHeight}` });
			expect(response).toMap(serverErrorSchema);
		});
	});

	describe('is able to retrieve events using timestamps', () => {
		it('should return from to', async () => {
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

		it('should return half bounded range from', async () => {
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

		it('should return half bounded range to', async () => {
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
		it('should return events sorted by timestamp descending', async () => {
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

		it('should return events sorted by timestamp ascending', async () => {
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
		it('should return event when queried with transactionID and blockID', async () => {
			const response = await getEvents({
				transactionID: refTransaction.id,
				blockID: refTransaction.block.id,
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(event => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.id) {
					expect(event.block.id).toBe(refTransaction.block.id);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('should return event when queried with transactionID and height', async () => {
			const response = await getEvents({
				transactionID: refTransaction.id,
				height: String(refTransaction.block.height),
			});
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(event => {
				expect(event).toMap(eventSchema);
				if (event.block && event.block.height) {
					expect(event.block.height).toBe(refTransaction.block.height);
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('should return invalid params response with unsupported params', async () => {
			const response = await getEvents({ address: refTransaction.sender.address });
			expect(response).toMap(invalidParamsSchema);
		});
	});

	describe('is able to retrieve events using topic', () => {
		it('should return known transactionID', async () => {
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

		it('should return as CSV transactionID,senderrAddress', async () => {
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

		it('should return known senderAddress', async () => {
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

		it('should return empty topic', async () => {
			const response = await getEvents({ topic: '' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			result.data.forEach(event => expect(event).toMap(eventSchema));
			expect(result.meta).toMap(metaSchema);
		});
	});

	describe('Events ordered by index', () => {
		it('should return events ordered by index descending', async () => {
			const order = 'index:desc';
			const response = await getEvents({ order });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = result.data[i - 1];
					if (event.block.height === prevEvent.block.height) {
						if (order.endsWith('asc')) {
							expect(prevEvent.index).toBe(event.index - 1);
						} else {
							expect(prevEvent.index).toBe(event.index + 1);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});

		it('should return eventss ordered by index ascending', async () => {
			const order = 'index:asc';
			const response = await getEvents({ order: 'index:asc' });
			expect(response).toMap(jsonRpcEnvelopeSchema);
			const { result } = response;
			expect(result.data).toBeInstanceOf(Array);
			expect(result.data.length).toBeGreaterThanOrEqual(1);
			expect(result.data.length).toBeLessThanOrEqual(10);
			expect(response.result).toMap(resultEnvelopeSchema);
			result.data.forEach((event, i) => {
				expect(event).toMap(eventSchema);
				if (i > 0) {
					const prevEvent = result.data[i - 1];
					if (event.block.height === prevEvent.block.height) {
						if (order.endsWith('asc')) {
							expect(prevEvent.index).toBe(event.index - 1);
						} else {
							expect(prevEvent.index).toBe(event.index + 1);
						}
					}
				}
			});
			expect(result.meta).toMap(metaSchema);
		});
	});
});

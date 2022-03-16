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
const Queue = require('../../src/queue');

describe('Test queue', () => {
	let queue;
	const redisEndpoint = 'redis://localhost:6379/0';

	it('Should create a queue with a given redis instance', async () => {
		const testFunc = async (a, b) => a + b;
		queue = Queue(redisEndpoint, 'testQueue', testFunc, 1);

		expect(queue).toEqual({
			resume: expect.any(Function),
			pause: expect.any(Function),
			add: expect.any(Function),
			queue: expect.any(Object),
		})

		expect(queue.queue.client.options.host).toEqual('localhost');
		expect(queue.queue.client.options.port).toEqual(6379);
	});

	it('Add job to the queue', async () => {
		const data = { a: 1, b: 2 }
		await queue.add(data).then(job => {
			expect(job.id).not.toBe(undefined);
			expect(job.data).toEqual(data);
		});
	});
});

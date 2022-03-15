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
const queueInstance = require('../../src/queue');

describe('Test queue', () => {
	const testFunc = (a, b) => a + b;

	const redisEndpoint = 'redis://localhost:6379/0';

	const queue = queueInstance('testQueue', testFunc, 1, redisEndpoint);

	it('Should create a queue with a given redis instance', async () => {
		expect(queue).toMatchObject({
			resume: expect.any(Function),
			pause: expect.any(Function),
			add: expect.any(Function),
		})

		expect(queue.queue.client.options.host).toEqual('localhost');
		expect(queue.queue.client.options.port).toEqual(6379);
	});

	it('Add job to the queue', async () => {
		await queue.add({ a: 1, b: 2 }).then(job => {
			expect(job.id).not.toBe(undefined);
			expect(job.data.a).toEqual(1);
			expect(job.data.b).toEqual(2);
		});
	});
});

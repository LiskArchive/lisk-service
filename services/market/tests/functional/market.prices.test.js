#!/usr/bin/env node
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
/* eslint-disable no-console,no-multi-spaces,key-spacing,no-unused-vars */
const Joi = require('joi');
const { ServiceBroker } = require('moleculer');

const broker = new ServiceBroker({
    transporter: 'redis://localhost:6379/0',
    logLevel: 'info',
    requestTimeout: 15 * 1000,
    logger: console,
});

const marketPriceSchema = Joi.object({
    code: Joi.string().pattern(/^[A-Z]{3,4}_[A-Z]{3,4}$/).required(),
    from: Joi.string().pattern(/^[A-Z]{3,4}$/).required(),
    to: Joi.string().pattern(/^[A-Z]{3,4}$/).required(),
    rate: Joi.string().required(),
    updateTimestamp: Joi.number().integer().positive().required(),
    sources: Joi.array().items(Joi.string().required()).required(),
}).required();

describe('Test market prices', () => {
    beforeAll(() => broker.start());
    afterAll(() => broker.stop());

    describe('Connect to client and retrieve market prices', () => {
        it('call market.prices', async () => {
            const result = await broker.call('market.prices', {});
            expect(result.data.length).toBeGreaterThanOrEqual(1);
            expect(result.data).toBeInstanceOf(Array);
            result.data.forEach(price => {
                marketPriceSchema.validate(price);
            });
            expect(result.meta).toHaveProperty('count');
        });
    });
});

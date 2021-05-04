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
const signals = require('../../shared/signals');

describe('Signals tests', () => {
    describe('Test cases for signal.dispatch()', () => {
        const signal = signals.get('dispatchEvent');
        it('Dispatch and add signal data', async () => {
            signal.dispatch('Event is dispatched');
            signal.add((data) => {
                expect(data.toBe('Event is dispatched'));
            });
        });

        it.todo('Failing test case for dispatched event');
    });

    describe('Test cases for signal.add()', () => {
        const signal = signals.get('addEvent');
        const tesFunc = () => { };

        it('Add valid listener to signal.add()', async () => {
            // initially 0 listeners
            expect(signal.getNumListeners()).toBe(0);

            // Add 1 listener to signals
            signal.add(tesFunc);
            expect(signal.getNumListeners()).toBe(1);
        });

        it('Add invalid listener to signal.add() throws an error', async () => {
            try {
                signal.add();
            } catch (err) {
                expect(err.message).toEqual('listener is a required param of add() and should be a Function.');
            }
        });
    });

    describe('Test cases for signal.dispose()', () => {
        const signal = signals.get('disposeEvent');
        it('Dispose signal', async () => {
            signal.dispatch('Event is dispatched');
            signal.add((data) => {
                expect(data.toBe('Event is dispatched'));
            });

            signal.dispose();
            expect(() => { signal.getNumListeners(); }).toThrowError();
            expect(() => { signal.add(() => { }); }).toThrowError();
            expect(() => { signal.dispatch(); }).toThrowError();
        });
    });

    describe('Test cases for signal.remove()', () => {
        const signal = signals.get('removeEvent');
        const tesFunc = () => { };

        it('Remove valid listener', async () => {
            signal.add(tesFunc);
            expect(signal.getNumListeners()).toBe(1);

            signal.remove(tesFunc);
            expect(signal.getNumListeners()).toBe(0);
        });

        it('Remove invalid listener should throws an error', async () => {
            try {
                signal.remove();
            } catch (err) {
                expect(err.message).toEqual('listener is a required param of remove() and should be a Function.');
            }
        });
    });
});

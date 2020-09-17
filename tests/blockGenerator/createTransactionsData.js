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
const mocker = require('mocker-data-generator').default;

const generateHex = (size) => {
    let resultHex = '';
    const characters = 'abcdef0123456789';

    for (let i = 0; i < size; i++) {
      resultHex += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    return resultHex;
  };

const transactionData = {
  id: {
    function: () => Math.floor(Math.random() * 10 ** 19),
  },
  amount: {
    function: () => Math.floor(Math.random() * 10),
  },
  fee: {
    function: () => 10 ** 7,
  },
  type: {
    function: () => {
      const validTypes = [8, 9, 10, 11, 12];
      let index = Math.floor(Math.random() * 10) % validTypes.length;
      if (index > 0 && Math.floor(Math.random() * 100) % 9) index = 0;
      return validTypes[index];
    },
  },
  height: {
    function: () => null,
  },
  blockId: {
    function: () => null,
  },
  timestamp: {
    function: () => null,
  },
  senderId: {
    function: () => `${Math.floor(Math.random() * 10 ** 20)}L`,
  },
  senderPublicKey: {
    function: () => generateHex(64),
  },
  recipientId: {
    function: () => `${Math.floor(Math.random() * 10 ** 20)}L`,
  },
  recipientPublicKey: {
    function: () => generateHex(64),
  },
  signature: {
    function: () => generateHex(128),
  },
  confirmations: {
    function: () => null,
  },
};

const txMocker = (batchSize) => mocker()
    .schema('transactions', transactionData, batchSize)
    .build((err, data) => {
      if (err) throw err;

      data.transactions.forEach((transaction) => {
        transaction.signatures = [];
        transaction.asset = {};
      });

      return data.transactions;
    });

module.exports = txMocker;

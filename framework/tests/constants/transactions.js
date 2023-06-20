/*
 * LiskHQ/lisk-service
 * Copyright © 2023 Lisk Foundation
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

const tokenTransferTransaction = {
    id: 'a22d1d1959af42988746d350d4c21c3ffb81086e116de34d29148e6799bc2e8e',
    moduleAssetId: '2:0',
    moduleCommand: 'token:transfer',
    fee: '143000',
    height: 30428,
    blockID: '894345162569656300',
    timestamp: 1601455680,
    nonce: '135',
    senderId: 'lskdxc4ta5j43jp9ro3f8zqbxta9fn6jwzjucw7yt',
    senderPublicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
    isPending: false,
};

const registerValidatorTransaction = {
    id: 'ffec1b886a46c2055a4ae29b23e2361179a32201556cfaaa66a9a9ae3a608c09',
    moduleAssetId: '2:0',
    moduleCommand: 'pos:registerValidator',
    fee: '143000',
    height: 36243,
    blockID: '894345162569656300',
    timestamp: 1601459680,
    nonce: '135',
    senderId: 'lskexc4ta5j13jp9ro3f8zqbxta9fn2jwzjucw7ym',
    senderPublicKey: '0fa9a3f1a21b5830f27f87a414b549e79a940bf24fdf2b2f05e7a22aeeecc86d',
    isPending: false,
};

module.exports = {
    tokenTransferTransaction,
    registerValidatorTransaction,
};

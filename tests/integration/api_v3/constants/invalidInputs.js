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

const invalidAddresses = [
	'lsk12345678901234567890123456789012345678901', // length exceeds 41 characters
	'L1234567890123456789012345678901234567890', // starts with 'L' instead of 'lsk'
	'lsk1234567890123456789012345678901234567890', // length is 40, missing the last character
	'lsk12345678901234567890123456789012345678', // length is 38, missing the 'lsk' prefix
	'lsk%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
	'lsk______________________________________',
	'lsk^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
	'%', // SQL wildcard
];

const invalidSHA = [
	'ABCDEFabcdef0123456789ABCDEFabcdef0123456789ABCDEFabcdef012345678', // 63 characters instead of 64
	'ABCDEFabcdef0123456789ABCDEFabcdef0123456789ABCDEFabcdef0123456789G', // contains invalid character 'G'
	'%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%', // SQL wildcard
	'________________________________________________________________',
	'______%',
];

const invalidNames = [
	'2', // less than 3 characters
	'123456789012345678901', // more than 20 characters
	'abc$def%ghi', // contains invalid characters % and %
	'space space', // contains spaces
	'special?char', // contains invalid character ?
	'test OR 1=1', // SQL injection
	'______%',
];

const invalidChainIDs = [
	'0000000G', // contains invalid character 'G'
	'0000000?', // contains invalid character '?'
	'0 OR 1=1', // SQL injection
];

const invalidTokenIDs = [
	'0123456789abcdefG', // contains invalid character 'G'
	'0123456789abcdef?', // contains invalid character '?'
	'000000000 OR 1=1', // SQL injection
];

const invalidTokenIDCSV = ['___%'];

const invalidPartialSearches = [
	'12345678901234567890123456789012345678901234567890123456789012345', // more than 64 characters
	'space space', // contains spaces
	'special?char', // contains invalid character ?,
	'(*)',
	'%%%%%',
	'___%',
];

const invalidNamesCSV = ['A!', 'space space', 'special?char', '%%%%%', '__%,__%'];

const invalidLimits = ['abc', 0, -1, 105, 'one', '%'];

const invalidOffsets = ['abc', -1, 'one', '%'];

const invalidChainIDCSV = ['abcdefghijklmnop', 'ABCDEFGH', '__%'];

module.exports = {
	invalidAddresses,
	invalidPublicKeys: invalidSHA,
	invalidBlockIDs: invalidSHA,
	invalidNames,
	invalidNamesCSV,
	invalidTokenIDs,
	invalidChainIDs,
	invalidTokenIDCSV,
	invalidChainIDCSV,
	invalidPartialSearches,
	invalidLimits,
	invalidOffsets,
};

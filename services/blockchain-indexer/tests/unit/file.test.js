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
// const {
// 	getAllDirectories,
// 	getAllJSFiles,
// } = require('../../shared/utils/file');

describe('Unit tests for file utilities', () => {
	describe('Test \'getAllDirectories\'', () => {
		it.todo('Throws error when the source directory does not exist');

		it.todo('Returns empty list when source directory does not contain sub-directories');

		it.todo('Returns list of sub-directories contained within the source directory');
	});

	describe('Test \'getAllJSFiles\'', () => {
		it.todo('Throws error when the source directory does not exist');

		it.todo('Returns empty list when source directory does not contain \'.js\' files');

		it.todo('Returns only list of files when source directory contains sub-directories and \'.js\' files');

		it.todo('Returns list of files (camelCase and consecutiveUppercase) without the extension when source directory contains \'.js\' files');

		it.todo('Returns list of files (camelCase and no consecutiveUppercase) without the extension when source directory contains \'.js\' files');

		it.todo('Returns list of files (pascalCase and consecutiveUppercase) without the extension when source directory contains \'.js\' files');

		it.todo('Returns list of files (pascalCase and no consecutiveUppercase) without the extension when source directory contains \'.js\' files');
	});
});

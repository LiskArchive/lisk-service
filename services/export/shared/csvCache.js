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
const FileStorage = require('./helpers/file');

const CsvCache = (params) => {
	const { init, write, read, exists } = FileStorage;
	const { dirPath } = params;

	init({ dirPath });

	return {
		write: (filename, content) => write(`${dirPath}/${filename}`, content),
		read: (filename) => read(`${dirPath}/${filename}`),
		exists: (filename) => exists(`${dirPath}/${filename}`),
	};
};

module.exports = CsvCache;

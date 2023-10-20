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
const {
	Utils: {
		fs: { getDirectories },
	},
} = require('lisk-service-framework');

const camelCase = require('camelcase');
const requireAll = require('require-all');

const getDirectoryNamesInPath = async sourceDirPath => {
	const directories = await getDirectories(sourceDirPath, { withFileTypes: true });
	const dirNames = directories.map(path => path.split('/').pop());
	return dirNames;
};

const getAllJSFiles = async (
	sourceDirPath,
	pascalCase = false,
	preserveConsecutiveUppercase = true,
) =>
	requireAll({
		dirname: sourceDirPath,
		filter: /(.+)\.js$/,
		excludeDirs: /^\.(git|svn)$/,
		recursive: false,
		map: fileName => {
			const formattedFileName = camelCase(fileName, { pascalCase, preserveConsecutiveUppercase });
			return formattedFileName;
		},
	});

module.exports = {
	getDirectoryNamesInPath,
	getAllJSFiles,
};

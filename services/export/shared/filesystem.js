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
const path = require('path');
const fs = require('fs');
const { Logger } = require('lisk-service-framework');

const logger = Logger();

const createDir = (dirPath) => {
	fs.mkdirSync(`${path.dirname(__dirname)}${dirPath}`, { recursive: true }, (error) => {
		if (error) logger.error(error);
	});
};

const init = (params) => createDir(params.dirPath);

const write = async (filename, content) => {
	fs.writeFileSync(
		`${path.dirname(__dirname)}/${filename}`,
		JSON.stringify(content),
	);
};

const read = async (filename) => fs.readFileSync(`${path.dirname(__dirname)}/${filename}`, 'utf8');
// const delete = async (filename) => { };
const list = async (n, page) => { };
const purge = async (days) => { };

module.exports = {
	init,
	write,
	read,
	// delete,
	list,
	purge,
};

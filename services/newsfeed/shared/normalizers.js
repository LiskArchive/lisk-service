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
const { mapper } = require('lisk-service-framework');
const htmlToText = require('html-to-text');
const makeHash = require('object-hash');
const moment = require('moment');
const htmlEntities = require('html-entities');

const config = require('../config');

/*
 * Functions to convert original content
 */
// TODO: Replace deprecated method fromString
const textify = text => htmlToText.fromString(text, {
	format: {
		heading: (elem, fn, options) => {
			const h = fn(elem.children, options);
			return `${h.toUpperCase()}\n\n`;
		},
	},
});

const shortenContent = content => content.slice(0, config.newsContentLength);
const textifyForShort = content => shortenContent(textify(content));
const convertTime = time => new Date(Date.parse(time))
	.toISOString()
	.slice(0, 19)
	.replace('T', ' ');
const drupalDate = time => moment(time, 'MM/DD/YYYY - HH:mm') // '10/31/2019 - 09:28'
	.toISOString()
	.slice(0, 19)
	.replace('T', ' ');

const drupalContentParser = (content) => {
	content = content
		.replace(/\/\*.*\*\//g, '') // remove comments
		.replace(/\*\//g, '') //  remove comment
		.replace(/\n(\n|[ |,])+/g, '\n\n') // remove multiple \n
		.replace(/^\n*/, '') // Trim new lines at the beginning
		.replace(/\n*$/, ''); // Trim new lines at the end

	content = htmlEntities.decode(content);

	return content;
};

const htmlEntitiesDecode = content => htmlEntities.decode(content);

const authorParser = author => (author === 'admin' ? 'Lisk' : author);

const removePathFromUrl = url => url.split('/').slice(0, 3).join('/');

const drupalDomainPrefixer = (url, source) => (`${removePathFromUrl(source.url)}${url}`);

const drupalUnixTimestamp = date => moment(date, 'MM/DD/YYYY - HH:mm').unix();

const normalizeFunctions = {
	shortenContent,
	textifyForShort,
	convertTime,
	drupalDate,
	drupalContentParser,
	htmlEntitiesDecode,
	authorParser,
	drupalDomainPrefixer,
	drupalUnixTimestamp,
};

/**
 * normalizeData - Function to normalize source data to insert database
 * @param {array} customMapper -> Array that contain custom mappers for each data source.
 * Each array must have three items which are databse colum, function name,
 * key in source data that is put as the function argument
 */
const normalizeData = (source, data) => {
	const customMapper = source[source.table].customMapper || [];
	data = source.transformSourceData ? source.transformSourceData(data) : data;

	const addCustomMapper = item => (
		customMapper.reduce((acc, [targetKey, transformFnName, sourceKey]) => ({
			...acc,
			[targetKey]: normalizeFunctions[transformFnName](item[sourceKey], source),
		}), {})
	);

	const hashKeys = source.hashKeys
		? ['source', ...source.hashKeys]
		: ['source', 'source_id', 'url'];

	const getHash = item => (
		makeHash(hashKeys.reduce((acc, key) => ({
			...acc,
			[key]: item[key],
		}), {}))
	);

	data = data
		.filter(source.filter || (() => true))
		.map(item => ({
			...item,
			source: source.name,
			...addCustomMapper(item),
		}))
		.map(item => mapper(item, source[source.table].mapper));

	data.forEach((item) => {
		item.hash = getHash(item);
	});

	return data;
};

module.exports = {
	normalizeData,
	normalizeFunctions,
};

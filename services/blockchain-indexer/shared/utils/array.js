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
const dropDuplicates = arr => arr.filter((v, i, a) => a.findIndex(t => (t === v)) === i);

const range = (start = 0, end, step = 1) => {
	if (!end) {
		end = start;
		start = 0;
	}
	const arrSize = Math.floor((end - start) / step);

	// 'end' is non-inclusive
	return new Array(arrSize).fill().map((_, index) => start + index * step);
};

const sortComparator = (sortParam) => {
	const [sortProp, sortOrder] = sortParam.split(':');

	const comparator = (a, b) => {
		try {
			if (Number.isNaN(Number(a[sortProp]))) throw new Error('Not a number, try string sorting.');
			return (sortOrder === 'asc')
				? Number(a[sortProp] - b[sortProp])
				: Number(b[sortProp] - a[sortProp]);
		} catch (_) {
			return (sortOrder === 'asc')
				? a[sortProp].localeCompare(b[sortProp])
				: b[sortProp].localeCompare(a[sortProp]);
		}
	};
	return comparator;
};

const isSubstringOfArray = (collection, pattern) => {
	for (let i = 0; i < collection.length; i++) {
		if (collection[i] && collection[i].toLowerCase().includes(pattern.toLowerCase())) return true;
	}

	return false;
};

module.exports = {
	dropDuplicates,
	range,
	sortComparator,
	isSubstringOfArray,
};

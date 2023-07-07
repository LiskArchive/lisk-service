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
const PUBLIC_KEY = /^([A-Fa-f0-9]{2}){32}$/;
const ADDRESS_LISK32 = /^lsk[a-hjkm-z2-9]{38}$/;
const CSV_EXPORT_FILENAME = /^transactions_(lsk[a-hjkm-z2-9]{38})_(\d{4}-(0[1-9]|1[0-2])-([0-2][1-9]|3[01]))_(\d{4}-(0[1-9]|1[0-2])-([0-2][1-9]|3[01]))\.csv$/;

module.exports = {
	PUBLIC_KEY,
	ADDRESS_LISK32,
	CSV_EXPORT_FILENAME,
};

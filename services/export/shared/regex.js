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
const EXCEL_EXPORT_FILENAME = /^\btransactions_([a-fA-F0-9]{8})_(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.xlsx\b$/;
const PARTIAL_FILENAME = /^\b(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.json\b$/g;
const STANDARDIZED_INTERVAL = /^\b((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31)):((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\b$/g;
const EXCEL_FILE_URL = /^\/api\/v3\/export\/download\?filename=transactions_(lsk[a-hjkm-z2-9]{38})_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))_((\d{4})-((1[012])|(0?[1-9]))-(([012][1-9])|([123]0)|31))\.xlsx$/g;
const MAINCHAIN_ID = /^[a-fA-F0-9]{2}000000$/;

module.exports = {
	PUBLIC_KEY,
	ADDRESS_LISK32,
	EXCEL_EXPORT_FILENAME,
	PARTIAL_FILENAME,
	STANDARDIZED_INTERVAL,
	EXCEL_FILE_URL,
	MAINCHAIN_ID,
};

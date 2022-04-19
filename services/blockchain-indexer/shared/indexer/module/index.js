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
const requireAll = require('require-all');
const camelCase = require('camelcase');

const getAllModuleProcessors = () => requireAll({
    dirname: __dirname,
    filter: /(.+)\.js$/,
    excludeDirs: /^\.(git|svn)$/,
    recursive: false,
    filter: function (fileName) {
        if (['index.js', 'template.js'].includes(fileName)) return;
        return fileName;
    },
    map: (fileName, path) => {
        const [moduleName] = fileName.split('.js');
        const pascalCaseName = camelCase(
            moduleName,
            {
                pascalCase: true,
                preserveConsecutiveUppercase: true,
            },
        );
        return pascalCaseName;
    },
});

module.exports = getAllModuleProcessors();

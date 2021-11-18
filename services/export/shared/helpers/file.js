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
const BluebirdPromise = require('bluebird');
const path = require('path');
const fs = require('fs');
const { Logger } = require('lisk-service-framework');

const logger = Logger();

const getDaysinMilliseconds = days => days * 86400 * 1000;

const getStats = filePath => new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stat) => {
        if (err) {
            logger.error(err);
            return reject(err);
        }
        return resolve(stat);
    });
});

const createDir = (dirPath, options = { recursive: true }) => new Promise((resolve, reject) => {
    logger.debug(`Creating directory: ${dirPath}`);
    return fs.mkdir(
        dirPath,
        options,
        (err) => {
            if (err) {
                logger.error(`Error when creating directory: ${dirPath}\n`, err.message);
                return reject(err);
            }
            logger.debug(`Successfully created directory: ${dirPath}`);
            return resolve();
        },
    );
});

const init = async (params) => createDir(params.dirPath);

const write = (filePath, content) => new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(content), (err) => {
        if (err) {
            logger.error(err);
            return reject(err);
        }
        return resolve();
    });
});

const read = (filePath) => new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            logger.error(err);
            return reject(err);
        }
        return resolve(JSON.parse(data));
    });
});

const remove = (filePath) => new Promise((resolve, reject) => {
    fs.unlink(
        filePath,
        (err) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }
            return resolve();
        },
    );
});

const list = (dirPath, n = 100, page = 0) => new Promise((resolve, reject) => {
    fs.readdir(
        dirPath,
        (err, files) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }
            return resolve(files.slice(page, page + n));
        },
    );
});

const purge = (dirPath, days = 1) => new Promise((resolve, reject) => {
    fs.readdir(dirPath, async (err, files) => {
        if (err) {
            logger.error(err);
            return reject(err);
        }
        await BluebirdPromise.map(
            files,
            async (file) => {
                const stat = await getStats(path.join(dirPath, file));
                const currentTime = new Date().getTime();
                const expirationTime = new Date(stat.ctime).getTime() + getDaysinMilliseconds(days);
                if (currentTime > expirationTime) await remove(path.join(dirPath, file));
            },
            { concurrency: files.length },
        );
        return resolve();
    });
});

module.exports = {
    init,
    write,
    read,
    remove,
    list,
    purge,
};

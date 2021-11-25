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
const Minio = require('minio');
const moment = require('moment');

const {
	Readable,
} = require('stream');

const {
	Logger,
	Exceptions: { ValidationException },
} = require('lisk-service-framework');

const config = require('../../config');

const logger = Logger();

// Necessary constants
const AWS_S3_ENDPOINT = config.s3.endPoint;
const AWS_S3_ACCESS_KEY = config.s3.accessKey;
const AWS_S3_SECRET_KEY = config.s3.secretKey;
const AWS_S3_SESSION_TOKEN = config.s3.sessionToken;
const AWS_S3_REGION = config.s3.region;
const AWS_S3_BUCKET_NAME = config.s3.bucketName;

// Set up the Minio client
const minioClientParams = {
	endPoint: 'play.min.io',
	port: 9000,
	useSSL: true,
	accessKey: 'Q3AM3UQ867SPQQA43P2F',
	secretKey: 'zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG',
};

const awsClientParams = {
	endPoint: AWS_S3_ENDPOINT,
	region: AWS_S3_REGION,
	accessKey: AWS_S3_ACCESS_KEY,
	secretKey: AWS_S3_SECRET_KEY,
};

if (AWS_S3_SESSION_TOKEN) Object.assign(awsClientParams, { sessionToken: AWS_S3_SESSION_TOKEN });

const clientParams = (AWS_S3_ACCESS_KEY && AWS_S3_SECRET_KEY)
	? awsClientParams
	: minioClientParams;

const minioClient = new Minio.Client(clientParams);

// eslint-disable-next-line no-unused-vars
const createDir = async (dirPath, options) => new Promise((resolve, reject) => {
	// Check if bucket exists, create if not exist
	minioClient.bucketExists(
		AWS_S3_BUCKET_NAME,
		(err, isExists) => {
			if (err) return reject('Error creating bucket.', err);
			if (isExists) return resolve(`Bucket ${AWS_S3_BUCKET_NAME} already exists in region '${AWS_S3_REGION}'.`);

			minioClient.makeBucket(
				AWS_S3_BUCKET_NAME,
				AWS_S3_REGION,
				(err, data) => {
					if (err) return reject('Error creating bucket.', err);
					logger.info(data);
					return resolve(`Bucket '${AWS_S3_BUCKET_NAME}' created successfully in region '${AWS_S3_REGION}'`);
				},
			);
		},
	);
});

const write = async (fileName, content) => new Promise((resolve, reject) => {
	// Stringify the content
	const contentString = (typeof content === 'object')
		? JSON.stringify(content)
		: content;

	// Create a Readable stream from the content string
	const stream = new Readable();
	stream.push(Buffer.from(contentString));
	stream.push(null);

	minioClient.putObject(
		AWS_S3_BUCKET_NAME,
		fileName,
		stream,
		(err, objInfo) => {
			if (err) return reject(err);
			return resolve(`Successfully wrote file ${fileName}`, objInfo);
		},
	);
});

const read = async (fileName) => new Promise((resolve, reject) => {
	minioClient.getObject(
		AWS_S3_BUCKET_NAME,
		fileName,
		(err, stream) => {
			if (err) return reject(err);

			const chunks = [];
			stream.on('data', (chunk) => chunks.push(chunk));
			stream.on('error', (err) => reject(err));
			stream.on('end', () => {
				const contentString = Buffer.concat(chunks).toString('utf8');
				new Promise((innerResolve) => innerResolve(JSON.parse(contentString)))
					.then(json => resolve(json))
					.catch(_ => resolve(contentString));
			});
		});
});

const remove = async (fileName) => new Promise((resolve, reject) => {
	minioClient.removeObject(
		AWS_S3_BUCKET_NAME,
		fileName,
		(err) => {
			if (err) return reject(`Unable to remove file ${fileName}`);
			resolve(`Successfully to removed file ${fileName}`);
		});
});

// eslint-disable-next-line no-unused-vars
const list = async (dirPath, count = 100, page = 0) => new Promise((resolve, reject) => {
	const chunks = [];
	const stream = minioClient.listObjects(AWS_S3_BUCKET_NAME);
	stream.on('data', (chunk) => chunks.push(chunk));
	stream.on('error', (err) => reject(err));
	stream.on('end', () => resolve(chunks.slice(page, page + count).map(e => e.name)));
});

const filterEligibleFilesForPurging = async (fileInfoList, days) => {
	const deleteBeforeMoment = moment().subtract(days, 'days');

	// Filter out files older than `days` days
	const filteredFileInfoList = fileInfoList
		.filter(file => deleteBeforeMoment.diff(moment(file.lastModified)) >= 0 ? true : false);
	const eligibleFiles = filteredFileInfoList.map(f => f.name);
	return eligibleFiles;
};

// eslint-disable-next-line no-unused-vars
const purge = async (dirPath, days) => new Promise((resolve, reject) => {
	if (days === undefined) throw new ValidationException('days cannot be undefined');

	const fileInfoList = [];
	const stream = minioClient.listObjects(AWS_S3_BUCKET_NAME);
	stream.on('data', (info) => fileInfoList.push(info));
	stream.on('error', (err) => reject(`Error while purging: ${err}`));
	stream.on('end', async () => {
		const eligibleFiles = await filterEligibleFilesForPurging(fileInfoList, days);
		Promise.all(eligibleFiles.map(f => remove(f)))
			.then(() => resolve(`Successfully removed ${eligibleFiles.length} files.`))
			.catch((err) => reject(err));
	});
});

const exists = async (fileName) => new Promise((resolve) => {
	read(fileName)
		.then(() => resolve(true))
		.catch(() => resolve(false));
});

const init = async (params) => createDir(params.dirPath);

// TODO: Remove test code
// createDir()
// write('test.json', { a: 1 })
// read('test1.json')
// remove('test1.json')
// list()
// exists('test1.json')
purge('', 0)
	.then(res => console.log(typeof res, res))
	.catch(err => console.error(err));

module.exports = {
	write,
	read,
	remove,
	list,
	purge,
	exists,
	init,
};

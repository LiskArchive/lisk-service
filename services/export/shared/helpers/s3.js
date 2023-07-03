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

// Necessary constants/variables
const AWS_S3_ENDPOINT = config.s3.endPoint;
const AWS_S3_ACCESS_KEY = config.s3.accessKey;
const AWS_S3_SECRET_KEY = config.s3.secretKey;
const AWS_S3_SESSION_TOKEN = config.s3.sessionToken;
const AWS_S3_REGION = config.s3.region;
let AWS_S3_BUCKET_NAME = config.s3.bucketNameDefault;

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
		(errBucketExists, isExists) => {
			if (errBucketExists) return reject(errBucketExists);
			if (isExists) return resolve(`Bucket ${AWS_S3_BUCKET_NAME} already exists in region '${AWS_S3_REGION}'.`);

			return minioClient.makeBucket(
				AWS_S3_BUCKET_NAME,
				AWS_S3_REGION,
				(errMakeBucket, data) => {
					if (errMakeBucket) return reject(errMakeBucket);
					logger.info(data);
					return resolve(`Bucket '${AWS_S3_BUCKET_NAME}' created successfully in region '${AWS_S3_REGION}'.`);
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
		(errGetObject, stream) => {
			if (errGetObject) reject(errGetObject);
			else {
				const chunks = [];
				stream.on('data', (chunk) => chunks.push(chunk));
				stream.on('error', (errorStream) => reject(errorStream));
				stream.on('end', () => {
					const contentString = Buffer.concat(chunks).toString('utf8');
					new Promise((innerResolve) => innerResolve(JSON.parse(contentString)))
						.then(json => resolve(json))
						.catch(() => resolve(contentString));
				});
			}
		});
});

const remove = async (file) => new Promise((resolve, reject) => {
	const files = Array.isArray(file) ? file : [file];
	minioClient.removeObjects(
		AWS_S3_BUCKET_NAME,
		files,
		(err) => {
			if (err) reject(err);
			resolve('Successfully to removed the requested file(s)');
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
		.filter(file => deleteBeforeMoment.diff(moment(file.lastModified)) >= 0);
	const eligibleFiles = filteredFileInfoList.map(f => f.name);
	return eligibleFiles;
};

// eslint-disable-next-line no-unused-vars
const purge = async (dirPath, days) => new Promise((resolve, reject) => {
	if (days === undefined) throw new ValidationException('days cannot be undefined');

	const fileInfoList = [];
	const stream = minioClient.listObjects(AWS_S3_BUCKET_NAME);
	stream.on('data', (info) => fileInfoList.push(info));
	stream.on('error', (err) => reject(err));
	stream.on('end', async () => {
		const eligibleFiles = await filterEligibleFilesForPurging(fileInfoList, days);
		remove(eligibleFiles)
			.then(() => resolve(`Successfully removed ${eligibleFiles.length} files.`))
			.catch((err) => reject(err));
	});
});

const isFile = async (filePath) => new Promise((resolve, reject) => {
	minioClient.statObject(AWS_S3_BUCKET_NAME, filePath, (err, stat) => {
		if (err) {
			reject(err);
		} else {
			resolve(stat.size > 0); // If file size is greater than 0, consider it as a file
		}
	});
});

const exists = async (fileName) => new Promise((resolve) => {
	read(fileName)
		.then(() => resolve(true))
		.catch(() => resolve(false));
});

const init = async ({ s3 }) => {
	if (s3 && s3.bucketName) AWS_S3_BUCKET_NAME = s3.bucketName;
	return createDir();
};

module.exports = {
	write,
	read,
	remove,
	list,
	purge,
	exists,
	init,
	isFile,

	// For functional tests teardown
	minioClient,
};

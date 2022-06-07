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
const config = require('../../config');
const s3 = require('../../shared/helpers/s3');

describe('Test AWS s3 interface', () => {
	const lConfig = { s3: { bucketName: 'test-bucket' } };
	const existingFiles = [];
	const nonexistingFiles = [
		'non-existing-file-1.json',
		'non-existing-file-2.txt',
		'non-existing-file-3.csv',
	];

	afterAll(async () => {
		/* eslint-disable no-console */
		await s3.minioClient.removeBucket(
			lConfig.s3.bucketName,
			(err) => err
				? console.log('unable to remove bucket.')
				: console.log('Bucket removed successfully.'),
		);
		/* eslint-enable no-console */
	});

	describe('init() method', () => {
		it('Successfully initializes', async () => {
			expect(s3.init(lConfig))
				.resolves
				.toBeTruthy();
		});

		it('Re-initializing does not throw errors', async () => {
			expect(s3.init(lConfig))
				.resolves
				.toBe(`Bucket ${lConfig.s3.bucketName} already exists in region '${config.s3.region}'.`);
		});
	});

	describe('write() & read() method', () => {
		it('writes json', async () => {
			const fileName = 'test.json';
			const fileContent = { a: 1, b: 2 };

			await s3.write(fileName, fileContent);
			const content = await s3.read(fileName);
			expect(content).toStrictEqual(fileContent);

			existingFiles.push(fileName);
		});

		it('writes string', async () => {
			const fileName = 'test.txt';
			const fileContent = 'It\'s a string.';

			await s3.write(fileName, fileContent);
			const content = await s3.read(fileName);
			expect(content).toBe(fileContent);

			existingFiles.push(fileName);
		});

		it('writes csv', async () => {
			const fileName = 'test.csv';
			const fileContent = '"a";"b"\n"1";"2"';

			await s3.write(fileName, fileContent);
			const content = await s3.read(fileName);
			expect(content).toBe(fileContent);

			existingFiles.push(fileName);
		});
	});

	describe('exists() method', () => {
		it('returns true for existing file', async () => {
			expect(existingFiles.length).toBeGreaterThan(0);
			existingFiles.forEach(async (fileName) => {
				const isExists = await s3.exists(fileName);
				expect(isExists).toBe(true);
			});
		});

		it('returns false for non-existing file', async () => {
			expect(nonexistingFiles.length).toBeGreaterThan(0);
			nonexistingFiles.forEach(async (fileName) => {
				const isExists = await s3.exists(fileName);
				expect(isExists).toBe(false);
			});
		});
	});

	describe('list() method', () => {
		it('returns all the existing filenames', async () => {
			const listedFiles = await s3.list();
			expect(typeof listedFiles).toBe('object');
			expect(Array.isArray(listedFiles)).toBeTruthy();
			expect(listedFiles.length).toBeGreaterThan(0);
			existingFiles.forEach(async (fileName) => {
				expect(listedFiles).toContain(fileName);
			});
		});
	});

	describe('remove() method', () => {
		const successMessage = 'Successfully to removed the requested file(s)';

		it('removes a file by name', async () => {
			expect(existingFiles.length).toBeGreaterThan(0);
			const fileName = existingFiles.pop();

			const message = await s3.remove(fileName);
			expect(message).toBe(successMessage);

			const isExists = await s3.exists(fileName);
			expect(isExists).toBe(false);
		});

		it('removes a list of files by their names', async () => {
			expect(existingFiles.length).toBeGreaterThan(1);

			const message = await s3.remove(existingFiles);
			expect(message).toBe(successMessage);

			existingFiles.forEach(async (fileName) => {
				const isExists = await s3.exists(fileName);
				expect(isExists).toBe(false);
			});
		});

		it('does not throw error when attempting to remove non-existent files', async () => {
			expect(nonexistingFiles.length).toBeGreaterThan(1);
			expect(s3.remove(nonexistingFiles)).resolves.toBe(successMessage);
		});
	});

	describe('purge() method', () => {
		it('removes the files by their last modified time', async () => {
			const randomList = Array(10).fill().map((_, i) => ({ index: i }));
			randomList.forEach(async (item, i) => {
				await s3.write(`purgeFile_${i + 1}.json`, item);
			});

			const beforePurgeFiles = await s3.list();
			expect(beforePurgeFiles.length).toBeGreaterThan(0);

			await s3.purge('', 0);

			const afterPurgeFiles = await s3.list();
			expect(afterPurgeFiles.length).toBe(0);
		});
	});
});

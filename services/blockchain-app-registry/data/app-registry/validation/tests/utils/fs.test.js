const fs = require('fs/promises');
const { readFileLinesToArray } = require('../../src/utils/fs');

describe('Testing Utility functions', () => {
	const mockFilePath = 'mock/file/path';
	const mockData = 'line 1\nline 2\n// commented line\n  \nline 4\n# commented line\n';

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('readFileLinesToArray - should read file and return array of lines without empty lines and comments', async () => {
		jest.spyOn(fs, 'readFile').mockResolvedValue(mockData);
		const result = await readFileLinesToArray(mockFilePath);
		expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf8');
		expect(result).toEqual(['line 1', 'line 2', 'line 4']);
	});

	test('readFileLinesToArray - should return empty array if file read fails', async () => {
		jest.spyOn(console, 'error').mockImplementation(() => {});
		jest.spyOn(fs, 'readFile').mockRejectedValue('file read error');
		const result = await readFileLinesToArray(mockFilePath);
		expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf8');
		expect(result).toEqual([]);
		expect(console.error).toHaveBeenCalledWith('Error reading file: file read error');
	});
});

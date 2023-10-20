const fs = require('fs');
const http = require('http');
const { downloadFile } = require('../../../../shared/utils/download'); // Replace with the actual import path.

// Mocking the 'http' module to control responses for testing.
jest.mock('http', () => ({
	request: jest.fn(),
}));

describe('downloadFile', () => {
	const mockUrl = 'http://example.com/file.json';
	const mockHeaders = { Authorization: 'Bearer abc123' };
	const mockFilePath = '/path/to/downloaded/file.json';
	const mockData = {
		content: Buffer.from('Hello, World!', 'utf-8').toString('base64'),
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('it should download a file successfully', async () => {
		const writeFileSyncMock = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

		// Mock the HTTP response.
		const mockHttpResponse = {
			statusCode: 200,
			statusMessage: 'OK',
			on: (event, callback) => {
				if (event === 'data') {
					// Provide a valid JSON response
					callback(JSON.stringify(mockData));
				} else if (event === 'end') {
					callback();
				}
			},
		};

		// Mock the HTTP request and response.
		http.request.mockImplementation((url, options, callback) => {
			callback(mockHttpResponse);
			return {
				on: jest.fn(),
				end: jest.fn(),
			};
		});

		await downloadFile(mockUrl, mockHeaders, mockFilePath);

		expect(http.request).toHaveBeenCalledWith(
			mockUrl,
			{ method: 'GET', headers: mockHeaders },
			expect.any(Function),
		);
		expect(writeFileSyncMock).toHaveBeenCalledWith(mockFilePath, 'Hello, World!');
	});

	it('it should reject with an error when HTTP status code is not 200', async () => {
		// Mock the HTTP response with an error status code.
		const mockHttpResponse = {
			statusCode: 404,
			statusMessage: 'Not Found',
			on: (event, callback) => {
				if (event === 'end') {
					callback();
				}
			},
		};

		// Mock the HTTP request and response.
		http.request.mockImplementation((url, options, callback) => {
			callback(mockHttpResponse);
			return {
				on: jest.fn(),
				end: jest.fn(),
			};
		});

		await expect(downloadFile(mockUrl, mockHeaders, mockFilePath)).rejects.toThrowError(
			'Download failed with HTTP status code: 404 (Not Found).',
		);
	});

	it('it should reject with an error when request fails', async () => {
		const mockError = new Error('Request error');

		// Mock the HTTP request to trigger an error.
		http.request.mockImplementation(() => {
			throw mockError;
		});

		await expect(downloadFile(mockUrl, mockHeaders, mockFilePath)).rejects.toThrowError(mockError);
	});

	it('it should reject with an error for invalid URL or filePath', async () => {
		const invalidUrl = '';
		const invalidFilePath = '';

		await expect(downloadFile(invalidUrl, mockHeaders, mockFilePath)).rejects.toThrowError(
			'Invalid url or filePath. url:  filePath:',
		);

		await expect(downloadFile(mockUrl, mockHeaders, invalidFilePath)).rejects.toThrowError(
			'Invalid url or filePath. url: http://example.com/file.json filePath:',
		);
	});
});

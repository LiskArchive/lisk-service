const fs = require('fs');

const writeJson = (path, obj) => new Promise((resolve, reject) => {
	fs.writeFile(path, JSON.stringify(obj, null, 4), (err) => {
		if (err) {
			console.error(err);
			reject(err);
		};
		console.log(`File has been created: ${path}`);
		resolve();
	});
});

const readJson = (path) => new Promise((resolve, reject) => {
	fs.readFile(path, (err, data) => {
		if (err) {
			console.error(err);
			reject(err);
		};
		resolve(JSON.parse(data));
	});
});

module.exports = { writeJson, readJson };

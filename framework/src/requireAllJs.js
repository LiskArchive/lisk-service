const requireAll = require('require-all');
const path = require('path');

const requireAllJs = absolutePath => requireAll({
	filter: /(.+)\.js$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
	dirname: path.resolve(absolutePath),
});

module.exports = requireAllJs;

var fs = require('fs'), path = require('path'), cheerio = require('cheerio'), async = require('async');
var argv = require('optimist').usage('Extrahiert alle Kategoriebezeichnungen aus dem HTML-Dateien der Daten-CD im JSON-Format\nUsage: $0 [html_folder]')
		.demand(1).argv;

var htmlDirectoryPath = argv._[0] + path.sep;

var parseHtml = function(html) {
	var categories = {};
	var $ = cheerio.load(html);
	$('#rechts2 tr').each(function(index, row) {
		var links = $(row).find('a');
		if (links.length === 2) {
			var categoryId = $(links).eq(0).text();
			var categoryName = $(links).eq(1).text().replace(/\s+/g, ' ');
			categories[categoryId] = categoryName;
		}
	});
	return categories;
};

var handleFile = function(filename, callback) {
	fs.readFile(htmlDirectoryPath + filename, {
		encoding: 'UTF-8'
	}, function(err, html) {
		if (err) {
			callback(err);
		} else {
			var categories = parseHtml(html);
			callback(null, categories);
		}
	});
};

var outputJson = function(err, categoriesPerFile) {
	if (err) {
		throw err;
	}

	var allCategories = {};
	categoriesPerFile.forEach(function(categories) {
		for ( var key in categories) {
			if (allCategories[key]) {
				console.warn('overwriting ' + key + ' - old value: ' + allCategories[key] + '; new value: ' + categories[key]);
			}
			allCategories[key] = categories[key];
		}
	});

	console.log(JSON.stringify(allCategories, true, "  "));
};

fs.readdir(htmlDirectoryPath, function(err, filenames) {
	var htmlFilenames = filenames.filter(function(filename) {
		return path.basename(filename).indexOf('hp_') === 0 && path.extname(filename) === '.html';
	});

	async.mapLimit(htmlFilenames, 10, handleFile, outputJson);
});
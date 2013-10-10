var fs = require('fs'), csv = require('csv'), squel = require('squel');
var argv = require('optimist').usage('Convert a budget file\nUsage: $0 -y [year] [budgetFile]').describe('t', 'add truncate command').describe('y', 'year')
		.alias('t', 'truncate').alias('y', 'year').demand(1).demand('y').argv;

var year = argv.y;
var table = 't_' + year;

var toNumber = function(rawValue) {
	return parseInt(rawValue.trim().replace(/\./g, ''), 10);
};
var paddingLeft = function(string, paddingValue) {
	return String(paddingValue + string).slice(-paddingValue.length);
};

var convertData = function(data) {
	data.forEach(function(row) {
		var type = parseInt(row[2].substr(0, 1), 10) <= 3 ? 'Einnahmen' : 'Ausgaben';

		var insertCommand = squel.insert().into(table);
		insertCommand.set('Einzelplan', row[0]);
		insertCommand.set('Beschreibung', row[9]);
		insertCommand.set('Beschreibung1', 'z');
		insertCommand.set('Wert1', toNumber(row[5]));
		insertCommand.set('Wert2', toNumber(row[6]));
		insertCommand.set('Typ', type);
		insertCommand.set('Jahr', year);
		insertCommand.set('Kapitel', paddingLeft(row[0], '00') + ' ' + paddingLeft(row[1], '000'));
		insertCommand.set('Kapitelname', 'y');
		insertCommand.set('Kategorie', 'x');
		insertCommand.set('Kategorie_ID', '1');
		insertCommand.set('Titel', paddingLeft(row[2], '000') + ' ' + paddingLeft(row[3], '00'));
		console.log(insertCommand.toString() + ';');
	});
};

if (argv.t) {
	console.log(squel.remove().from(table).toString() + ';');
}
csv().from.path(argv._[0], {
	delimiter: ',',
	escape: '"'
}).to.array(convertData);
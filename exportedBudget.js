var fs = require('fs'), csv = require('csv'), squel = require('squel');
var argv = require('optimist').usage('Konvertiert eine von haushalt.piratenfraktion-nrw.de exportierte CSV-Datei\nUsage: $0 -y [year] [file]').describe('y',
		'year').alias('y', 'year').describe('t', 'add truncate command').alias('t', 'truncate').demand([1, 'y']).argv;

var table = 't_' + argv.y;

var convertData = function(data) {
	var kategorieId = 1;
	var kategorieName = '';

	data.forEach(function(row) {
		if (kategorieName != row[5]) {
			kategorieName = row[5];
			kategorieId++;
		}

		var insertCommand = squel.insert().into(table);
		insertCommand.set('Einzelplan', row[1]);
		insertCommand.set('Beschreibung', row[10].replace(/'/g, "\\'"));
		insertCommand.set('Beschreibung1', row[11].replace(/'/g, "\\'"));
		insertCommand.set('Wert1', row[12]);
		insertCommand.set('Wert2', row[13]);
		insertCommand.set('Typ', row[4]);
		insertCommand.set('Jahr', row[0]);
		insertCommand.set('Kapitel', row[2]);
		insertCommand.set('Kapitelname', row[3].replace(/'/g, "\\'"));
		insertCommand.set('Kategorie', kategorieName.replace(/'/g, "\\'"));
		insertCommand.set('Kategorie_ID', kategorieId);
		insertCommand.set('Titel', row[8]);
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

var fs = require('fs'), csv = require('csv'), squel = require('squel');
var argv = require('optimist').usage('Convert a budget file\nUsage: $0 -y [year] -k [kapitelFile] [budgetFile]').describe('t', 'add truncate command')
		.describe('y', 'year').describe('k', 'json file with all kapitel names (see kapitelnamen.js and data/kapitel.js)').alias('t', 'truncate').alias('y',
				'year').demand([1, 'y', 'k']).argv;

var year = argv.y;
var table = 't_' + year;
var hauptgruppen = ['Steuern und steuerähnlichen Abgaben sowie EU- Eigenmittel', 'Verwaltungseinnahmen, Einnahmen aus Schuldendienst und dgl.',
	'Zuweisungen und Zuschüsse mit Ausnahme für Investitionen',
	'Schuldenaufnahmen, Zuweisungen und Zuschüsse für Investitionen, besondere Finanzierungseinnahmen', 'Personalausgaben',
	'Sächliche Verwaltungsausgaben und Ausgaben für den Schuldendienst', 'Zuweisungen und Zuschüsse mit Ausnahme für Investitionen', 'Baumaßnahmen',
	'Sonstige Ausgaben für Investitionen und Investitionsförderungsmaßnahmen', 'Besondere Finanzierungsausgaben'];

var toNumber = function(rawValue) {
	return parseInt(rawValue.trim().replace(/\./g, ''), 10);
};
var paddingLeft = function(string, paddingValue) {
	return String(paddingValue + string).slice(-paddingValue.length);
};

var convertData = function(data, kapitel) {
	data.forEach(function(row) {
		var hauptgruppeId = parseInt(paddingLeft(row[2], '000').substr(0, 1), 10);
		var type = hauptgruppeId <= 3 ? 'Einnahmen' : 'Ausgaben';
		var kapitelName = kapitel[paddingLeft(row[0], '00') + '.' + paddingLeft(row[1], '000')];
		var hauptgruppeName = hauptgruppen[hauptgruppeId];

		var insertCommand = squel.insert().into(table);
		insertCommand.set('Einzelplan', row[0]);
		insertCommand.set('Beschreibung', row[9]);
		insertCommand.set('Beschreibung1', '');
		insertCommand.set('Wert1', toNumber(row[5]));
		insertCommand.set('Wert2', toNumber(row[6]));
		insertCommand.set('Typ', type);
		insertCommand.set('Jahr', year);
		insertCommand.set('Kapitel', paddingLeft(row[0], '00') + ' ' + paddingLeft(row[1], '000'));
		insertCommand.set('Kapitelname', kapitelName);
		insertCommand.set('Kategorie', hauptgruppeName);
		insertCommand.set('Kategorie_ID', 2000 + hauptgruppeId);
		insertCommand.set('Titel', paddingLeft(row[2], '000') + ' ' + paddingLeft(row[3], '00'));
		console.log(insertCommand.toString() + ';');
	});
};

if (argv.t) {
	console.log(squel.remove().from(table).toString() + ';');
}

fs.readFile(argv.k, 'utf8', function(err, kapitelJson) {
	if (err) {
		throw err;
	}
	var kapitel = JSON.parse(kapitelJson);

	csv().from.path(argv._[0], {
		delimiter: ',',
		escape: '"'
	}).to.array(function(data) {
		convertData(data, kapitel);
	});
});

var fs = require('fs'), csv = require('csv'), squel = require('squel'), settings = require('./settings.json'), mysql = require('mysql');
var argv = require('optimist')
    .usage('Parse a file with explanations (Erlaeuterungen) and update the according data table\nUsage: $0 -y [year] [explanationFile]')
    .describe('y', 'year')
    .demand([1, 'y']).argv;

var year = argv.y;
var table = 't_' + year;
var db = mysql.createConnection(settings.database);

var convertData = function (data) {
    data.forEach(function (row) {
    });
};

csv().from.path(argv.d, {
    delimiter: ',',
    escape: '"'
}).to.array(function (data) {
    convertData(data);
});

var fs = require('fs'), csv = require('csv'), squel = require('squel'), settings = require('./settings.json'), mysql = require('mysql'), parser = require('./explanations-parser.js'), BudgetEntries = parser.BudgetEntries;
var argv = require('optimist')
    .usage('Parse a file with explanations (Erlaeuterungen) and update the according data table\nUsage: $0 -y [year] [explanationFile]')
    .describe('y', 'year')
    .demand([1, 'y']).argv;

var year = argv.y;
var table = 't_' + year;
var db = mysql.createConnection(settings.database);

var convertData = function (explanationData) {
    var explanations = [];
    delete explanationData[0];
    explanationData.forEach(function (row) {
        explanations.push({
            'KapitelStr': row[0],
            'zuId': row[1],
            'zuStr': row[2],
            'Erlaeuterungen': row[3]
        })
    });

    db.query('SELECT Einzelplan, Kapitel, Titel FROM ' + table, function (err, budgetRows) {
        if (err) throw err;
        var budgetEntries = new BudgetEntries(budgetRows);

        var handledExplanations = 0;
        explanations.forEach(function (explanation) {
            var result = budgetEntries.addExplanation(explanation);
            if (result) handledExplanations++;
        });

        db.query("DELETE FROM explanations WHERE year = ?", [year]);

        Object.keys(budgetEntries.getExplanations()).forEach(function (chapterId) {
            var chapter = budgetEntries.getExplanations()[chapterId];
            if (chapter.explanation) {
                db.query("INSERT INTO explanations (chapter, year, text) VALUES (?, ?, ?)", [chapterId, year, chapter.explanation]);
            }
            Object.keys(chapter.titles).forEach(function (titleId) {
                db.query("INSERT INTO explanations (chapter, title, year, text) VALUES (?, ?, ?, ?)", [chapterId, titleId, year, chapter.titles[titleId]]);
            });
            Object.keys(chapter.categories).forEach(function (categoryId) {
                db.query("INSERT INTO explanations (chapter, category, year, text) VALUES (?, ?, ?, ?)", [chapterId, categoryId, year, chapter.categories[categoryId]]);
            });
        });

        db.end();

        console.log(handledExplanations + " / " + explanations.length + " (" + (Math.round(handledExplanations / explanations.length * 100)) + "%)");
    });
};

csv().from.path(argv._[0], {
    delimiter: ',',
    escape: '"'
}).to.array(function (data) {
    convertData(data);
});

var parser = require("../explanations-parser.js"), BudgetEntries = parser.BudgetEntries, assert = require("assert");

describe('BudgetEntry addExplanation', function () {
    var budgetEntries;

    beforeEach(function () {
        budgetEntries = new BudgetEntries([
            {
                'Kapitel': '01 010',
                'Titel': '119 01'
            },
            {
                'Kapitel': '01 010',
                'Titel': '120 01'
            },
            {
                'Kapitel': '01 010',
                'Titel': '120 02'
            },
            {
                'Kapitel': '01 020',
                'Titel': '120 01'
            },
            {
                'Kapitel': '01 010',
                'Titel': '120 90'
            },
            {
                'Kapitel': '01 010',
                'Titel': '120 95'
            }
        ]);
    });

    describe('parser', function () {
        it("should assign explanations like 'Zu Titel NNN NN' to all budget entries with the same title (direct match)", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu Titel 119 01:',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.titles['119 01'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });

        it("should assign explanations like 'Zu den Titeln NNN NN, PP PPP' to all budget entries with the same title (direct match)", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu den Titeln 119 01, 120 01 und 120 02:',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.titles['119 01'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
            assert.equal(chapter.titles['120 01'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
            assert.equal(chapter.titles['120 02'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });

        it("should assign explanations like 'Zu Titelgruppe NN' to all budget entries with a title that ends with NN", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu Titelgruppe 01:',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.titles['119 01'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
            assert.equal(chapter.titles['120 01'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });

        it("should assign explanations like 'Zu den Titelgruppen 90 bis 99' to all budget entries with a title that ends with 90 to 99", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu den Titelgruppen 90 bis 99:',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.titles['120 90'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
            assert.equal(chapter.titles['120 95'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });

        it("should assign explanations like 'Zu den Personalausgaben' to all budget entries with category 4", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu den Personalausgaben',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.categories['4'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });

        it("should assign explanations like 'Zu den Ausgaben' to all budget entries with category 4 or above", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu den Ausgaben',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.categories['4'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
            assert.equal(chapter.categories['9'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });

        it("should assign explanations like 'Zu den Einnahmen' to all budget entries with category 3 or below", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu den Einnahmen',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.categories['3'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
            assert.equal(chapter.categories['0'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });

        it("should assign explanations like 'Zu den Zuweisungen' to all budget entries with category 6", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu den Zuweisungen',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.categories['6'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });

        it("should assign explanations like 'Zu Hauptgruppe X' to all budget entries with category X", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu Hauptgruppe 6',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.categories['6'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });

        it("should assign explanations like 'Zu den Sächliche Verwaltungsausgaben:' to all budget entries with category 5", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu den Sächliche Verwaltungsausgaben:',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.categories['5'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });

        it("should assign explanations like 'Zu den Sächliche Verwaltungsausgaben, Zuweisungen und Zuschüssen' to all budget entries with category 5 or 6", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu den Sächliche Verwaltungsausgaben, Zuweisungen und Zuschüssen',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.categories['5'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
            assert.equal(chapter.categories['6'], '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });

        it("should assign explanations like 'Zu Kapitel XX XXX' to all budget entries with the same chapter (direct match)", function () {
            budgetEntries.addExplanation({
                'KapitelStr': 'Kapitel 01 010',
                'zuId': 'Zu Kapitel 01 010:',
                'Erlaeuterungen': 'test'
            });
            var chapter = budgetEntries.getExplanations()['01 010'];
            assert.equal(chapter.explanation, '<div class="explanation-entry" style="position:relative;height:72px">test</div>');
        });
    });

    it("should concatenate multiple explanations for a title", function () {
        budgetEntries.addExplanation({
            'KapitelStr': 'Kapitel 01 010',
            'zuId': 'Zu Titel 119 01:',
            'Erlaeuterungen': 'test'
        });
        budgetEntries.addExplanation({
            'KapitelStr': 'Kapitel 01 010',
            'zuId': 'Zu Titelgruppe 01:',
            'Erlaeuterungen': 'test2'
        });
        var chapter = budgetEntries.getExplanations()['01 010'];
        assert.equal(chapter.titles['119 01'], '<div class="explanation-entry" style="position:relative;height:72px">test</div><div class="explanation-entry" style="position:relative;height:72px">test2</div>');
        assert.equal(chapter.titles['120 01'], '<div class="explanation-entry" style="position:relative;height:72px">test2</div>');
    });
});
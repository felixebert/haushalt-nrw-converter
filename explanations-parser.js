var titleParserFactory = {
    regexp: /Zu Titel ([\w]{3} [\w]{2})/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        var explanationTitle = this.regexp.exec(explanation.zuId)[1];
        return function () {
            return {
                'listName': 'titles',
                'keys': [explanationTitle]
            };
        }
    }
};

var titleListParserFactory = {
    regexp: /Zu den Titeln/i,
    titleRegexp: /([0-9]{3} [0-9]{2})/g,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        var keys = [];
        var match;
        while (match = this.titleRegexp.exec(explanation.zuId)) {
            keys.push(match[1]);
        }
        return function () {
            return {
                'listName': 'titles',
                'keys': keys
            };
        }
    }
};

var categoryPersonSpendingsParserFactory = {
    regexp: /Zu den Personalausgaben/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        return function () {
            return {
                'listName': 'categories',
                'keys': ['4']
            };
        }
    }
};

var categorySpendingsParserFactory = {
    regexp: /Zu den Ausgaben/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        return function () {
            return {
                'listName': 'categories',
                'keys': ['4', '5', '6', '7', '8', '9']
            };
        }
    }
};

var categorySpecificParserFactory = {
    regexp: /Zu Hauptgruppe ([0-9]{1})/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        var categoryId = this.regexp.exec(explanation.zuId)[1];
        return function () {
            return {
                'listName': 'categories',
                'keys': [categoryId]
            };
        }
    }
};

var categoryEarningsParserFactory = {
    regexp: /Zu den Einnahmen/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        return function () {
            return {
                'listName': 'categories',
                'keys': ['0', '1', '2', '3']
            };
        }
    }
};

var categoryAllicationsParserFactory = {
    regexp: /Zu den Zuweisungen/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        return function () {
            return {
                'listName': 'categories',
                'keys': ['6']
            };
        }
    }
};

var categoryAllications5ParserFactory = {
    regexp: /Zu den Sächliche Verwaltungsausgaben:/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        return function () {
            return {
                'listName': 'categories',
                'keys': ['5']
            };
        }
    }
};

var categoryAllications5And6ParserFactory = {
    regexp: /Zu den Sächliche Verwaltungsausgaben, Zuweisungen und Zuschüssen/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        return function () {
            return {
                'listName': 'categories',
                'keys': ['5', '6']
            };
        }
    }
};

var titleGroupParserFactory = {
    regexp: /Zu Titelgruppe ([\w]{2})/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        var explanationTitleGroup = this.regexp.exec(explanation.zuId)[1];
        return function (budgetEntries) {
            var keys = [];
            budgetEntries.forEach(function (budgetEntry) {
                if (budgetEntry.Titel.substr(-2) === explanationTitleGroup) {
                    keys.push(budgetEntry.Titel);
                }
            });
            return {
                'listName': 'titles',
                'keys': keys
            };
        }
    }
};

var titleGroupRangeParserFactory = {
    regexp: /Zu den Titelgruppen 90 bis 99/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        return function (budgetEntries) {
            var keys = [];
            budgetEntries.forEach(function (budgetEntry) {
                if (budgetEntry.Titel.substr(-2) >= 90 && budgetEntry.Titel.substr(-2) <= 99) {
                    keys.push(budgetEntry.Titel);
                }
            });
            return {
                'listName': 'titles',
                'keys': keys
            };
        }
    }
};

var titleKapitelParserFactory = {
    regexp: /Zu Kapitel ([\w]{2} [\w]{3})/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.zuId);
    },
    getParserFor: function (explanation) {
        var explanationKapitel = this.regexp.exec(explanation.zuId)[1];
        return function () {
            return {
                'listName': 'chapter'
            }
        }
    }
};
var parserFactories = [titleParserFactory, titleGroupParserFactory, titleKapitelParserFactory, categoryPersonSpendingsParserFactory, categorySpendingsParserFactory, categoryEarningsParserFactory, categoryAllicationsParserFactory, categorySpecificParserFactory, categoryAllications5And6ParserFactory, categoryAllications5ParserFactory, titleListParserFactory, titleGroupRangeParserFactory];

var kapitelParser = {
    regexp: /Kapitel ([\w]{2} [\w]{3})/,
    isApplicableTo: function (explanation) {
        return this.regexp.test(explanation.KapitelStr);
    },
    parse: function (explanation) {
        return this.regexp.exec(explanation.KapitelStr)[1];
    }
};

var BudgetEntries = function (budgetEntries) {
    var explanations = {};
    var topPattern = /top:([0-9]+)px/g;

    var getParserFor = function (explanation) {
        var applicableParserFactories = parserFactories.filter(function (parserFactory) {
            return parserFactory.isApplicableTo(explanation);
        });
        if (applicableParserFactories.length === 0) {
            return null;
        }
        if (applicableParserFactories.length > 1) {
            throw "more than one parser matches!";
        }
        return applicableParserFactories[0].getParserFor(explanation);
    };

    var appendText = function (textToAdd) {
        var height = 0;
        var match;
        while (match = topPattern.exec(textToAdd)) {
            if (match[1] > height) {
                height = parseInt(match[1], 10);
            }
        }
        height += 72;
        return '<div class="explanation-entry" style="position:relative;height:' + height + 'px">' + textToAdd + '</div>';
    };

    var getChapter = function (chapterId) {
        if (!explanations[chapterId]) {
            explanations[chapterId] = {
                explanation: "",
                titles: {},
                categories: {}
            };
            explanations[chapterId].addExplanation = function (parserResult, explanation) {
                if (parserResult.listName === "chapter") {
                    explanations[chapterId].explanation = appendText(explanation.Erlaeuterungen);
                } else {
                    var chapterExplanationList = explanations[chapterId][parserResult.listName];
                    parserResult.keys.forEach(function (key) {
                        if (!chapterExplanationList[key]) {
                            chapterExplanationList[key] = "";
                        }
                        chapterExplanationList[key] += appendText(explanation.Erlaeuterungen);
                    })
                }
            }
        }
        return explanations[chapterId];
    };

    this.addExplanation = function (explanation) {
        var parser = getParserFor(explanation);
        if (!parser || !kapitelParser.isApplicableTo(explanation)) {
            console.log("no parser found for " + explanation.KapitelStr + " - " + explanation.zuId + " - " + explanation.zuStr);
            return false;
        }
        var chapterId = kapitelParser.parse(explanation);
        var budgetEntriesForChapterId = budgetEntries.filter(function (budgetEntry) {
            return budgetEntry.Kapitel === chapterId;
        });

        var chapter = getChapter(chapterId);
        chapter.addExplanation(parser(budgetEntriesForChapterId), explanation);
        return true;
    };

    this.getEntries = function () {
        return budgetEntries;
    };

    this.getExplanations = function () {
        return explanations;
    };
};

module.exports = {
    "BudgetEntries": BudgetEntries
};
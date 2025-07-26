const fs = require('fs');

/**
 * Reads the lessons data and returns a Set of all existing English words.
 * @param {object} lessonsData - The parsed lessons JSON data.
 * @param {string[]} excludeCategories - An array of categories to exclude from the word set.
 * @returns {Set<string>} A set of lowercase, trimmed English words.
 */
function getExistingEnglishWords(lessonsData, excludeCategories = []) {
    const existingWords = new Set();
    const categoriesToExclude = new Set(excludeCategories.map(c => c.toLowerCase()));

    if (lessonsData.english) {
        for (const category in lessonsData.english) {
            if (categoriesToExclude.has(category.toLowerCase())) {
                continue;
            }
            for (const lessonName in lessonsData.english[category]) {
                lessonsData.english[category][lessonName].forEach(card => {
                    if (card.english) existingWords.add(card.english.toLowerCase().trim());
                });
            }
        }
    }
    return existingWords;
}

module.exports = { getExistingEnglishWords };

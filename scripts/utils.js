const fs = require('fs');

/**
 * Reads the lessons.json file and returns a Set of all existing English words.
 * @param {string} lessonsFilePath - The absolute path to the lessons.json file.
 * @returns {Set<string>} A set of lowercase, trimmed English words.
 */
function getExistingEnglishWords(lessonsFilePath) {
    const lessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));
    const existingWords = new Set();

    if (lessonsData.english) {
        for (const category in lessonsData.english) {
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
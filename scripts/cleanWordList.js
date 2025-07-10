const fs = require('fs');
const path = require('path');

const wordListPath = path.join(__dirname, '..', 'top_1000_english_words.txt');

function cleanWordList() {
    try {
        const words = fs.readFileSync(wordListPath, 'utf8').split('\n').map(w => w.trim().toLowerCase()).filter(Boolean);
        const uniqueWords = [...new Set(words)];
        const sortedWords = uniqueWords.sort();

        fs.writeFileSync(wordListPath, sortedWords.join('\n'), 'utf8');
        console.log(`\nSuccessfully cleaned the word list!`);
        console.log(`Original word count: ${words.length}`);
        console.log(`New unique word count: ${sortedWords.length}`);
    } catch (error) {
        console.error('Error cleaning word list:', error);
    }
}

cleanWordList();
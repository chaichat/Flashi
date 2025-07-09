const fs = require('fs');
const path = require('path');

const lessonsFilePath = path.join(__dirname, '..', 'data', 'lessons.json');
const englishWordListPath = path.join(__dirname, '..', 'english_words.txt');
const chineseWordListPath = path.join(__dirname, '..', 'chinese_words.txt');

function generateWordLists() {
    try {
        const lessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));

        const englishWords = new Set();
        const chineseWords = new Set();

        // Populate English words
        if (lessonsData.english) {
            for (const category in lessonsData.english) {
                for (const lessonName in lessonsData.english[category]) {
                    lessonsData.english[category][lessonName].forEach(card => {
                        if (card.english) englishWords.add(card.english.toLowerCase().trim());
                    });
                }
            }
        }

        // Populate Chinese words
        if (lessonsData.chinese) {
            for (const category in lessonsData.chinese) {
                for (const lessonName in lessonsData.chinese[category]) {
                    lessonsData.chinese[category][lessonName].forEach(card => {
                        if (card.chinese) chineseWords.add(card.chinese.trim());
                    });
                }
            }
        }

        fs.writeFileSync(englishWordListPath, Array.from(englishWords).sort().join('\n'), 'utf8');
        console.log(`Generated English word list with ${englishWords.size} unique words.`);

        fs.writeFileSync(chineseWordListPath, Array.from(chineseWords).sort((a, b) => a.localeCompare(b, 'zh-CN')).join('\n'), 'utf8');
        console.log(`Generated Chinese word list with ${chineseWords.size} unique words.`);
    } catch (error) {
        console.error("Error generating word lists:", error);
    }
}

generateWordLists();
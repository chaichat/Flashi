const fs = require('fs');
const path = require('path');
const readline = require('readline');

const lessonsFilePath = path.join(__dirname, '..', 'data', 'lessons.json');

// --- Configuration ---
// Set how many words you want to process in a single session.
const SESSION_LIMIT = 50;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function populateMissingPhonetics() {
    try {
        console.log("Reading lesson data...");
        let lessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));

        const cardsToFill = [];
        // Find all cards with an English word but an empty phonetic value
        for (const category in lessonsData.english) {
            for (const lessonName in lessonsData.english[category]) {
                lessonsData.english[category][lessonName].forEach(card => {
                    if (card.english && (card.phonetic === "" || card.phonetic === undefined || card.phonetic === null)) {
                        cardsToFill.push(card);
                    }
                });
            }
        }

        if (cardsToFill.length === 0) {
            console.log("No cards with missing phonetics found. All set!");
            return;
        }

        const sessionCards = cardsToFill.slice(0, SESSION_LIMIT);

        console.log(`\nFound ${cardsToFill.length} cards with missing phonetics.`);
        console.log(`This session will process up to ${sessionCards.length} words.`);
        console.log("Please provide the Thai 'karaoke-style' phonetic spelling for each English word.");
        console.log("Press ENTER to skip a word, or type 'exit' to save and quit.\n");

        let filledCount = 0;
        for (let i = 0; i < sessionCards.length; i++) {
            const card = sessionCards[i];
            const progress = `(${i + 1}/${sessionCards.length}) (Total remaining: ${cardsToFill.length - filledCount})`;
            const prompt = `${progress}\nEnglish: "${card.english}" (Thai: ${card.thai})\nEnter phonetic: `;
            
            const phonetic = await askQuestion(prompt);

            if (phonetic.toLowerCase() === 'exit') {
                console.log('Exiting and saving progress...');
                break;
            }

            if (phonetic.trim() !== "") {
                card.phonetic = phonetic.trim();
                filledCount++;
            }
        }

        fs.writeFileSync(lessonsFilePath, JSON.stringify(lessonsData, null, 2), 'utf8');
        console.log(`\nFinished! Filled in ${filledCount} phonetic entries. lessons.json has been updated.`);

    } catch (error) {
        console.error("Error populating phonetics:", error);
    } finally {
        rl.close();
    }
}

populateMissingPhonetics();
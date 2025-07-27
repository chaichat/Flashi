const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// IMPORTANT: You must install the Google Cloud Translate client library first
// Run this command in your terminal: npm install @google-cloud/translate
const { Translate } = require('@google-cloud/translate').v2;

// --- Configuration ---
const dataDir = path.join(__dirname, '..', 'data');
const manifestFilePath = path.join(dataDir, 'manifest.json');
const API_KEY = process.env.GOOGLE_API_KEY;
const CHUNK_SIZE = 100; // Google Translate API v2 has a limit of 128 segments per request.

// Check if the API key is available
if (!API_KEY) {
    console.error("\n*** ERROR: GOOGLE_API_KEY not found. Please create a .env file in the project root and add your key. ***\n");
    process.exit(1); // Stop the script
}

const translate = new Translate({ key: API_KEY });
const targetLanguage = 'th'; // Thai

// Helper function to add a delay between API calls
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function populateMissingTranslations() {
    try {
        console.log("Reading manifest data...");
        const manifest = JSON.parse(fs.readFileSync(manifestFilePath, 'utf8'));

        const wordsToTranslate = [];

        // Find all lesson files and words with missing translations
        for (const language in manifest) {
            if (Object.hasOwnProperty.call(manifest, language)) {
                for (const categoryName in manifest[language]) {
                    if (Object.hasOwnProperty.call(manifest[language], categoryName)) {
                        if (manifest[language][categoryName].lessons) {
                            manifest[language][categoryName].lessons.forEach(lessonInfo => {
                                const lessonFilePath = path.join(dataDir, lessonInfo.file);
                                const lessonData = JSON.parse(fs.readFileSync(lessonFilePath, 'utf8'));
                                lessonData.forEach(card => {
                                    let textToTranslate = '';
                                    let sourceLang = '';

                                    if (language === 'english' && card.english && !card.thai) {
                                        textToTranslate = card.english;
                                        sourceLang = 'en';
                                    } else if (language === 'chinese' && card.chinese && !card.thai) {
                                        textToTranslate = card.chinese;
                                        sourceLang = 'zh';
                                    }

                                    if (textToTranslate) {
                                        wordsToTranslate.push({ card, lessonFilePath, textToTranslate, sourceLang });
                                    }
                                });
                            });
                        }
                    }
                }
            }
        }

        if (wordsToTranslate.length === 0) {
            console.log("No words with missing translations found. All set!");
            return;
        }

        console.log(`Found ${wordsToTranslate.length} words to translate. Starting in chunks of ${CHUNK_SIZE}...`);

        // Group words by lessonFilePath to write back efficiently
        const updatedFilesMap = new Map();

        // Helper to add/update card in map
        const addUpdatedCard = (card, filePath) => {
            if (!updatedFilesMap.has(filePath)) {
                updatedFilesMap.set(filePath, {});
            }
            // Use a unique key for the card (e.g., its English or Chinese value)
            const key = card.english || card.chinese;
            updatedFilesMap.get(filePath)[key] = card;
        };

        let totalTranslated = 0;
        const totalChunks = Math.ceil(wordsToTranslate.length / CHUNK_SIZE);

        for (let i = 0; i < wordsToTranslate.length; i += CHUNK_SIZE) {
            const chunk = wordsToTranslate.slice(i, i + CHUNK_SIZE);
            const textsInChunk = chunk.map(item => item.textToTranslate);
            const currentSourceLang = chunk[0].sourceLang; // Assuming all items in chunk have same sourceLang

            console.log(`\nTranslating chunk ${i / CHUNK_SIZE + 1} of ${totalChunks} (${chunk.length} words) from ${currentSourceLang} to ${targetLanguage}...`);

            let [translations] = await translate.translate(textsInChunk, { from: currentSourceLang, to: targetLanguage });

            translations.forEach((translation, index) => {
                const item = chunk[index];
                item.card.thai = translation;
                addUpdatedCard(item.card, item.lessonFilePath);
            });

            totalTranslated += chunk.length;
            console.log(`...chunk translated. Total translated: ${totalTranslated}`);

            if (i + CHUNK_SIZE < wordsToTranslate.length) {
                await delay(500); // 500ms delay
            }
        }

        // Write the updated data back to the individual lesson files
        for (const filePath of updatedFilesMap.keys()) {
            const originalLessonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const updatedCardsForFile = updatedFilesMap.get(filePath);

            const finalLessonData = originalLessonData.map(originalCard => {
                const key = originalCard.english || originalCard.chinese;
                return updatedCardsForFile[key] || originalCard;
            });
            fs.writeFileSync(filePath, JSON.stringify(finalLessonData, null, 2), 'utf8');
        }

        console.log(`\nSuccessfully updated ${totalTranslated} translations in ${updatedFilesMap.size} lesson files!`);

    } catch (error) {
        console.error("Error populating translations:", error);
    }
}

populateMissingTranslations();

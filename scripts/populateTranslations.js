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
        const allLessonFiles = [];

        // Find all lesson files and words with missing translations
        for (const language in manifest) {
            if (Object.hasOwnProperty.call(manifest, language)) {
                for (const categoryName in manifest[language]) {
                    if (Object.hasOwnProperty.call(manifest[language], categoryName)) {
                        if (manifest[language][categoryName].lessons) {
                            manifest[language][categoryName].lessons.forEach(lessonInfo => {
                                const lessonFilePath = path.join(dataDir, lessonInfo.file);
                                allLessonFiles.push(lessonFilePath);
                                const lessonData = JSON.parse(fs.readFileSync(lessonFilePath, 'utf8'));
                                lessonData.forEach(card => {
                                    if (card.english && !card.thai) {
                                        wordsToTranslate.push({ card, lessonFilePath });
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

        let totalTranslated = 0;
        const totalChunks = Math.ceil(wordsToTranslate.length / CHUNK_SIZE);

        for (let i = 0; i < wordsToTranslate.length; i += CHUNK_SIZE) {
            const chunk = wordsToTranslate.slice(i, i + CHUNK_SIZE);
            const englishTextsInChunk = chunk.map(item => item.card.english);

            console.log(`\nTranslating chunk ${i / CHUNK_SIZE + 1} of ${totalChunks} (${chunk.length} words)...`);

            // Call the Google Translate API for the current chunk
            let [translations] = await translate.translate(englishTextsInChunk, targetLanguage);

            // The API returns an array of translations in the same order as the input
            translations.forEach((translation, index) => {
                const item = chunk[index];
                item.card.thai = translation;
            });

            totalTranslated += chunk.length;
            console.log(`...chunk translated. Total translated: ${totalTranslated}`);

            // Add a small delay between chunks to be a good API citizen.
            if (i + CHUNK_SIZE < wordsToTranslate.length) {
                await delay(500); // 500ms delay
            }
        }

        // Write the updated data back to the individual lesson files
        const updatedFiles = new Set();
        wordsToTranslate.forEach(item => {
            updatedFiles.add(item.lessonFilePath);
        });

        updatedFiles.forEach(filePath => {
            const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const updatedLessonData = lessonData.map(card => {
                const translatedItem = wordsToTranslate.find(item => item.card.english === card.english);
                return translatedItem ? translatedItem.card : card;
            });
            fs.writeFileSync(filePath, JSON.stringify(updatedLessonData, null, 2), 'utf8');
        });

        console.log(`\nSuccessfully updated ${totalTranslated} translations in ${updatedFiles.size} lesson files!`);

    } catch (error) {
        console.error("Error populating translations:", error);
    }
}

populateMissingTranslations();
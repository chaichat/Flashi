const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// IMPORTANT: You must install the Google Cloud Translate client library first
// Run this command in your terminal: npm install @google-cloud/translate
const { Translate } = require('@google-cloud/translate').v2;

// --- Configuration ---
const lessonsFilePath = path.join(__dirname, '..', 'data', 'lessons.json');
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
        console.log("Reading lesson data...");
        let lessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));

        const wordsToTranslate = [];
        // Find all cards with an English word but an empty Thai translation
        for (const category in lessonsData.english) {
            for (const lessonName in lessonsData.english[category]) {
                lessonsData.english[category][lessonName].forEach(card => {
                    if (card.english && !card.thai) {
                        wordsToTranslate.push(card);
                    }
                });
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
            const englishTextsInChunk = chunk.map(card => card.english);

            console.log(`\nTranslating chunk ${i / CHUNK_SIZE + 1} of ${totalChunks} (${chunk.length} words)...`);

            // Call the Google Translate API for the current chunk
            let [translations] = await translate.translate(englishTextsInChunk, targetLanguage);

            // The API returns an array of translations in the same order as the input
            translations.forEach((translation, index) => {
                const card = chunk[index];
                card.thai = translation;
            });

            totalTranslated += chunk.length;
            console.log(`...chunk translated. Total translated: ${totalTranslated}`);

            // Add a small delay between chunks to be a good API citizen.
            if (i + CHUNK_SIZE < wordsToTranslate.length) {
                await delay(500); // 500ms delay
            }
        }

        // Write the updated data back to the file
        fs.writeFileSync(lessonsFilePath, JSON.stringify(lessonsData, null, 2), 'utf8');
        console.log(`\nSuccessfully updated ${totalTranslated} translations in lessons.json!`);

    } catch (error) {
        console.error("Error populating translations:", error);
    }
}

populateMissingTranslations();
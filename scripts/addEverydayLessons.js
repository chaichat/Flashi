const fs = require('fs');
const path = require('path');
const { getExistingEnglishWords } = require('./utils');

const lessonsFilePath = path.join(__dirname, '..', 'data', 'lessons.json');
const wordListPath = path.join(__dirname, '..', 'top_1000_english_words.txt');

// --- Configuration ---
const CATEGORY_NAME = "Everyday";
const WORDS_TO_ADD = 1000; // Process the entire list of ~1000 words
const WORDS_PER_LESSON = 20;
const REVIEW_STACK_SIZE = 5;

function addEverydayLessons() {
    try {
        // 1. Read the new word list and get existing words using the utility function
        let lessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));
        const topWords = fs.readFileSync(wordListPath, 'utf8').split('\n').map(w => w.trim()).filter(Boolean);
        const existingWords = getExistingEnglishWords(lessonsFilePath);

        // 2. Filter out words that already exist
        const newWords = topWords.filter(word => !existingWords.has(word.toLowerCase()));
        const wordsForNewLessons = newWords.slice(0, WORDS_TO_ADD);

        if (wordsForNewLessons.length === 0) {
            console.log("No new words to add from the list. All words might already be in your lessons.");
        } else {
            // 3. Initialize the new category if it doesn't exist
            if (!lessonsData.english[CATEGORY_NAME]) {
                lessonsData.english[CATEGORY_NAME] = {};
            }

            // 4. Create new lessons
            let lessonsCreatedCount = 0;
            const existingLessonCount = Object.keys(lessonsData.english[CATEGORY_NAME]).filter(k => !k.includes("Review")).length;

            for (let i = 0; i < wordsForNewLessons.length; i += WORDS_PER_LESSON) {
                const lessonNumber = existingLessonCount + lessonsCreatedCount + 1;
                const lessonName = `${CATEGORY_NAME}: Lesson ${lessonNumber}`;
                const lessonChunk = wordsForNewLessons.slice(i, i + WORDS_PER_LESSON);
                lessonsData.english[CATEGORY_NAME][lessonName] = lessonChunk.map(word => ({ english: word, thai: "", phonetic: "" }));
                lessonsCreatedCount++;
            }
            const duplicatesSkipped = topWords.length - newWords.length;
            console.log(`\nProcessed ${topWords.length} words from the list.`);
            if (duplicatesSkipped > 0) {
                console.log(`Skipped ${duplicatesSkipped} words that already exist in lessons.json.`);
            }
            console.log(`Successfully added ${wordsForNewLessons.length} new words across ${lessonsCreatedCount} new lessons in the \"${CATEGORY_NAME}\" category.`);
        }

        // 5. Create and position review stacks
        const everydayLessons = lessonsData.english[CATEGORY_NAME];
        const lessonKeys = Object.keys(everydayLessons)
            .filter(k => !k.includes("Review"))
            .sort((a, b) => {
                const numA = parseInt(a.match(/(\d+)/)[0]);
                const numB = parseInt(b.match(/(\d+)/)[0]);
                return numA - numB;
            });

        const newEverydayLessons = {};
        let reviewStacksCreated = 0;

        for (let i = 0; i < lessonKeys.length; i++) {
            const lessonName = lessonKeys[i];
            newEverydayLessons[lessonName] = everydayLessons[lessonName];

            if ((i + 1) % REVIEW_STACK_SIZE === 0) {
                const startLessonNum = parseInt(lessonKeys[i - REVIEW_STACK_SIZE + 1].match(/(\d+)/)[0]);
                const endLessonNum = parseInt(lessonKeys[i].match(/(\d+)/)[0]);
                const reviewName = `${CATEGORY_NAME} Review: Lessons ${startLessonNum}-${endLessonNum}`;

                if (!everydayLessons[reviewName]) {
                    let reviewWords = [];
                    for (let j = i - REVIEW_STACK_SIZE + 1; j <= i; j++) {
                        reviewWords = reviewWords.concat(everydayLessons[lessonKeys[j]]);
                    }
                    reviewWords.sort(() => Math.random() - 0.5); // Shuffle words
                    newEverydayLessons[reviewName] = reviewWords;
                    reviewStacksCreated++;
                } else {
                    newEverydayLessons[reviewName] = everydayLessons[reviewName];
                }
            }
        }
        
        // Add any remaining review stacks that might not fit the 5-lesson block structure
        for (const key in everydayLessons) {
            if (key.includes("Review") && !newEverydayLessons[key]) {
                newEverydayLessons[key] = everydayLessons[key];
            }
        }

        lessonsData.english[CATEGORY_NAME] = newEverydayLessons;

        // 6. Write the updated data back to the file
        fs.writeFileSync(lessonsFilePath, JSON.stringify(lessonsData, null, 2), 'utf8');
        
        if (reviewStacksCreated > 0) {
            console.log(`Successfully created and positioned ${reviewStacksCreated} new review stacks.`);
        } else {
            console.log("No new review stacks were created. They may already exist and are now correctly positioned.");
        }

        console.log("\nNext step: Run 'node scripts/populateTranslations.js' to add the Thai translations.");
    } catch (error) {
        console.error(`Error adding ${CATEGORY_NAME} lessons:`, error);
    }
}

addEverydayLessons();
const fs = require('fs');
const path = require('path');
const { getExistingEnglishWords } = require('./utils');

const lessonsFilePath = path.join(__dirname, '..', 'data', 'lessons.json');
const sourceFilePath = path.join(__dirname, '..', 'data', 'everyday_lessons_source.json');
const backupFilePath = path.join(__dirname, '..', 'data', 'lessons.json.bak');

const CATEGORY_NAME = "Everyday";
const WORDS_PER_LESSON = 20;

function refactorAndRebuild() {
    try {
        // 1. Backup the existing lessons file
        if (fs.existsSync(lessonsFilePath)) {
            fs.copyFileSync(lessonsFilePath, backupFilePath);
            console.log(`Successfully backed up lessons.json to lessons.json.bak`);
        }

        // 2. Read the main lessons data and the new source data
        let lessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));
        const newThematicLessons = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));

        // 3. Get all existing words from other categories to avoid duplication
        const existingWords = getExistingEnglishWords(lessonsData, [CATEGORY_NAME, "Business"]);

        // 4. Clear the existing "Everyday" category and delete "Business"
        if (lessonsData.english[CATEGORY_NAME]) {
            console.log(`Clearing existing lessons in the "${CATEGORY_NAME}" category.`);
            lessonsData.english[CATEGORY_NAME] = {};
        }
        if (lessonsData.english["Business"]) {
            console.log(`Deleting the "Business" category.`);
            delete lessonsData.english["Business"];
        }

        // 5. Add the new thematic lessons, ensuring no duplicates
        const newCategoryData = {};
        let lessonsCreated = 0;
        let currentLessonWords = [];

        Object.keys(newThematicLessons).forEach(themeName => {
            const lessonsInTheme = newThematicLessons[themeName];

            lessonsInTheme.forEach((lessonSource, index) => {
                const lessonName = `${themeName}: Lesson ${lessonsCreated + 1}`;
                const filteredCards = lessonSource.filter(card => !existingWords.has(card.e.toLowerCase()));
                const finalCards = filteredCards.slice(0, WORDS_PER_LESSON).map(card => ({ english: card.e, thai: card.t || "", phonetic: "" }));

                if(finalCards.length === WORDS_PER_LESSON) {
                    newCategoryData[lessonName] = finalCards;
                    currentLessonWords.push(...finalCards);
                    lessonsCreated++;

                    if (lessonsCreated % 5 === 0) {
                        const reviewName = `Everyday: Review ${lessonsCreated - 4}-${lessonsCreated}`;
                        newCategoryData[reviewName] = currentLessonWords;
                        console.log(`Created review stack: "${reviewName}"`);
                        currentLessonWords = [];
                    }
                }
            });
        });

        lessonsData.english[CATEGORY_NAME] = newCategoryData;
        console.log(`Added ${lessonsCreated} new thematic lessons.`);

        // 7. Write the final data back to the file
        fs.writeFileSync(lessonsFilePath, JSON.stringify(lessonsData, null, 2), 'utf8');
        console.log(`Successfully rebuilt the "${CATEGORY_NAME}" category with new thematic lessons and review stacks.`);
        console.log("\nNext step: Run 'node scripts/populateTranslations.js' and 'node scripts/populatePhonetics.js' to complete the new lessons.");

    } catch (error) {
        console.error(`Error rebuilding ${CATEGORY_NAME} lessons:`, error);
    }
}

refactorAndRebuild();
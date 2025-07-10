const fs = require('fs');
const path = require('path');
const readline = require('readline');

const lessonsFilePath = path.join(__dirname, '..', 'data', 'lessons.json');
const CATEGORY_NAME = "Everyday";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function resetEverydayLessons() {
    try {
        const answer = await new Promise(resolve => {
            rl.question(`This will remove all lessons from the "${CATEGORY_NAME}" category except for Lessons 1-5. Are you sure? (y/n) `, resolve);
        });

        if (answer.toLowerCase() !== 'y') {
            console.log('Operation cancelled.');
            return;
        }

        console.log(`Resetting "${CATEGORY_NAME}" category...`);
        let lessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));

        if (lessonsData.english && lessonsData.english[CATEGORY_NAME]) {
            const lessonsToDelete = Object.keys(lessonsData.english[CATEGORY_NAME])
                .filter(lessonName => {
                    const match = lessonName.match(/Lesson (\d+)/);
                    return match && parseInt(match[1], 10) > 5;
                });

            if (lessonsToDelete.length > 0) {
                lessonsToDelete.forEach(lessonName => delete lessonsData.english[CATEGORY_NAME][lessonName]);
                fs.writeFileSync(lessonsFilePath, JSON.stringify(lessonsData, null, 2), 'utf8');
                console.log(`Successfully removed ${lessonsToDelete.length} lessons from the "${CATEGORY_NAME}" category.`);
                console.log("You can now run 'npm run add-everyday' to regenerate lessons from the updated word list.");
            } else {
                console.log(`No lessons to remove (Lessons 6+ not found in "${CATEGORY_NAME}").`);
            }
        } else {
            console.log(`Category "${CATEGORY_NAME}" not found.`);
        }
    } catch (error) {
        console.error(`Error resetting ${CATEGORY_NAME} lessons:`, error);
    } finally {
        rl.close();
    }
}

resetEverydayLessons();
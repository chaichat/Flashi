const fs = require('fs');
const path = require('path');

const lessonsFilePath = path.join(__dirname, '..', 'data', 'lessons.json');
const CATEGORY_NAME = "Everyday";

function resetEverydayLessons() {
    try {
        let lessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));

        if (lessonsData.english && lessonsData.english[CATEGORY_NAME]) {
            const everydayLessons = lessonsData.english[CATEGORY_NAME];
            const originalKeys = Object.keys(everydayLessons);
            let reviewStacksDeleted = 0;

            for (const key of originalKeys) {
                if (key.toLowerCase().includes('review')) {
                    delete everydayLessons[key];
                    reviewStacksDeleted++;
                }
            }

            fs.writeFileSync(lessonsFilePath, JSON.stringify(lessonsData, null, 2), 'utf8');
            console.log(`Successfully deleted ${reviewStacksDeleted} review stacks from the "${CATEGORY_NAME}" category.`);
        } else {
            console.log(`Category "${CATEGORY_NAME}" not found. No changes made.`);
        }

    } catch (error) {
        console.error(`Error resetting ${CATEGORY_NAME} lessons:`, error);
    }
}

resetEverydayLessons();

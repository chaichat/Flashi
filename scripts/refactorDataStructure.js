const fs = require('fs');
const path = require('path');

const lessonsFilePath = path.join(__dirname, '..', 'data', 'lessons.json');
const backupFilePath = path.join(__dirname, '..', 'data', 'lessons.json.bak');
const dataDir = path.join(__dirname, '..', 'data');
const manifestFilePath = path.join(dataDir, 'manifest.json');

/**
 * Sanitizes a lesson or category name to be used as a filename.
 * @param {string} name The original name.
 * @returns {string} The sanitized name.
 */
function sanitizeForFilename(name) {
    return name.replace(/[^a-z0-9\-_]/gi, '_').toLowerCase();
}

function refactorDataStructure() {
    try {
        // 1. Backup the existing lessons file
        if (fs.existsSync(lessonsFilePath)) {
            fs.copyFileSync(lessonsFilePath, backupFilePath);
            console.log(`Successfully backed up lessons.json to ${backupFilePath}`);
        }

        // 2. Read the old lessons data
        const oldLessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));
        const newManifest = {};

        console.log('Starting data structure refactoring...');

        // 3. Iterate through languages, categories, and lessons
        for (const language in oldLessonsData) {
            if (Object.hasOwnProperty.call(oldLessonsData, language)) {
                const langDir = path.join(dataDir, language);
                if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

                newManifest[language] = {};

                const categories = oldLessonsData[language];
                for (const categoryName in categories) {
                    if (Object.hasOwnProperty.call(categories, categoryName)) {
                        const categoryDirName = sanitizeForFilename(categoryName);
                        const categoryDir = path.join(langDir, categoryDirName);
                        if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });

                        newManifest[language][categoryName] = [];

                        const lessons = categories[categoryName];
                        for (const lessonName in lessons) {
                            if (Object.hasOwnProperty.call(lessons, lessonName)) {
                                const lessonData = lessons[lessonName];
                                const lessonFileName = `${sanitizeForFilename(lessonName)}.json`;
                                const lessonFilePath = path.join(categoryDir, lessonFileName);

                                // Write the individual lesson file
                                fs.writeFileSync(lessonFilePath, JSON.stringify(lessonData, null, 2), 'utf8');

                                // Add entry to the manifest
                                newManifest[language][categoryName].push({
                                    name: lessonName,
                                    file: `${language}/${categoryDirName}/${lessonFileName}`,
                                    isReview: lessonName.toLowerCase().includes('review')
                                });
                                console.log(`Created lesson file: ${lessonFilePath}`);
                            }
                        }
                    }
                }
            }
        }

        // 4. Write the new manifest file
        fs.writeFileSync(manifestFilePath, JSON.stringify(newManifest, null, 2), 'utf8');
        console.log(`\nSuccessfully created manifest.json at ${manifestFilePath}`);

        console.log('\nData structure refactoring complete!');
        console.log('Next step: Update the frontend script to use the new manifest and lazy-load lesson files.');

    } catch (error) {
        console.error('Error during data structure refactoring:', error);
    }
}

refactorDataStructure();
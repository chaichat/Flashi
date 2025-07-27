const fs = require('fs');
const path = require('path');

const sourceFilePath = path.join(__dirname, '..', 'data', 'everyday_lessons_source.json');
const manifestFilePath = path.join(__dirname, '..', 'data', 'manifest.json');
const dataDir = path.join(__dirname, '..', 'data');

const CATEGORY_NAME = "Everyday";
const LANGUAGE = "english";
const WORDS_PER_LESSON = 20;

const themeTranslations = {
    "Greetings & Socializing": "ทักทายและสังคม",
    "Food & Dining": "อาหารและการรับประทานอาหาร",
    "Travel & Transportation": "การเดินทางและการคมนาคม",
    "Shopping & Errands": "ช้อปปิ้งและธุระ",
    "Health & Wellness": "สุขภาพและความเป็นอยู่ที่ดี",
    "Daily Routines": "กิจวัตรประจำวัน",
    "Around the House": "รอบๆ บ้าน",
    "Weather": "สภาพอากาศ",
    "Hobbies & Interests": "งานอดิเรกและความสนใจ",
    "Emotions & Feelings": "อารมณ์และความรู้สึก",
    "Body Parts": "ส่วนต่างๆ ของร่างกาย",
    "Clothing & Accessories": "เสื้อผ้าและเครื่องประดับ",
    "Colors & Shapes": "สีและรูปทรง",
    "Numbers & Time": "ตัวเลขและเวลา",
    "Education": "การศึกษา",
    "Work & Jobs": "งานและอาชีพ",
    "Technology & Internet": "เทคโนโลยีและอินเทอร์เน็ต",
    "Nature & Environment": "ธรรมชาติและสิ่งแวดล้อม",
    "Countries & Nationalities": "ประเทศและสัญชาติ",
    "Family & Relationships": "ครอบครัวและความสัมพันธ์",
    "Business & Finance": "ธุรกิจและการเงิน"
};

/**
 * Sanitizes a lesson or category name to be used as a filename.
 * @param {string} name The original name.
 * @returns {string} The sanitized name.
 */
function sanitizeForFilename(name) {
    return name.replace(/[^a-z0-9\-_]/gi, '_').toLowerCase();
}

function generateLessons() {
    try {
        console.log('Starting lesson generation...');

        // 1. Load source data and manifest
        const sourceData = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));
        const manifest = JSON.parse(fs.readFileSync(manifestFilePath, 'utf8'));

        // 2. Clear out old "Everyday" lesson files and manifest entries
        const categoryDir = path.join(dataDir, LANGUAGE, CATEGORY_NAME.toLowerCase());
        if (manifest[LANGUAGE] && manifest[LANGUAGE][CATEGORY_NAME] && manifest[LANGUAGE][CATEGORY_NAME].lessons) {
            console.log(`Clearing old lessons for ${LANGUAGE}/${CATEGORY_NAME}...`);
            manifest[LANGUAGE][CATEGORY_NAME].lessons.forEach(lessonInfo => {
                const oldFilePath = path.join(dataDir, lessonInfo.file);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            });
        }
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }

        // 3. Initialize variables for the build process
        const newManifestCategory = { name_th: "บทเรียนในชีวิตประจำวัน", lessons: [] };
        const usedWordsInThisBuild = new Set();
        let lessonsCreated = 0;
        let reviewSet = [];

        // 4. Loop through themes and generate lessons
        for (const themeName in sourceData) {
            if (Object.hasOwnProperty.call(sourceData, themeName)) {
                const lessonsInTheme = sourceData[themeName];

                for (const lessonSource of lessonsInTheme) {
                    // Filter out words already used in this build process
                    const uniqueCards = lessonSource.filter(card => !usedWordsInThisBuild.has(card.e.toLowerCase()));

                    // Ensure we have enough unique words to create a full lesson
                    if (uniqueCards.length >= WORDS_PER_LESSON) {
                        const finalCards = uniqueCards.slice(0, WORDS_PER_LESSON).map(card => {
                            usedWordsInThisBuild.add(card.e.toLowerCase()); // Add to used set
                            return { english: card.e, thai: "", phonetic: "" };
                        });

                        const lessonName = `${themeName}: Lesson ${lessonsCreated + 1}`;
                        const lessonNameTh = `${themeTranslations[themeName]}: บทที่ ${lessonsCreated + 1}`;
                        const sanitizedName = sanitizeForFilename(lessonName);
                        const lessonFileName = `${sanitizedName}.json`;
                        const lessonFilePath = path.join(categoryDir, lessonFileName);

                        fs.writeFileSync(lessonFilePath, JSON.stringify(finalCards, null, 2), 'utf8');

                        newManifestCategory.lessons.push({
                            name: lessonName,
                            name_th: lessonNameTh,
                            file: `${LANGUAGE}/${CATEGORY_NAME.toLowerCase()}/${lessonFileName}`,
                            isReview: false
                        });

                        reviewSet.push(...finalCards);
                        lessonsCreated++;

                        // 5. Generate a review stack after every 5 lessons
                        if (lessonsCreated % 5 === 0) {
                            const reviewName = `Everyday: Review ${lessonsCreated - 4}-${lessonsCreated}`;
                            const reviewNameTh = `ทบทวน: บทที่ ${lessonsCreated - 4}-${lessonsCreated}`;
                            const sanitizedReviewName = sanitizeForFilename(reviewName);
                            const reviewFileName = `${sanitizedReviewName}.json`;
                            const reviewFilePath = path.join(categoryDir, reviewFileName);

                            // Shuffle the review deck
                            reviewSet.sort(() => Math.random() - 0.5);

                            fs.writeFileSync(reviewFilePath, JSON.stringify(reviewSet, null, 2), 'utf8');

                            newManifestCategory.lessons.push({
                                name: reviewName,
                                name_th: reviewNameTh,
                                file: `${LANGUAGE}/${CATEGORY_NAME.toLowerCase()}/${reviewFileName}`,
                                isReview: true
                            });
                            console.log(`Created review stack: "${reviewName}"`);
                            reviewSet = []; // Reset for the next batch
                        }
                    }
                }
            }
        }

        // 6. Update the manifest with the new lesson list
        manifest[LANGUAGE][CATEGORY_NAME] = newManifestCategory;
        fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2), 'utf8');

        console.log(`\nSuccessfully generated ${lessonsCreated} lessons and ${Math.floor(lessonsCreated / 5)} review stacks.`);
        console.log("Next step: Run 'node scripts/populateTranslations.js' to add translations.");

    } catch (error) {
        console.error('Error during lesson generation:', error);
    }
}

generateLessons();
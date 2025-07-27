const fs = require('fs');
const path = require('path');

const everydaySourceFilePath = path.join(__dirname, '..', 'data', 'everyday_lessons_source.json');
const phraseSourceFilePath = path.join(__dirname, '..', 'data', 'phrase_lessons_source.json');
const manifestFilePath = path.join(__dirname, '..', 'data', 'manifest.json');
const dataDir = path.join(__dirname, '..', 'data');

const WORDS_PER_LESSON = 20;

const themeTranslations = {
    "Business & Finance": "ธุรกิจและการเงิน",
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
    "Common Greetings": "วลีทักทายทั่วไป",
    "Travel Phrases": "วลีสำหรับการเดินทาง",
    "Shopping Phrases": "วลีสำหรับการช้อปปิ้ง",
    "Emergency Phrases": "วลีฉุกเฉิน",
    "Dining Phrases": "วลีสำหรับการรับประทานอาหาร"
};

const categoryTranslations = {
    "Everyday": "บทเรียนในชีวิตประจำวัน",
    "Useful Phrases": "วลีที่ใช้บ่อย",
    "IELTS Vocabulary": "คำศัพท์ IELTS",
    "HSK 1": "HSK 1"
};

/**
 * Sanitizes a lesson or category name to be used as a filename.
 * @param {string} name The original name.
 * @returns {string} The sanitized name.
 */
function sanitizeForFilename(name) {
    return name.replace(/[^a-z0-9\-_]/gi, '_').toLowerCase();
}

async function generateLessons() {
    const LANGUAGE_ENGLISH = "english";
    const LANGUAGE_CHINESE = "chinese";

    const CATEGORY_EVERYDAY = "Everyday";
    const CATEGORY_USEFUL_PHRASES = "Useful Phrases";
    const CATEGORY_IELTS = "IELTS Vocabulary";
    const CATEGORY_HSK1 = "HSK 1";

    try {
        console.log('Starting lesson generation...');

        // 1. Load source data and manifest
        const everydaySourceData = JSON.parse(fs.readFileSync(everydaySourceFilePath, 'utf8'));
        const phraseSourceData = JSON.parse(fs.readFileSync(phraseSourceFilePath, 'utf8'));
        let manifest = JSON.parse(fs.readFileSync(manifestFilePath, 'utf8'));

        // Ensure language entries exist in manifest
        if (!manifest[LANGUAGE_ENGLISH]) manifest[LANGUAGE_ENGLISH] = {};
        if (!manifest[LANGUAGE_CHINESE]) manifest[LANGUAGE_CHINESE] = {};

        // 2. Clear out old "Everyday" and "Useful Phrases" lesson files and manifest entries
        const categoriesToClear = [CATEGORY_EVERYDAY, CATEGORY_USEFUL_PHRASES];
        for (const lang of [LANGUAGE_ENGLISH, LANGUAGE_CHINESE]) {
            for (const cat of categoriesToClear) {
                if (manifest[lang] && manifest[lang][cat] && manifest[lang][cat].lessons) {
                    console.log(`Clearing old lessons for ${lang}/${cat}...`);
                    manifest[lang][cat].lessons.forEach(lessonInfo => {
                        const oldFilePath = path.join(dataDir, lessonInfo.file);
                        if (fs.existsSync(oldFilePath)) {
                            fs.unlinkSync(oldFilePath);
                        }
                    });
                }
            }
        }

        // Delete the old "Business" category if it exists
        if (manifest[LANGUAGE_ENGLISH] && manifest[LANGUAGE_ENGLISH]["Business"]) {
            console.log(`Deleting the old "Business" category.`);
            delete manifest[LANGUAGE_ENGLISH]["Business"];
        }

        // Helper function to process and generate lessons for a given language and category
        const processCategoryLessons = (sourceData, lang, categoryName, isChinese = false) => {
            const newManifestCategory = { name_th: categoryTranslations[categoryName], lessons: [] };
            const usedWordsInThisCategory = new Set(); // Reset for each category
            let lessonsCreated = 0;
            let reviewSet = [];

            const categoryDir = path.join(dataDir, lang, sanitizeForFilename(categoryName));
            if (!fs.existsSync(categoryDir)) {
                fs.mkdirSync(categoryDir, { recursive: true });
            }

            for (const themeName in sourceData) {
                if (Object.hasOwnProperty.call(sourceData, themeName)) {
                    const lessonsInTheme = sourceData[themeName];

                    for (const lessonSource of lessonsInTheme) {
                        const uniqueCards = lessonSource.filter(card => {
                            const word = card.e.toLowerCase();
                            return !usedWordsInThisCategory.has(word);
                        });

                        if (uniqueCards.length >= WORDS_PER_LESSON) {
                            const finalCards = uniqueCards.slice(0, WORDS_PER_LESSON).map(card => {
                                const word = card.e.toLowerCase();
                                usedWordsInThisCategory.add(word); // Add to used set for this category
                                return isChinese ? { chinese: card.e, thai: "", pinyin: "" } : { english: card.e, thai: "", phonetic: "" };
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
                                file: `${lang}/${sanitizeForFilename(categoryName)}/${lessonFileName}`,
                                isReview: false
                            });

                            reviewSet.push(...finalCards);
                            lessonsCreated++;

                            if (lessonsCreated % 5 === 0) {
                                const reviewName = `${categoryName}: Review ${lessonsCreated - 4}-${lessonsCreated}`;
                                const reviewNameTh = `ทบทวน: บทที่ ${lessonsCreated - 4}-${lessonsCreated}`;
                                const sanitizedReviewName = sanitizeForFilename(reviewName);
                                const reviewFileName = `${sanitizedReviewName}.json`;
                                const reviewFilePath = path.join(categoryDir, reviewFileName);

                                reviewSet.sort(() => Math.random() - 0.5);

                                fs.writeFileSync(reviewFilePath, JSON.stringify(reviewSet, null, 2), 'utf8');

                                newManifestCategory.lessons.push({
                                    name: reviewName,
                                    name_th: reviewNameTh,
                                    file: `${lang}/${sanitizeForFilename(categoryName)}/${reviewFileName}`,
                                    isReview: true
                                });
                                console.log(`Created review stack: "${reviewName}"`);
                                reviewSet = []; // Reset for the next batch
                            }
                        }
                    }
                }
            }
            return { newManifestCategory, lessonsCreated };
        };

        // Process English Everyday lessons
        const { newManifestCategory: everydayCat, lessonsCreated: everydayCount } = processCategoryLessons(everydaySourceData, LANGUAGE_ENGLISH, CATEGORY_EVERYDAY);
        manifest[LANGUAGE_ENGLISH][CATEGORY_EVERYDAY] = everydayCat;
        console.log(`Added ${everydayCount} new Everyday thematic lessons.`);

        // Process English Useful Phrases lessons
        const { newManifestCategory: englishPhrasesCat, lessonsCreated: englishPhrasesCount } = processCategoryLessons(phraseSourceData.english, LANGUAGE_ENGLISH, CATEGORY_USEFUL_PHRASES);
        manifest[LANGUAGE_ENGLISH][CATEGORY_USEFUL_PHRASES] = englishPhrasesCat;
        console.log(`Added ${englishPhrasesCount} new English Useful Phrases lessons.`);

        // Process Chinese Useful Phrases lessons
        const { newManifestCategory: chinesePhrasesCat, lessonsCreated: chinesePhrasesCount } = processCategoryLessons(phraseSourceData.chinese, LANGUAGE_CHINESE, CATEGORY_USEFUL_PHRASES, true);
        manifest[LANGUAGE_CHINESE][CATEGORY_USEFUL_PHRASES] = chinesePhrasesCat;
        console.log(`Added ${chinesePhrasesCount} new Chinese Useful Phrases lessons.`);

        // 5. Preserve and integrate existing IELTS and HSK 1 lessons
        const preserveCategories = [CATEGORY_IELTS, CATEGORY_HSK1];
        for (const lang of [LANGUAGE_ENGLISH, LANGUAGE_CHINESE]) {
            const currentManifestCategory = manifest[lang];
            for (const catName of preserveCategories) {
                const catDir = path.join(dataDir, lang, sanitizeForFilename(catName));
                if (fs.existsSync(catDir)) {
                    const lessonFiles = fs.readdirSync(catDir).filter(file => file.endsWith('.json'));
                    const existingLessons = [];
                    lessonFiles.forEach(file => {
                        const lessonName = file.replace(/\.json$/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Basic unsanitization
                        const lessonNameTh = categoryTranslations[catName]; // Use category translation for now
                        existingLessons.push({
                            name: lessonName,
                            name_th: lessonNameTh,
                            file: `${lang}/${sanitizeForFilename(catName)}/${file}`,
                            isReview: lessonName.toLowerCase().includes('review')
                        });
                    });
                    currentManifestCategory[catName] = { name_th: categoryTranslations[catName], lessons: existingLessons };
                    console.log(`Preserved and integrated existing lessons for ${lang}/${catName}.`);
                }
            }
        }

        // 6. Write the updated manifest file
        fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2), 'utf8');

        console.log(`\nSuccessfully generated all lessons and review stacks.`);
        console.log(`Next step: Run 'node scripts/populateTranslations.js' to add translations.`);

    } catch (error) {
        console.error('Error during lesson generation:', error);
    }
}

generateLessons();
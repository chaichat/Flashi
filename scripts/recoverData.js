const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const publicDataDir = path.join(publicDir, 'data');
const publicLessonsDir = path.join(publicDataDir, 'lessons');
const publicManifestPath = path.join(publicDataDir, 'lessons.json');

const sourceDataDir = path.join(rootDir, 'data');
const sourceLessonsPath = path.join(sourceDataDir, 'lessons.json');

/**
 * A simple function to make filesystem names more readable for JSON keys.
 * e.g., 'business-1-the-office' -> 'Business 1 The Office'
 * This is a reasonable approximation for recovery.
 * @param {string} filename - The sanitized file or directory name.
 * @returns {string} A prettier, human-readable name.
 */
function prettyName(filename) {
    const name = filename.replace(/-/g, ' ');
    // This is a basic title case, good enough for recovery.
    return name.replace(/\b\w/g, char => char.toUpperCase())
               .replace('Hsk', 'HSK')
               .replace('Ielts', 'IELTS');
}

function recoverAndRebuild() {
    try {
        console.log('Attempting to recover from individual lesson files...');
        if (!fs.existsSync(publicLessonsDir)) {
            console.error(`[FATAL] Lesson directory not found at: ${publicLessonsDir}`);
            console.error('Cannot recover. The individual lesson files are missing.');
            return;
        }

        const manifest = {};
        const sourceData = {};

        // Step 1: Scan filesystem to rebuild manifest and source data simultaneously
        console.log('Scanning languages...');
        const languages = fs.readdirSync(publicLessonsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory()).map(d => d.name);

        for (const lang of languages) {
            manifest[lang] = {};
            sourceData[lang] = {};
            const langPath = path.join(publicLessonsDir, lang);
            const categories = fs.readdirSync(langPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory()).map(d => d.name);

            for (const catDirName of categories) {
                const categoryKey = prettyName(catDirName);
                manifest[lang][categoryKey] = {};
                sourceData[lang][categoryKey] = {};
                const catPath = path.join(langPath, catDirName);
                const lessonFiles = fs.readdirSync(catPath).filter(f => f.endsWith('.json'));

                for (const lessonFile of lessonFiles) {
                    const lessonFileBase = path.basename(lessonFile, '.json');
                    const lessonKey = prettyName(lessonFileBase);
                    const relativePath = ['data', 'lessons', lang, catDirName, lessonFile].join('/');
                    manifest[lang][categoryKey][lessonKey] = relativePath;
                    const fullPath = path.join(catPath, lessonFile);
                    const lessonContent = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    sourceData[lang][categoryKey][lessonKey] = lessonContent;
                }
            }
        }

        // Step 2: Write the recovered files
        if (!fs.existsSync(sourceDataDir)) fs.mkdirSync(sourceDataDir);
        fs.writeFileSync(sourceLessonsPath, JSON.stringify(sourceData, null, 2), 'utf8');
        console.log(`\n✅ Successfully recovered and created source file: ${sourceLessonsPath}`);

        if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir);
        fs.writeFileSync(publicManifestPath, JSON.stringify(manifest, null, 2), 'utf8');
        console.log(`✅ Successfully recovered and created manifest file: ${publicManifestPath}`);
        
        console.log('\nRecovery complete. Your data pipeline is now consistent.');

    } catch (error) {
        console.error('\n[FATAL] An error occurred during the recovery process:', error);
    }
}

recoverAndRebuild();
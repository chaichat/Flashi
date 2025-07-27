const fs = require('fs');
const path = require('path');
const readline = require('readline');

const dataDir = path.join(__dirname, '..', 'data');
const manifestPath = path.join(dataDir, 'manifest.json');

// Configuration
const SESSION_LIMIT = 30;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function populateModularPhonetics() {
    try {
        console.log("Reading manifest...");
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        const cardsToFill = [];
        const fileData = new Map(); // Store loaded file data to avoid re-reading
        
        // Process English lessons only
        if (manifest.english) {
            for (const categoryName in manifest.english) {
                const category = manifest.english[categoryName];
                if (category.lessons) {
                    for (const lesson of category.lessons) {
                        const filePath = path.join(dataDir, lesson.file);
                        
                        if (!fs.existsSync(filePath)) {
                            console.warn(`File not found: ${filePath}`);
                            continue;
                        }
                        
                        const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        fileData.set(lesson.file, { data: lessonData, path: filePath });
                        
                        lessonData.forEach((card, cardIndex) => {
                            if (card.english && (!card.phonetic || card.phonetic.trim() === "")) {
                                cardsToFill.push({
                                    card,
                                    cardIndex,
                                    file: lesson.file,
                                    lessonName: lesson.name,
                                    categoryName
                                });
                            }
                        });
                    }
                }
            }
        }

        if (cardsToFill.length === 0) {
            console.log("No cards with missing phonetics found. All set!");
            return;
        }

        const sessionCards = cardsToFill.slice(0, SESSION_LIMIT);

        console.log(`\nFound ${cardsToFill.length} English cards with missing phonetics.`);
        console.log(`This session will process up to ${sessionCards.length} words.`);
        console.log("Please provide Thai phonetic spelling (karaoke-style) for each English word.");
        console.log("Examples:");
        console.log("  'Hello' → 'เฮลโล่'");
        console.log("  'Can you help me' → 'แคน ยู เฮ้ลพ์ มี'");
        console.log("Press ENTER to skip a word, or type 'exit' to save and quit.\n");

        let filledCount = 0;
        const updatedFiles = new Set();

        for (let i = 0; i < sessionCards.length; i++) {
            const item = sessionCards[i];
            const { card, file, lessonName, categoryName } = item;
            
            const progress = `(${i + 1}/${sessionCards.length}) (Total remaining: ${cardsToFill.length - filledCount})`;
            const location = `[${categoryName} > ${lessonName}]`;
            const prompt = `${progress}\n${location}\nEnglish: "${card.english}" (Thai: ${card.thai})\nEnter phonetic: `;
            
            const phonetic = await askQuestion(prompt);

            if (phonetic.toLowerCase() === 'exit') {
                console.log('Exiting and saving progress...');
                break;
            }

            if (phonetic.trim() !== "") {
                card.phonetic = phonetic.trim();
                filledCount++;
                updatedFiles.add(file);
            }
            
            console.log(''); // Add spacing between entries
        }

        // Save all updated files
        let savedFiles = 0;
        for (const fileName of updatedFiles) {
            const fileInfo = fileData.get(fileName);
            if (fileInfo) {
                fs.writeFileSync(fileInfo.path, JSON.stringify(fileInfo.data, null, 2), 'utf8');
                savedFiles++;
            }
        }

        console.log(`\nFinished! Filled in ${filledCount} phonetic entries across ${savedFiles} files.`);
        
        if (cardsToFill.length > sessionCards.length) {
            const remaining = cardsToFill.length - sessionCards.length;
            console.log(`${remaining} cards still need phonetics. Run the script again to continue.`);
        }

    } catch (error) {
        console.error("Error populating phonetics:", error);
    } finally {
        rl.close();
    }
}

// Helper function to add common phonetics automatically
async function addCommonPhonetics() {
    const commonPhonetics = {
        "Hello": "เฮลโล่",
        "Goodbye": "กู๊ดบาย",
        "Thank you": "แธงค์ ยู",
        "Please": "พลีส",
        "Yes": "เยส",
        "No": "โน",
        "Office": "ออฟฟิส",
        "Meeting": "มี้ทติง",
        "Email": "อีเมล",
        "Computer": "คอมพิวเตอร์",
        "Phone": "โฟน",
        "Project": "โปรเจ็ค",
        "Team": "ทีม",
        "Manager": "แมเนเจอร์",
        "Report": "รีพอร์ต",
        "Schedule": "เสเกดูล",
        "Budget": "บัดเจ็ต",
        "Client": "ไคลเอ็นต์",
        "Contract": "คอนแทรค",
        "Deadline": "เดดไลน์",
        "Presentation": "เพรเซ็นเทชั่น",
        "Good morning": "กู๊ด มอร์นิง",
        "Good afternoon": "กู๊ด อาฟเตอร์นูน",
        "Good evening": "กู๊ด อีฟนิง",
        "How are you": "ฮาว อาร์ ยู",
        "Nice to meet you": "ไนส์ ทู มีท ยู",
        "Can you help me": "แคน ยู เฮ้ลพ์ มี",
        "Excuse me": "เอ็กซ์คิวส์ มี",
        "I'm sorry": "ไอม์ ซอร์รี่"
    };

    console.log("Adding common phonetics automatically...");
    // Implementation would go here to automatically populate common words
    console.log("This feature can be implemented to auto-populate common English words.");
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--auto')) {
        addCommonPhonetics();
    } else {
        populateModularPhonetics();
    }
}

module.exports = { populateModularPhonetics, addCommonPhonetics };
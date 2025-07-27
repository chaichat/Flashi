const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const manifestPath = path.join(dataDir, 'manifest.json');

// Common English words with their phonetic pronunciations
const ENGLISH_PHONETICS = {
    // Basic greetings
    "Hello": "huh-LOH",
    "Hi": "hahy", 
    "Goodbye": "good-BAHY",
    "Bye": "bahy",
    "Thanks": "thanks",
    "Thank you": "THANK yoo",
    "Please": "pleez",
    "Sorry": "SOR-ee",
    "Excuse me": "ik-SKYOOZ mee",
    "Yes": "yes",
    "No": "noh",
    
    // Business & Finance
    "Office": "AW-fis",
    "Meeting": "MEE-ting", 
    "Email": "EE-mayl",
    "Report": "ri-PORT",
    "Deadline": "DED-lahyn",
    "Presentation": "prez-uhn-TAY-shuhn",
    "Project": "PROJ-ekt",
    "Task": "task",
    "Team": "teem",
    "Manager": "MAN-i-jer",
    "Colleague": "KOL-eeg",
    "Client": "KLAHY-uhnt",
    "Customer": "KUHS-tuh-mer",
    "Salary": "SAL-uh-ree",
    "Invoice": "IN-vois",
    "Contract": "KON-trakt",
    "Budget": "BUHJ-it",
    "Computer": "kuhm-PYOO-ter",
    "Phone": "fohn",
    "Schedule": "SKEJ-ool",
    "Goal": "gohl",
    "Work": "wurk",
    "Job": "job",
    "Business": "BIZ-nis",
    "Company": "KUHM-puh-nee",
    "Money": "MUHN-ee",
    "Price": "prahys",
    "Cost": "kawst",
    "Payment": "PEY-muhnt",
    
    // Food & Dining
    "Food": "food",
    "Water": "WAW-ter",
    "Coffee": "KAW-fee",
    "Tea": "tee",
    "Breakfast": "BREK-fuhst",
    "Lunch": "luhnch",
    "Dinner": "DIN-er",
    "Restaurant": "RES-ter-uhnt",
    "Menu": "MEN-yoo",
    "Order": "AWR-der",
    "Bill": "bil",
    "Check": "chek",
    "Tip": "tip",
    
    // Travel & Transportation
    "Travel": "TRAV-uhl",
    "Airport": "AIR-pawrt",
    "Hotel": "hoh-TEL",
    "Taxi": "TAK-see",
    "Bus": "buhs",
    "Train": "treyn",
    "Car": "kahr",
    "Ticket": "TIK-it",
    "Passport": "PAS-pawrt",
    "Luggage": "LUHG-ij",
    "Flight": "flahyt",
    "Station": "STEY-shuhn",
    
    // Health & Wellness
    "Health": "helth",
    "Doctor": "DOK-ter",
    "Hospital": "HOS-pi-tl",
    "Medicine": "MED-uh-sin",
    "Pain": "peyn",
    "Sick": "sik",
    "Healthy": "HEL-thee",
    "Exercise": "EK-ser-sahyz",
    
    // Family & Relationships
    "Family": "FAM-uh-lee",
    "Mother": "MUHTH-er",
    "Father": "FAH-ther",
    "Sister": "SIS-ter",
    "Brother": "BRUHTH-er",
    "Child": "chahyld",
    "Children": "CHIL-druhn",
    "Friend": "frend",
    "Love": "luhv",
    
    // Time & Numbers
    "Time": "tahym",
    "Today": "tuh-DEY",
    "Yesterday": "YES-ter-dey",
    "Tomorrow": "tuh-MOR-oh",
    "Week": "week",
    "Month": "muhnth",
    "Year": "yeer",
    "Hour": "ouhr",
    "Minute": "MIN-it",
    "Second": "SEK-uhnd",
    "Morning": "MAWR-ning",
    "Afternoon": "af-ter-NOON",
    "Evening": "EEV-ning",
    "Night": "nahyt",
    
    // Common adjectives
    "Good": "good",
    "Bad": "bad",
    "Big": "big",
    "Small": "smawl",
    "New": "noo",
    "Old": "ohld",
    "Hot": "hot",
    "Cold": "kohld",
    "Fast": "fast",
    "Slow": "sloh",
    "Easy": "EE-zee",
    "Hard": "hahrd",
    "Beautiful": "BYOO-tuh-fuhl",
    "Ugly": "UHG-lee",
    
    // Common verbs
    "Go": "goh",
    "Come": "kuhm",
    "See": "see",
    "Look": "look",
    "Listen": "LIS-uhn",
    "Speak": "speek",
    "Talk": "tawk",
    "Read": "reed",
    "Write": "rahyt",
    "Learn": "lurn",
    "Study": "STUHD-ee",
    "Understand": "uhn-der-STAND",
    "Know": "noh",
    "Think": "thingk",
    "Want": "wont",
    "Need": "need",
    "Like": "lahyk",
    "Love": "luhv",
    "Have": "hav",
    "Get": "get",
    "Give": "giv",
    "Take": "teyk",
    "Make": "meyk",
    "Do": "doo",
    "Help": "help",
    "Buy": "bahy",
    "Sell": "sel",
    "Pay": "pey",
    "Open": "OH-puhn",
    "Close": "klohz",
    "Start": "stahrt",
    "Stop": "stop",
    "Finish": "FIN-ish",
    
    // Colors
    "Red": "red",
    "Blue": "bloo",
    "Green": "green",
    "Yellow": "YEL-oh",
    "Black": "blak",
    "White": "hwahyt",
    "Orange": "AWR-inj",
    "Purple": "PUR-puhl",
    "Pink": "pingk",
    "Brown": "broun",
    "Gray": "grey",
    
    // Technology
    "Internet": "IN-ter-net",
    "Website": "WEB-sahyt",
    "Email": "EE-mayl",
    "Password": "PAS-wurd",
    "Download": "DOUN-lohd",
    "Upload": "UHP-lohd",
    "Software": "SAWFT-wair",
    "Application": "ap-li-KEY-shuhn",
    "Program": "PROH-gram"
};

async function populateEnglishPhonetics() {
    try {
        console.log("Reading manifest...");
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        let totalUpdated = 0;
        let filesUpdated = 0;
        
        // Process English lessons only (excluding IELTS which already has phonetics)
        if (manifest.english) {
            for (const categoryName in manifest.english) {
                // Skip IELTS category as it already has proper phonetics
                if (categoryName.toLowerCase().includes('ielts')) {
                    console.log(`Skipping ${categoryName} (already has phonetics)`);
                    continue;
                }
                
                const category = manifest.english[categoryName];
                if (category.lessons) {
                    for (const lesson of category.lessons) {
                        const filePath = path.join(dataDir, lesson.file);
                        
                        if (!fs.existsSync(filePath)) {
                            console.warn(`File not found: ${filePath}`);
                            continue;
                        }
                        
                        const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        let fileModified = false;
                        
                        lessonData.forEach(card => {
                            if (card.english && ENGLISH_PHONETICS[card.english]) {
                                const oldPhonetic = card.phonetic || "";
                                card.phonetic = ENGLISH_PHONETICS[card.english];
                                
                                if (oldPhonetic !== card.phonetic) {
                                    fileModified = true;
                                    totalUpdated++;
                                }
                            }
                        });
                        
                        if (fileModified) {
                            fs.writeFileSync(filePath, JSON.stringify(lessonData, null, 2), 'utf8');
                            filesUpdated++;
                            console.log(`Updated: ${lesson.name} (${lesson.file})`);
                        }
                    }
                }
            }
        }
        
        console.log(`\nCompleted! Updated ${totalUpdated} cards across ${filesUpdated} files.`);
        console.log(`English phonetics format: "WORD" → "pronunciation"`);
        
    } catch (error) {
        console.error("Error populating English phonetics:", error);
    }
}

// Also create a function to show statistics
function showPhoneticStats() {
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        let totalCards = 0;
        let withPhonetics = 0;
        let emptyPhonetics = 0;
        
        if (manifest.english) {
            for (const categoryName in manifest.english) {
                const category = manifest.english[categoryName];
                if (category.lessons) {
                    for (const lesson of category.lessons) {
                        const filePath = path.join(dataDir, lesson.file);
                        if (fs.existsSync(filePath)) {
                            const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                            lessonData.forEach(card => {
                                if (card.english) {
                                    totalCards++;
                                    if (card.phonetic && card.phonetic.trim()) {
                                        withPhonetics++;
                                    } else {
                                        emptyPhonetics++;
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
        
        console.log(`\nPhonetic Statistics:`);
        console.log(`Total English cards: ${totalCards}`);
        console.log(`With phonetics: ${withPhonetics} (${((withPhonetics/totalCards)*100).toFixed(1)}%)`);
        console.log(`Missing phonetics: ${emptyPhonetics} (${((emptyPhonetics/totalCards)*100).toFixed(1)}%)`);
        console.log(`Available in dictionary: ${Object.keys(ENGLISH_PHONETICS).length} words`);
        
    } catch (error) {
        console.error("Error getting stats:", error);
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--stats')) {
        showPhoneticStats();
    } else {
        populateEnglishPhonetics();
    }
}

module.exports = { populateEnglishPhonetics, showPhoneticStats, ENGLISH_PHONETICS };
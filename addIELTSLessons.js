const fs = require('fs');
const path = require('path');

const lessonsFilePath = path.join(__dirname, 'data', 'lessons.json');

const newIELTSLessons = {
  "IELTS Vocabulary: Lesson 1": [
    { "english": "accommodate", "thai": "รองรับ", "phonetic": "uh-KOM-uh-dayt" },
    { "english": "achieve", "thai": "บรรลุ", "phonetic": "uh-CHEEV" },
    { "english": "acquire", "thai": "ได้มา", "phonetic": "uh-KWY-er" },
    { "english": "adapt", "thai": "ปรับตัว", "phonetic": "uh-DAPT" },
    { "english": "adequate", "thai": "เพียงพอ", "phonetic": "AD-uh-kwit" },
    { "english": "adjust", "thai": "ปรับ", "phonetic": "uh-JUST" },
    { "english": "advocate", "thai": "สนับสนุน", "phonetic": "AD-vuh-kayt" },
    { "english": "alter", "thai": "เปลี่ยนแปลง", "phonetic": "AWL-ter" },
    { "english": "analyze", "thai": "วิเคราะห์", "phonetic": "AN-uh-lyz" },
    { "english": "anticipate", "thai": "คาดการณ์", "phonetic": "an-TIS-uh-payt" },
    { "english": "apparent", "thai": "ชัดเจน", "phonetic": "uh-PAIR-uhnt" },
    { "english": "approach", "thai": "แนวทาง", "phonetic": "uh-PROHCH" },
    { "english": "appropriate", "thai": "เหมาะสม", "phonetic": "uh-PROH-pree-it" },
    { "english": "approximate", "thai": "ประมาณ", "phonetic": "uh-PROK-suh-mit" },
    { "english": "arbitrary", "thai": "ตามอำเภอใจ", "phonetic": "AHR-bi-trayr-ee" }
  ],
  "IELTS Vocabulary: Lesson 2": [
    { "english": "assess", "thai": "ประเมิน", "phonetic": "uh-SES" },
    { "english": "assume", "thai": "สมมติ", "phonetic": "uh-SOOM" },
    { "english": "attain", "thai": "บรรลุ", "phonetic": "uh-TAYN" },
    { "english": "attribute", "thai": "คุณลักษณะ", "phonetic": "AT-ruh-byoot" },
    { "english": "bias", "thai": "อคติ", "phonetic": "BY-uhs" },
    { "english": "brief", "thai": "สั้นๆ", "phonetic": "BREEF" },
    { "english": "capable", "thai": "สามารถ", "phonetic": "KAY-puh-buhl" },
    { "english": "capacity", "thai": "ความจุ", "phonetic": "kuh-PAS-uh-tee" },
    { "english": "challenge", "thai": "ท้าทาย", "phonetic": "CHAL-inj" },
    { "english": "cite", "thai": "อ้างอิง", "phonetic": "SYT" },
    { "english": "clarify", "thai": "ชี้แจง", "phonetic": "KLAIR-uh-fy" },
    { "english": "cohesive", "thai": "เหนียวแน่น", "phonetic": "koh-HEE-siv" },
    { "english": "commence", "thai": "เริ่มต้น", "phonetic": "kuh-MENS" },
    { "english": "compensate", "thai": "ชดเชย", "phonetic": "KOM-puhn-sayt" },
    { "english": "compile", "thai": "รวบรวม", "phonetic": "kuhm-PYL" }
  ],
  "IELTS Vocabulary: Lesson 3": [
    { "english": "complement", "thai": "ส่วนเติมเต็ม", "phonetic": "KOM-pluh-ment" },
    { "english": "comprehensive", "thai": "ครอบคลุม", "phonetic": "kom-pri-HEN-siv" },
    { "english": "comprise", "thai": "ประกอบด้วย", "phonetic": "kuhm-PRYZ" },
    { "english": "conceive", "thai": "คิดขึ้น", "phonetic": "kuhn-SEEV" },
    { "english": "conclude", "thai": "สรุป", "phonetic": "kuhn-KLOOD" },
    { "english": "concurrent", "thai": "พร้อมกัน", "phonetic": "kuhn-KUR-uhnt" },
    { "english": "conduct", "thai": "ดำเนินการ", "phonetic": "kuhn-DUKT" },
    { "english": "confine", "thai": "จำกัด", "phonetic": "kuhn-FYN" },
    { "english": "confirm", "thai": "ยืนยัน", "phonetic": "kuhn-FURM" },
    { "english": "conform", "thai": "ปฏิบัติตาม", "phonetic": "kuhn-FORM" },
    { "english": "consecutive", "thai": "ต่อเนื่อง", "phonetic": "kuhn-SEK-yuh-tiv" },
    { "english": "consequently", "thai": "ดังนั้น", "phonetic": "KON-suh-kwent-lee" },
    { "english": "considerable", "thai": "มากพอสมควร", "phonetic": "kuhn-SID-er-uh-buhl" },
    { "english": "consistent", "thai": "สอดคล้องกัน", "phonetic": "kuhn-SIS-tuhnt" },
    { "english": "constrain", "thai": "จำกัด", "phonetic": "kuhn-STRAYN" }
  ],
  "IELTS Vocabulary: Lesson 4": [
    { "english": "constructive", "thai": "สร้างสรรค์", "phonetic": "kuhn-STRUK-tiv" },
    { "english": "consume", "thai": "บริโภค", "phonetic": "kuhn-SOOM" },
    { "english": "contemporary", "thai": "ร่วมสมัย", "phonetic": "kuhn-TEM-puh-rer-ee" },
    { "english": "context", "thai": "บริบท", "phonetic": "KON-tekst" },
    { "english": "contract", "thai": "สัญญา", "phonetic": "KON-trakt" },
    { "english": "contradict", "thai": "ขัดแย้ง", "phonetic": "kon-truh-DIKT" },
    { "english": "contribute", "thai": "มีส่วนร่วม", "phonetic": "kuhn-TRIB-yoot" },
    { "english": "controversy", "thai": "ข้อโต้แย้ง", "phonetic": "KON-truh-vur-see" },
    { "english": "convene", "thai": "เรียกประชุม", "phonetic": "kuhn-VEEN" },
    { "english": "conventional", "thai": "ตามธรรมเนียม", "phonetic": "kuhn-VEN-shuh-nuhl" },
    { "english": "convert", "thai": "แปลง", "phonetic": "kuhn-VURT" },
    { "english": "correspond", "thai": "สอดคล้อง", "phonetic": "kor-uh-SPOND" },
    { "english": "crucial", "thai": "สำคัญมาก", "phonetic": "KROO-shuhl" },
    { "english": "deduce", "thai": "อนุมาน", "phonetic": "di-DOOS" },
    { "english": "define", "thai": "นิยาม", "phonetic": "di-FYN" }
  ],
  "IELTS Vocabulary: Lesson 5": [
    { "english": "demonstrate", "thai": "สาธิต", "phonetic": "DEM-uhn-strayt" },
    { "english": "denote", "thai": "แสดงถึง", "phonetic": "di-NOHT" },
    { "english": "derive", "thai": "ได้มาจาก", "phonetic": "di-RYV" },
    { "english": "designate", "thai": "กำหนด", "phonetic": "DEZ-ig-nayt" },
    { "english": "detect", "thai": "ตรวจจับ", "phonetic": "di-TEKT" },
    { "english": "deviate", "thai": "เบี่ยงเบน", "phonetic": "DEE-vee-ayt" },
    { "english": "devise", "thai": "ประดิษฐ์", "phonetic": "di-VYZ" },
    { "english": "differentiate", "thai": "แยกแยะ", "phonetic": "dif-uh-REN-shee-ayt" },
    { "english": "diminish", "thai": "ลดลง", "phonetic": "di-MIN-ish" },
    { "english": "discrete", "thai": "แยกจากกัน", "phonetic": "di-SKREET" },
    { "english": "displace", "thai": "แทนที่", "phonetic": "dis-PLAYS" },
    { "english": "dispose", "thai": "กำจัด", "phonetic": "dis-POHZ" },
    { "english": "distinct", "thai": "แตกต่าง", "phonetic": "di-STINKT" },
    { "english": "distort", "thai": "บิดเบือน", "phonetic": "dis-TORT" },
    { "english": "diverse", "thai": "หลากหลาย", "phonetic": "di-VURS" }
  ]
};

function addIELTSLessons() {
    try {
        let lessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));

        // Initialize IELTS Vocabulary category if it doesn't exist
        if (!lessonsData.english["IELTS Vocabulary"]) {
            lessonsData.english["IELTS Vocabulary"] = {};
        }

        const existingWords = new Set();

        // Populate existingWords set from all current English lessons
        for (const category in lessonsData.english) {
            for (const lessonName in lessonsData.english[category]) {
                lessonsData.english[category][lessonName].forEach(card => {
                    existingWords.add(card.english.toLowerCase().trim());
                });
            }
        }
        // Populate existingWords set from all current Chinese lessons (to avoid English words being duplicated in Chinese)
        for (const category in lessonsData.chinese) {
            for (const lessonName in lessonsData.chinese[category]) {
                lessonsData.chinese[category][lessonName].forEach(card => {
                    // Assuming Chinese words might also have an English equivalent that we want to avoid duplicating
                    // This might need adjustment based on how you handle cross-language duplicates
                    if (card.english) { // Check if an English field exists in Chinese cards
                        existingWords.add(card.english.toLowerCase().trim());
                    }
                });
            }
        }


        let wordsAdded = 0;
        let duplicatesSkipped = 0;

        for (const lessonName in newIELTSLessons) {
            if (!lessonsData.english["IELTS Vocabulary"][lessonName]) {
                lessonsData.english["IELTS Vocabulary"][lessonName] = [];
            }

            newIELTSLessons[lessonName].forEach(newCard => {
                const normalizedNewWord = newCard.english.toLowerCase().trim();
                if (!existingWords.has(normalizedNewWord)) {
                    lessonsData.english["IELTS Vocabulary"][lessonName].push(newCard);
                    existingWords.add(normalizedNewWord);
                    wordsAdded++;
                } else {
                    duplicatesSkipped++;
                }
            });
        }

        fs.writeFileSync(lessonsFilePath, JSON.stringify(lessonsData, null, 2), 'utf8');
        console.log(`Successfully added ${wordsAdded} new words to lessons.json.`);
        if (duplicatesSkipped > 0) {
            console.log(`Skipped ${duplicatesSkipped} duplicate words.`);
        }
        console.log("lessons.json updated successfully!");

    } catch (error) {
        console.error("Error adding IELTS lessons:", error);
    }
}

addIELTSLessons();
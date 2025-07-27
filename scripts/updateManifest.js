const fs = require('fs');
const path = require('path');

const manifestFilePath = path.join(__dirname, '..', 'data', 'manifest.json');

function updateManifest() {
    try {
        console.log('Updating manifest with Thai category names...');
        const manifest = JSON.parse(fs.readFileSync(manifestFilePath, 'utf8'));

        if (manifest.english && manifest.english["IELTS Vocabulary"]) {
            manifest.english["IELTS Vocabulary"].name_th = "คำศัพท์ IELTS";
        }

        if (manifest.chinese && manifest.chinese["HSK 1"]) {
            manifest.chinese["HSK 1"].name_th = "HSK 1";
        }

        fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2), 'utf8');
        console.log('Successfully updated manifest with Thai category names.');

    } catch (error) {
        console.error('Error updating manifest:', error);
    }
}

updateManifest();

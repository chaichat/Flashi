class DataService {
    constructor() {
        this.manifest = {};
        this.lessonCache = new Map();
    }

    async loadManifest() {
        try {
            const response = await fetch('data/manifest.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.manifest = await response.json();
            return this.manifest;
        } catch (error) {
            console.error("Failed to load manifest:", error);
            throw new Error('Failed to load lesson structure. Please try refreshing the page.');
        }
    }

    async loadLesson(lessonFile) {
        if (this.lessonCache.has(lessonFile)) {
            return this.lessonCache.get(lessonFile);
        }

        try {
            const response = await fetch(`data/${lessonFile}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const lessonData = await response.json();
            this.lessonCache.set(lessonFile, lessonData);
            return lessonData;
        } catch (error) {
            console.error(`Failed to load lesson file: ${lessonFile}`, error);
            return [];
        }
    }

    getManifest() {
        return this.manifest;
    }

    getLanguages() {
        return Object.keys(this.manifest);
    }

    getCategories(language) {
        return this.manifest[language] ? Object.keys(this.manifest[language]) : [];
    }

    getCategoryData(language, category) {
        return this.manifest[language]?.[category] || null;
    }

    getLessons(language, category) {
        return this.manifest[language]?.[category]?.lessons || [];
    }

    clearCache() {
        this.lessonCache.clear();
    }
}

export default DataService;
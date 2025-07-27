class StorageService {
    constructor() {
        this.prefix = 'flashi_';
    }

    setLanguage(language) {
        this.setItem('language', language);
    }

    getLanguage() {
        return this.getItem('language');
    }

    setProgress(lessonId, progress) {
        const progressKey = `progress_${lessonId}`;
        this.setItem(progressKey, progress);
    }

    getProgress(lessonId) {
        const progressKey = `progress_${lessonId}`;
        return this.getItem(progressKey) || { completed: false, score: 0 };
    }

    setItem(key, value) {
        try {
            const prefixedKey = this.prefix + key;
            localStorage.setItem(prefixedKey, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    getItem(key) {
        try {
            const prefixedKey = this.prefix + key;
            const item = localStorage.getItem(prefixedKey);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return null;
        }
    }

    removeItem(key) {
        try {
            const prefixedKey = this.prefix + key;
            localStorage.removeItem(prefixedKey);
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
        }
    }

    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }

    getAllProgress() {
        try {
            const progress = {};
            const keys = Object.keys(localStorage);
            const progressPrefix = this.prefix + 'progress_';
            
            keys.forEach(key => {
                if (key.startsWith(progressPrefix)) {
                    const lessonId = key.replace(progressPrefix, '');
                    progress[lessonId] = JSON.parse(localStorage.getItem(key));
                }
            });
            
            return progress;
        } catch (error) {
            console.error('Failed to get all progress:', error);
            return {};
        }
    }
}

export default StorageService;
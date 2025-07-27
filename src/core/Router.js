import { SCREENS } from '../utils/Constants.js';

class Router {
    constructor(app) {
        this.app = app;
        this.currentScreen = null;
    }

    async initialize() {
        const currentLanguage = this.app.storageService.getLanguage();
        
        if (currentLanguage && this.app.state.getManifest()[currentLanguage]) {
            this.app.state.setCurrentLanguage(currentLanguage);
            this.navigateToCategories();
        } else {
            this.navigateToLanguageSelector();
        }
    }

    navigateToLanguageSelector() {
        this.currentScreen = SCREENS.LANGUAGE_SELECTOR;
        this.app.languageSelector.show();
    }

    navigateToCategories() {
        this.currentScreen = SCREENS.CATEGORY_SELECTOR;
        this.app.categoryGrid.show();
    }

    navigateToLessons() {
        this.currentScreen = SCREENS.LESSON_SELECTOR;
        this.app.lessonGrid.show();
    }

    async navigateToFlashcards(lessonInfo) {
        this.currentScreen = SCREENS.FLASHCARD_CONTAINER;
        await this.app.flashcardDeck.show(lessonInfo);
    }

    getCurrentScreen() {
        return this.currentScreen;
    }

    // Navigation history for back button behavior
    goBack() {
        switch (this.currentScreen) {
            case SCREENS.CATEGORY_SELECTOR:
                this.navigateToLanguageSelector();
                break;
            case SCREENS.LESSON_SELECTOR:
                this.navigateToCategories();
                break;
            case SCREENS.FLASHCARD_CONTAINER:
                this.navigateToLessons();
                break;
            default:
                this.navigateToLanguageSelector();
        }
    }

    // Handle browser back/forward buttons (if implementing history API later)
    handlePopState(event) {
        // Implementation for browser history navigation
        // This would be useful for web app navigation
        if (event.state && event.state.screen) {
            switch (event.state.screen) {
                case SCREENS.LANGUAGE_SELECTOR:
                    this.navigateToLanguageSelector();
                    break;
                case SCREENS.CATEGORY_SELECTOR:
                    this.navigateToCategories();
                    break;
                case SCREENS.LESSON_SELECTOR:
                    this.navigateToLessons();
                    break;
                case SCREENS.FLASHCARD_CONTAINER:
                    // Would need to restore lesson context
                    break;
            }
        }
    }

    // Update browser URL (for future web app enhancement)
    updateHistory(screen, data = {}) {
        if (window.history && window.history.pushState) {
            const state = { screen, ...data };
            const url = this.generateURL(screen, data);
            window.history.pushState(state, '', url);
        }
    }

    generateURL(screen, data) {
        switch (screen) {
            case SCREENS.LANGUAGE_SELECTOR:
                return '/';
            case SCREENS.CATEGORY_SELECTOR:
                return `/${data.language || 'select'}`;
            case SCREENS.LESSON_SELECTOR:
                return `/${data.language}/${data.category}`;
            case SCREENS.FLASHCARD_CONTAINER:
                return `/${data.language}/${data.category}/${data.lesson}`;
            default:
                return '/';
        }
    }
}

export default Router;
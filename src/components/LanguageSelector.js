import DOMHelpers from '../utils/DOMHelpers.js';
import { ELEMENT_IDS, UI_TEXT, LANGUAGES } from '../utils/Constants.js';

class LanguageSelector {
    constructor(state, storageService, router) {
        this.state = state;
        this.storageService = storageService;
        this.router = router;
        this.element = DOMHelpers.getElementById(ELEMENT_IDS.LANGUAGE_SELECTOR);
        this.setupEventListeners();
    }

    show() {
        DOMHelpers.show(this.element);
        this.hideOtherScreens();
    }

    hide() {
        DOMHelpers.hide(this.element);
    }

    hideOtherScreens() {
        DOMHelpers.hide(DOMHelpers.getElementById(ELEMENT_IDS.CATEGORY_SELECTOR));
        DOMHelpers.hide(DOMHelpers.getElementById(ELEMENT_IDS.LESSON_SELECTOR));
        DOMHelpers.hide(DOMHelpers.getElementById(ELEMENT_IDS.FLASHCARD_CONTAINER));
    }

    setupEventListeners() {
        const englishBtn = DOMHelpers.getElementById(ELEMENT_IDS.SELECT_ENGLISH);
        const chineseBtn = DOMHelpers.getElementById(ELEMENT_IDS.SELECT_CHINESE);

        if (englishBtn) {
            DOMHelpers.addEventListener(englishBtn, 'click', () => {
                this.selectLanguage(LANGUAGES.ENGLISH);
            });
        }

        if (chineseBtn) {
            DOMHelpers.addEventListener(chineseBtn, 'click', () => {
                this.selectLanguage(LANGUAGES.CHINESE);
            });
        }
    }

    selectLanguage(language) {
        this.state.setCurrentLanguage(language);
        this.storageService.setLanguage(language);
        
        // Warm up speech synthesis
        const speechService = this.router.app.speechService;
        if (speechService && !speechService.isSpeaking()) {
            speechService.speak('', 'en-US');
        }

        this.router.navigateToCategories();
    }

    render() {
        // The HTML structure is already in place in index.html
        // This method could be used for dynamic content updates if needed
        const title = this.element?.querySelector('h1');
        const subtitle = this.element?.querySelector('p');
        
        if (title) {
            DOMHelpers.setText(title, UI_TEXT.THAI.WELCOME);
        }
        
        if (subtitle) {
            DOMHelpers.setText(subtitle, UI_TEXT.THAI.SELECT_LANGUAGE);
        }
    }
}

export default LanguageSelector;
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
        
        // Android fix: Warm up speech synthesis with actual text in user gesture
        const speechService = this.router.app.speechService;
        if (speechService && !speechService.isSpeaking()) {
            // Use a very short, barely audible sound to enable speech on Android
            speechService.speak('Hi', language === 'english' ? 'en-US' : 'zh-CN');
            // Cancel immediately to make it silent but enable speech permissions
            setTimeout(() => {
                speechService.cancel();
            }, 50);
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
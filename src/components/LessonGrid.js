import DOMHelpers from '../utils/DOMHelpers.js';
import { ELEMENT_IDS } from '../utils/Constants.js';

class LessonGrid {
    constructor(state, dataService, router) {
        this.state = state;
        this.dataService = dataService;
        this.router = router;
        this.element = DOMHelpers.getElementById(ELEMENT_IDS.LESSON_SELECTOR);
        this.gridElement = DOMHelpers.getElementById(ELEMENT_IDS.LESSON_GRID);
        this.titleElement = DOMHelpers.getElementById(ELEMENT_IDS.LESSON_CATEGORY_TITLE);
        this.setupEventListeners();
    }

    show() {
        this.hideOtherScreens();
        DOMHelpers.show(this.element);
        this.updateTitle();
        this.renderGrid();
    }

    hide() {
        DOMHelpers.hide(this.element);
    }

    hideOtherScreens() {
        DOMHelpers.hide(DOMHelpers.getElementById(ELEMENT_IDS.LANGUAGE_SELECTOR));
        DOMHelpers.hide(DOMHelpers.getElementById(ELEMENT_IDS.CATEGORY_SELECTOR));
        DOMHelpers.hide(DOMHelpers.getElementById(ELEMENT_IDS.FLASHCARD_CONTAINER));
    }

    updateTitle() {
        if (this.titleElement) {
            const currentLanguage = this.state.getCurrentLanguage();
            const currentCategory = this.state.getCurrentCategory();
            const manifest = this.state.getManifest();
            
            const categoryData = manifest[currentLanguage]?.[currentCategory];
            const displayName = categoryData?.name_th || currentCategory;
            
            DOMHelpers.setText(this.titleElement, displayName);
        }
    }

    setupEventListeners() {
        const backBtn = DOMHelpers.getElementById(ELEMENT_IDS.BACK_TO_CATEGORIES);
        const changeLanguageBtn = DOMHelpers.getElementById(ELEMENT_IDS.CHANGE_LANGUAGE_FROM_LESSON);

        if (backBtn) {
            DOMHelpers.addEventListener(backBtn, 'click', () => {
                this.router.navigateToCategories();
            });
        }

        if (changeLanguageBtn) {
            DOMHelpers.addEventListener(changeLanguageBtn, 'click', () => {
                this.router.navigateToLanguageSelector();
            });
        }
    }

    renderGrid() {
        if (!this.gridElement) return;

        DOMHelpers.clearContent(this.gridElement);
        
        const lessons = this.state.getCurrentCategoryLessons();

        lessons.forEach(lessonInfo => {
            const button = this.createLessonButton(lessonInfo);
            this.gridElement.appendChild(button);
        });
    }

    createLessonButton(lessonInfo) {
        const isReview = lessonInfo.isReview;
        
        const buttonClass = isReview
            ? 'p-4 bg-yellow-100 border-2 border-yellow-300 rounded-xl text-center shadow-sm hover:shadow-md hover:border-yellow-500 transition-all duration-200'
            : 'p-4 bg-white border-2 border-gray-200 rounded-xl text-center shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200';

        const button = DOMHelpers.createElement('button', buttonClass);

        const icon = isReview ? '⭐' : '📚';
        const displayName = lessonInfo.name_th || lessonInfo.name;

        button.innerHTML = `
            <div class="text-3xl mb-2">${icon}</div>
            <div class="font-semibold text-gray-700">${displayName}</div>
        `;

        DOMHelpers.addEventListener(button, 'click', () => {
            this.selectLesson(lessonInfo);
        });

        return button;
    }

    selectLesson(lessonInfo) {
        this.state.setCurrentLesson(lessonInfo);
        this.router.navigateToFlashcards(lessonInfo);
    }
}

export default LessonGrid;
import DOMHelpers from '../utils/DOMHelpers.js';
import { ELEMENT_IDS, UI_TEXT } from '../utils/Constants.js';

class CategoryGrid {
    constructor(state, dataService, router) {
        this.state = state;
        this.dataService = dataService;
        this.router = router;
        this.element = DOMHelpers.getElementById(ELEMENT_IDS.CATEGORY_SELECTOR);
        this.gridElement = DOMHelpers.getElementById(ELEMENT_IDS.CATEGORY_GRID);
        this.titleElement = DOMHelpers.getElementById(ELEMENT_IDS.CATEGORY_LANGUAGE_TITLE);
        this.setupEventListeners();
    }

    show() {
        const currentLanguage = this.state.getCurrentLanguage();
        const manifest = this.state.getManifest();
        
        if (!currentLanguage || !manifest[currentLanguage]) {
            this.router.navigateToLanguageSelector();
            return;
        }

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
        DOMHelpers.hide(DOMHelpers.getElementById(ELEMENT_IDS.LESSON_SELECTOR));
        DOMHelpers.hide(DOMHelpers.getElementById(ELEMENT_IDS.FLASHCARD_CONTAINER));
    }

    updateTitle() {
        const currentLanguage = this.state.getCurrentLanguage();
        if (this.titleElement) {
            const titleText = currentLanguage === 'english' 
                ? UI_TEXT.THAI.LEARN_ENGLISH 
                : UI_TEXT.THAI.LEARN_CHINESE;
            DOMHelpers.setText(this.titleElement, titleText);
        }
    }

    setupEventListeners() {
        const changeLanguageBtn = DOMHelpers.getElementById(ELEMENT_IDS.CHANGE_LANGUAGE_FROM_CATEGORY);
        if (changeLanguageBtn) {
            DOMHelpers.addEventListener(changeLanguageBtn, 'click', () => {
                this.router.navigateToLanguageSelector();
            });
        }
    }

    renderGrid() {
        if (!this.gridElement) return;

        DOMHelpers.clearContent(this.gridElement);
        
        const currentLanguage = this.state.getCurrentLanguage();
        const manifest = this.state.getManifest();
        const categories = this.dataService.getCategories(currentLanguage);

        categories.forEach(categoryName => {
            const categoryData = manifest[currentLanguage][categoryName];
            const button = this.createCategoryButton(categoryName, categoryData);
            this.gridElement.appendChild(button);
        });
    }

    createCategoryButton(categoryName, categoryData) {
        const button = DOMHelpers.createElement(
            'button',
            'p-4 bg-white border-2 border-gray-200 rounded-xl text-center shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200'
        );

        const displayName = categoryData?.name_th || categoryName;
        
        button.innerHTML = `
            <div class="text-3xl mb-2">📁</div>
            <div class="font-semibold text-gray-700">${displayName}</div>
        `;

        DOMHelpers.addEventListener(button, 'click', () => {
            this.selectCategory(categoryName);
        });

        return button;
    }

    selectCategory(categoryName) {
        const lessons = this.dataService.getLessons(
            this.state.getCurrentLanguage(), 
            categoryName
        );
        
        this.state.setCurrentCategory(categoryName);
        this.state.setCurrentCategoryLessons(lessons);
        this.router.navigateToLessons();
    }
}

export default CategoryGrid;
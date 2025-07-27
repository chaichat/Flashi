export const SCREENS = {
    LANGUAGE_SELECTOR: 'language-selector',
    CATEGORY_SELECTOR: 'category-selector', 
    LESSON_SELECTOR: 'lesson-selector',
    FLASHCARD_CONTAINER: 'flashcard-container'
};

export const SWIPE_CONFIG = {
    MIN_DISTANCE: 75,
    MIN_VELOCITY: 0.3,
    ANIMATION_DURATION: 300
};

export const SPEECH_CONFIG = {
    PITCH: 1,
    RATE: 0.9,
    WARM_UP_TEXT: ''
};

export const STORAGE_KEYS = {
    LANGUAGE: 'language',
    PROGRESS: 'progress'
};

export const COLORS = {
    PALETTE: [
        'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 
        'bg-red-200', 'bg-purple-200', 'bg-pink-200', 'bg-indigo-200'
    ]
};

export const LANGUAGES = {
    ENGLISH: 'english',
    CHINESE: 'chinese'
};

export const ELEMENT_IDS = {
    APP_CONTAINER: 'app-container',
    LANGUAGE_SELECTOR: 'language-selector',
    CATEGORY_SELECTOR: 'category-selector',
    CATEGORY_GRID: 'category-grid',
    CATEGORY_LANGUAGE_TITLE: 'category-language-title',
    CHANGE_LANGUAGE_FROM_CATEGORY: 'change-language-from-category',
    LESSON_SELECTOR: 'lesson-selector',
    LESSON_GRID: 'lesson-grid',
    LESSON_CATEGORY_TITLE: 'lesson-category-title',
    BACK_TO_CATEGORIES: 'back-to-categories',
    CHANGE_LANGUAGE_FROM_LESSON: 'change-language-from-lesson',
    FLASHCARD_CONTAINER: 'flashcard-container',
    SECTION_TITLE: 'section-title',
    DECK: 'deck',
    LEARN_MODE_BTN: 'learn-mode-btn',
    TEST_MODE_BTN: 'test-mode-btn',
    TEST_MODE_CONTROLS: 'test-mode-controls',
    REVEAL_BTN: 'reveal-btn',
    BACK_TO_LESSONS: 'back-to-lessons',
    SELECT_ENGLISH: 'select-english',
    SELECT_CHINESE: 'select-chinese',
    RESTART_SECTION: 'restart-section'
};

export const UI_TEXT = {
    THAI: {
        WELCOME: 'Welcome to Flashi',
        SELECT_LANGUAGE: 'Please select a language to learn.',
        LEARN_ENGLISH: 'เรียนภาษาอังกฤษ',
        LEARN_CHINESE: 'เรียนภาษาจีน',
        EXCELLENT: 'ยอดเยี่ยม!',
        LESSON_COMPLETE: 'คุณเรียนรู้ครบทุกคำในบทนี้แล้ว',
        RESTART: 'เริ่มใหม่',
        LEARN: 'เรียน',
        TEST: 'ทดสอบ',
        CHANGE: 'Change'
    }
};

export const CARD_CLASSES = {
    CARD: 'card shadow-lg',
    CARD_INNER: 'card-inner bg-white',
    LEARN_MODE_CARD: 'learn-mode-card',
    DRAGGING: 'dragging',
    TOP_HALF: 'top-half w-full h-1/2 flex justify-center items-center',
    BOTTOM_HALF: 'bottom-half w-full h-1/2 flex flex-col justify-center items-center p-6 pointer-events-none',
    REVEAL_CONTENT: 'reveal-content mt-4 opacity-0 transition-opacity duration-300'
};

export default {
    SCREENS,
    SWIPE_CONFIG,
    SPEECH_CONFIG,
    STORAGE_KEYS,
    COLORS,
    LANGUAGES,
    ELEMENT_IDS,
    UI_TEXT,
    CARD_CLASSES
};
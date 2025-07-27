import State from './State.js';
import Router from './Router.js';
import DataService from '../services/DataService.js';
import StorageService from '../services/StorageService.js';
import SpeechService from '../services/SpeechService.js';
import LanguageSelector from '../components/LanguageSelector.js';
import CategoryGrid from '../components/CategoryGrid.js';
import LessonGrid from '../components/LessonGrid.js';
import FlashcardDeck from '../components/FlashcardDeck.js';
import DOMHelpers from '../utils/DOMHelpers.js';
import { ELEMENT_IDS } from '../utils/Constants.js';

class App {
    constructor() {
        this.isInitialized = false;
        this.initializeServices();
        this.initializeComponents();
    }

    initializeServices() {
        // Core services
        this.state = new State();
        this.dataService = new DataService();
        this.storageService = new StorageService();
        this.speechService = new SpeechService();
        
        // Router needs reference to app
        this.router = new Router(this);
    }

    initializeComponents() {
        // UI Components
        this.languageSelector = new LanguageSelector(this.state, this.storageService, this.router);
        this.categoryGrid = new CategoryGrid(this.state, this.dataService, this.router);
        this.lessonGrid = new LessonGrid(this.state, this.dataService, this.router);
        this.flashcardDeck = new FlashcardDeck(this.state, this.dataService, this.speechService, this.router);
    }

    async initialize() {
        try {
            // Load manifest data
            const manifest = await this.dataService.loadManifest();
            this.state.setManifest(manifest);
            
            // Initialize router and show appropriate screen
            await this.router.initialize();
            
            this.isInitialized = true;
            console.log('Flashi app initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showErrorScreen(error.message);
        }
    }

    showErrorScreen(message) {
        const appContainer = DOMHelpers.getElementById(ELEMENT_IDS.APP_CONTAINER);
        if (appContainer) {
            const errorHTML = `
                <div class="w-full bg-white p-8 rounded-3xl shadow-lg text-center">
                    <div class="text-6xl mb-4">❌</div>
                    <h2 class="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="window.location.reload()" class="px-6 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors">
                        รีโหลดหน้า
                    </button>
                </div>
            `;
            DOMHelpers.setContent(appContainer, errorHTML);
        }
    }

    // Global error handler
    handleError(error) {
        console.error('App error:', error);
        
        // Show user-friendly error message
        const errorMessage = error.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง';
        
        // You could show a toast notification or modal here
        // For now, we'll log it and potentially show an error screen
        if (!this.isInitialized) {
            this.showErrorScreen(errorMessage);
        }
    }

    // Cleanup method for when app is destroyed
    destroy() {
        // Clear any timers, event listeners, etc.
        if (this.speechService) {
            this.speechService.cancel();
        }
        
        if (this.dataService) {
            this.dataService.clearCache();
        }
        
        // Clear state
        if (this.state) {
            this.state.reset();
        }
        
        console.log('Flashi app destroyed');
    }

    // Method to restart the app
    async restart() {
        this.destroy();
        this.initializeServices();
        this.initializeComponents();
        await this.initialize();
    }

    // Get app info for debugging
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            currentScreen: this.router?.getCurrentScreen(),
            currentLanguage: this.state?.getCurrentLanguage(),
            currentCategory: this.state?.getCurrentCategory(),
            currentLesson: this.state?.getCurrentLesson(),
            deckSize: this.state?.getCurrentDeck()?.length || 0,
            cardIndex: this.state?.getCardIndex(),
            isLearnMode: this.state?.isInLearnMode(),
            voicesLoaded: this.speechService?.isReady()
        };
    }
}

export default App;
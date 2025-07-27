class State {
    constructor() {
        this.state = {
            manifest: {},
            currentLanguage: null,
            currentCategory: null,
            currentCategoryLessons: [],
            currentLesson: null,
            currentDeck: [],
            cardIndex: 0,
            isLearnMode: true,
            colorPalette: [
                'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 
                'bg-red-200', 'bg-purple-200', 'bg-pink-200', 'bg-indigo-200'
            ]
        };
        this.listeners = new Map();
    }

    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    // Notify listeners of state changes
    notify(key, value) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => callback(value, this.state));
        }
    }

    // Generic setter that notifies listeners
    setState(key, value) {
        if (this.state[key] !== value) {
            this.state[key] = value;
            this.notify(key, value);
        }
    }

    // Generic getter
    getState(key) {
        return this.state[key];
    }

    // Get entire state (read-only)
    getAllState() {
        return { ...this.state };
    }

    // Specific setters for better API
    setManifest(manifest) {
        this.setState('manifest', manifest);
    }

    setCurrentLanguage(language) {
        this.setState('currentLanguage', language);
    }

    setCurrentCategory(category) {
        this.setState('currentCategory', category);
    }

    setCurrentCategoryLessons(lessons) {
        this.setState('currentCategoryLessons', lessons);
    }

    setCurrentLesson(lesson) {
        this.setState('currentLesson', lesson);
    }

    setCurrentDeck(deck) {
        this.setState('currentDeck', deck);
    }

    setCardIndex(index) {
        this.setState('cardIndex', index);
    }

    setLearnMode(isLearnMode) {
        this.setState('isLearnMode', isLearnMode);
    }

    // Specific getters
    getManifest() {
        return this.getState('manifest');
    }

    getCurrentLanguage() {
        return this.getState('currentLanguage');
    }

    getCurrentCategory() {
        return this.getState('currentCategory');
    }

    getCurrentCategoryLessons() {
        return this.getState('currentCategoryLessons');
    }

    getCurrentLesson() {
        return this.getState('currentLesson');
    }

    getCurrentDeck() {
        return this.getState('currentDeck');
    }

    getCardIndex() {
        return this.getState('cardIndex');
    }

    isInLearnMode() {
        return this.getState('isLearnMode');
    }

    getColorPalette() {
        return this.getState('colorPalette');
    }

    // Navigation helpers
    nextCard() {
        const currentIndex = this.getCardIndex();
        const deck = this.getCurrentDeck();
        if (currentIndex < deck.length - 1) {
            this.setCardIndex(currentIndex + 1);
            return true;
        }
        return false;
    }

    previousCard() {
        const currentIndex = this.getCardIndex();
        if (currentIndex > 0) {
            this.setCardIndex(currentIndex - 1);
            return true;
        }
        return false;
    }

    resetCardIndex() {
        this.setCardIndex(0);
    }

    isLastCard() {
        const currentIndex = this.getCardIndex();
        const deck = this.getCurrentDeck();
        return currentIndex >= deck.length - 1;
    }

    getCurrentCard() {
        const deck = this.getCurrentDeck();
        const index = this.getCardIndex();
        return deck[index] || null;
    }

    // Reset state for new lesson
    resetForNewLesson() {
        this.setCardIndex(0);
        this.setCurrentDeck([]);
    }

    // Clear all state
    reset() {
        this.state = {
            manifest: {},
            currentLanguage: null,
            currentCategory: null,
            currentCategoryLessons: [],
            currentLesson: null,
            currentDeck: [],
            cardIndex: 0,
            isLearnMode: true,
            colorPalette: this.state.colorPalette // Keep color palette
        };
        // Notify all listeners of reset
        Object.keys(this.state).forEach(key => {
            this.notify(key, this.state[key]);
        });
    }
}

export default State;
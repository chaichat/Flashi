import DOMHelpers from '../utils/DOMHelpers.js';
import { ELEMENT_IDS, SWIPE_CONFIG, CARD_CLASSES, UI_TEXT } from '../utils/Constants.js';

class FlashcardDeck {
    constructor(state, dataService, speechService, router) {
        this.state = state;
        this.dataService = dataService;
        this.speechService = speechService;
        this.router = router;
        this.element = DOMHelpers.getElementById(ELEMENT_IDS.FLASHCARD_CONTAINER);
        this.deckElement = DOMHelpers.getElementById(ELEMENT_IDS.DECK);
        this.titleElement = DOMHelpers.getElementById(ELEMENT_IDS.SECTION_TITLE);
        this.setupEventListeners();
        this.setupModeControls();
    }

    async show(lessonInfo) {
        this.hideOtherScreens();
        
        const lessonData = await this.dataService.loadLesson(lessonInfo.file);
        this.state.setCurrentDeck(lessonData);
        this.state.resetCardIndex();
        
        if (this.titleElement) {
            const displayName = lessonInfo.name_th || lessonInfo.name;
            DOMHelpers.setText(this.titleElement, displayName);
        }
        
        DOMHelpers.show(this.element);
        this.renderDeck();
    }

    hide() {
        DOMHelpers.hide(this.element);
    }

    hideOtherScreens() {
        DOMHelpers.hide(DOMHelpers.getElementById(ELEMENT_IDS.LANGUAGE_SELECTOR));
        DOMHelpers.hide(DOMHelpers.getElementById(ELEMENT_IDS.CATEGORY_SELECTOR));
        DOMHelpers.hide(DOMHelpers.getElementById(ELEMENT_IDS.LESSON_SELECTOR));
    }

    setupEventListeners() {
        const backBtn = DOMHelpers.getElementById(ELEMENT_IDS.BACK_TO_LESSONS);
        const revealBtn = DOMHelpers.getElementById(ELEMENT_IDS.REVEAL_BTN);

        if (backBtn) {
            DOMHelpers.addEventListener(backBtn, 'click', () => {
                this.router.navigateToLessons();
            });
        }

        if (revealBtn) {
            DOMHelpers.addEventListener(revealBtn, 'click', () => {
                this.handleReveal();
            });
        }
    }

    setupModeControls() {
        const learnModeBtn = DOMHelpers.getElementById(ELEMENT_IDS.LEARN_MODE_BTN);
        const testModeBtn = DOMHelpers.getElementById(ELEMENT_IDS.TEST_MODE_BTN);
        const testModeControls = DOMHelpers.getElementById(ELEMENT_IDS.TEST_MODE_CONTROLS);

        if (learnModeBtn) {
            DOMHelpers.addEventListener(learnModeBtn, 'click', () => {
                this.switchMode(true);
            });
        }

        if (testModeBtn) {
            DOMHelpers.addEventListener(testModeBtn, 'click', () => {
                this.switchMode(false);
            });
        }

        // Subscribe to mode changes
        this.state.subscribe('isLearnMode', (isLearnMode) => {
            this.updateModeButtons(isLearnMode);
            if (testModeControls) {
                DOMHelpers.toggle(testModeControls, !isLearnMode);
            }
        });
    }

    switchMode(isLearnMode) {
        this.state.setLearnMode(isLearnMode);
        
        // Update deck aspect ratio
        if (this.deckElement) {
            if (isLearnMode) {
                DOMHelpers.removeClass(this.deckElement, 'aspect-[5/6]');
                DOMHelpers.addClass(this.deckElement, 'aspect-[3/4]');
            } else {
                DOMHelpers.removeClass(this.deckElement, 'aspect-[3/4]');
                DOMHelpers.addClass(this.deckElement, 'aspect-[5/6]');
            }
        }

        // Restart current lesson with new mode
        const currentLesson = this.state.getCurrentLesson();
        if (currentLesson) {
            this.show(currentLesson);
        }
    }

    updateModeButtons(isLearnMode) {
        const learnModeBtn = DOMHelpers.getElementById(ELEMENT_IDS.LEARN_MODE_BTN);
        const testModeBtn = DOMHelpers.getElementById(ELEMENT_IDS.TEST_MODE_BTN);

        if (learnModeBtn) {
            DOMHelpers.setText(learnModeBtn, UI_TEXT.THAI.LEARN);
            DOMHelpers.toggleClass(learnModeBtn, 'bg-blue-500', isLearnMode);
            DOMHelpers.toggleClass(learnModeBtn, 'text-white', isLearnMode);
            DOMHelpers.toggleClass(learnModeBtn, 'bg-gray-200', !isLearnMode);
            DOMHelpers.toggleClass(learnModeBtn, 'text-gray-700', !isLearnMode);
        }

        if (testModeBtn) {
            DOMHelpers.setText(testModeBtn, UI_TEXT.THAI.TEST);
            DOMHelpers.toggleClass(testModeBtn, 'bg-blue-500', !isLearnMode);
            DOMHelpers.toggleClass(testModeBtn, 'text-white', !isLearnMode);
            DOMHelpers.toggleClass(testModeBtn, 'bg-gray-200', isLearnMode);
            DOMHelpers.toggleClass(testModeBtn, 'text-gray-700', isLearnMode);
        }
    }

    renderDeck() {
        if (!this.deckElement) return;

        DOMHelpers.clearContent(this.deckElement);
        
        const deck = this.state.getCurrentDeck();
        const cardIndex = this.state.getCardIndex();

        if (cardIndex >= deck.length) {
            this.showCompletionScreen();
            return;
        }

        const cardsToRender = deck.slice(cardIndex, cardIndex + 3);
        cardsToRender.forEach((cardData, index) => {
            const cardEl = this.createCardElement(cardData, cardIndex + index);
            this.deckElement.appendChild(cardEl);
        });
    }

    createCardElement(cardData, index) {
        const card = DOMHelpers.createElement('div', CARD_CLASSES.CARD);
        const colorPalette = this.state.getColorPalette();
        const deck = this.state.getCurrentDeck();
        
        card.style.zIndex = deck.length - index;

        const cardInner = DOMHelpers.createElement('div', CARD_CLASSES.CARD_INNER);
        const bgColor = colorPalette[index % colorPalette.length];
        
        const currentLanguage = this.state.getCurrentLanguage();
        const isLearnMode = this.state.isInLearnMode();
        
        const targetLang = currentLanguage === 'english' ? cardData.english : cardData.chinese;
        const phonetic = currentLanguage === 'english' ? cardData.phonetic : cardData.pinyin;
        const phoneticHTML = phonetic && phonetic.trim() ? `<p class="text-xl text-gray-500 mt-2">[${phonetic}]</p>` : '';

        let topHalfHTML, bottomHalfHTML;

        if (isLearnMode) {
            DOMHelpers.addClass(cardInner, CARD_CLASSES.LEARN_MODE_CARD.split(' ')[0]);
            topHalfHTML = `
                <div class="${CARD_CLASSES.TOP_HALF} ${bgColor}">
                    <div class="flex flex-col items-center">
                        <h3 class="text-5xl font-bold text-gray-800/80 pointer-events-none">${targetLang}</h3>
                        ${phoneticHTML}
                    </div>
                </div>
            `;
            bottomHalfHTML = `
                <div class="${CARD_CLASSES.BOTTOM_HALF}">
                     <h4 class="text-3xl font-semibold text-blue-600">${cardData.thai}</h4>
                     <span class="mt-4 text-3xl">🔊</span>
                </div>
            `;
        } else {
            topHalfHTML = `
                <div class="${CARD_CLASSES.TOP_HALF} ${bgColor} hidden">
                    <div class="flex flex-col items-center">
                        <h3 class="text-5xl font-bold text-gray-800/80 pointer-events-none">${targetLang}</h3>
                        ${phoneticHTML}
                    </div>
                </div>
            `;
            bottomHalfHTML = `
                 <div class="bottom-half w-full h-full flex flex-col justify-center items-center p-6">
                    <p class="text-5xl text-blue-600 font-bold">${cardData.thai}</p>
                    <div class="${CARD_CLASSES.REVEAL_CONTENT}">
                        <span class="text-xl text-gray-500 mt-2">Tap to see answer</span>
                    </div>
                </div>
            `;
        }

        cardInner.innerHTML = topHalfHTML + bottomHalfHTML;
        card.appendChild(cardInner);
        
        this.addSwipeListeners(card, cardData);

        return card;
    }

    addSwipeListeners(card, cardData) {
        let startX = 0, isDragging = false, startTime = 0;

        const onPointerDown = (e) => {
            isDragging = true;
            // Android fix: Better touch coordinate handling
            if (e.touches && e.touches.length > 0) {
                startX = e.touches[0].clientX;
            } else if (e.clientX !== undefined) {
                startX = e.clientX;
            } else {
                startX = 0;
            }
            startTime = Date.now();
            DOMHelpers.addClass(card, CARD_CLASSES.DRAGGING);
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            // Android fix: Better touch coordinate handling
            let currentX;
            if (e.touches && e.touches.length > 0) {
                currentX = e.touches[0].clientX;
            } else if (e.clientX !== undefined) {
                currentX = e.clientX;
            } else {
                return;
            }
            const diffX = currentX - startX;
            DOMHelpers.setStyles(card, {
                transform: `translateX(${diffX}px) rotate(${diffX / 20}deg) translateZ(0)`
            });
            e.preventDefault();
        };

        const onPointerUp = (e) => {
            if (!isDragging) return;
            isDragging = false;
            DOMHelpers.removeClass(card, CARD_CLASSES.DRAGGING);

            // Android fix: Better touch coordinate handling for end event
            let endX;
            if (e.changedTouches && e.changedTouches.length > 0) {
                endX = e.changedTouches[0].clientX;
            } else if (e.clientX !== undefined) {
                endX = e.clientX;
            } else {
                endX = startX; // Fallback to prevent NaN
            }

            const diffX = endX - startX;
            const timeElapsed = Date.now() - startTime;
            const velocity = Math.abs(diffX) / timeElapsed;

            const isLearnMode = this.state.isInLearnMode();

            // Handle tap for speech in learn mode - Android fix: More lenient tap detection
            if (isLearnMode && Math.abs(diffX) < 15 && timeElapsed < 300) {
                console.log('Attempting speech for:', cardData.english || cardData.chinese);
                this.speechService.speakCard(cardData, this.state.getCurrentLanguage());
                DOMHelpers.setStyles(card, { transform: '' });
                return;
            }

            // Handle swipe
            if (Math.abs(diffX) > SWIPE_CONFIG.MIN_DISTANCE || velocity > SWIPE_CONFIG.MIN_VELOCITY) {
                let shouldAnimate = false;
                
                if (diffX < 0) {
                    // Swipe left - check if we can go to next card
                    const currentIndex = this.state.getCardIndex();
                    const deck = this.state.getCurrentDeck();
                    shouldAnimate = currentIndex < deck.length - 1;
                } else {
                    // Swipe right - check if we can go to previous card
                    const currentIndex = this.state.getCardIndex();
                    shouldAnimate = currentIndex > 0;
                }
                
                if (shouldAnimate) {
                    const direction = diffX > 0 ? 500 : -500;
                    const rotation = diffX > 0 ? 30 : -30;
                    DOMHelpers.setStyles(card, {
                        transform: `translateX(${direction}px) rotate(${rotation}deg) translateZ(0)`
                    });
                    
                    setTimeout(() => {
                        if (diffX < 0) {
                            // Swipe left - go to next card
                            this.nextCard();
                        } else {
                            // Swipe right - go to previous card
                            this.previousCard();
                        }
                    }, SWIPE_CONFIG.ANIMATION_DURATION);
                } else {
                    // Can't navigate in that direction, snap back
                    DOMHelpers.setStyles(card, { transform: '' });
                }
            } else {
                DOMHelpers.setStyles(card, { transform: '' });
            }
        };

        DOMHelpers.addEventListener(card, 'mousedown', onPointerDown);
        DOMHelpers.addEventListener(card, 'mousemove', onPointerMove);
        DOMHelpers.addEventListener(card, 'mouseup', onPointerUp);
        DOMHelpers.addEventListener(card, 'mouseleave', onPointerUp);
        
        DOMHelpers.addEventListener(card, 'touchstart', onPointerDown, { passive: true });
        DOMHelpers.addEventListener(card, 'touchmove', onPointerMove, { passive: false });
        DOMHelpers.addEventListener(card, 'touchend', onPointerUp);
    }

    handleReveal() {
        const deck = this.state.getCurrentDeck();
        const cardIndex = this.state.getCardIndex();
        
        if (cardIndex >= deck.length) return;
        
        const topCard = this.deckElement?.querySelector('.card');
        if (!topCard) return;

        const revealContent = topCard.querySelector('.reveal-content');
        const topHalf = topCard.querySelector('.top-half');
        const bottomHalf = topCard.querySelector('.bottom-half');
        const cardData = deck[cardIndex];
        
        if (revealContent?.style.opacity === '1') {
            this.speechService.speakCard(cardData, this.state.getCurrentLanguage());
        } else {
            if (topHalf) DOMHelpers.removeClass(topHalf, 'hidden');
            if (bottomHalf) {
                DOMHelpers.removeClass(bottomHalf, 'h-full');
                DOMHelpers.addClass(bottomHalf, 'h-1/2');
            }
            if (revealContent) revealContent.style.opacity = '1';
            this.speechService.speakCard(cardData, this.state.getCurrentLanguage());
        }
    }

    nextCard() {
        if (this.state.nextCard()) {
            this.renderDeck();
        } else {
            this.showCompletionScreen();
        }
    }

    previousCard() {
        if (this.state.previousCard()) {
            this.renderDeck();
        }
    }

    showCompletionScreen() {
        if (!this.deckElement) return;

        const completionHTML = `
            <div class="w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-lg p-4">
                <h3 class="text-2xl font-bold text-gray-700 mb-2">${UI_TEXT.THAI.EXCELLENT}</h3>
                <p class="text-gray-600 mb-4">${UI_TEXT.THAI.LESSON_COMPLETE}</p>
                <button id="${ELEMENT_IDS.RESTART_SECTION}" class="px-6 py-2 bg-blue-500 text-white font-semibold rounded-full">${UI_TEXT.THAI.RESTART}</button>
            </div>
        `;

        DOMHelpers.setContent(this.deckElement, completionHTML);
        
        const restartBtn = DOMHelpers.getElementById(ELEMENT_IDS.RESTART_SECTION);
        if (restartBtn) {
            DOMHelpers.addEventListener(restartBtn, 'click', () => {
                const currentLesson = this.state.getCurrentLesson();
                if (currentLesson) {
                    this.show(currentLesson);
                }
            });
        }
    }
}

export default FlashcardDeck;
document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    let allData = {};
    let currentLanguage = localStorage.getItem('flashi_language') || null;
    let currentSections = {};
    let currentSection = null;
    let currentDeck = [];
    let cardIndex = 0;
    let isLearnMode = true;
    const synth = window.speechSynthesis;
    const colorPalette = [
        'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-red-200', 'bg-purple-200', 'bg-pink-200', 'bg-indigo-200'
    ];

    // --- DOM ELEMENTS ---
    const appContainer = document.getElementById('app-container');
    const languageSelector = document.getElementById('language-selector');
    const sectionSelector = document.getElementById('section-selector');
    const flashcardContainer = document.getElementById('flashcard-container');
    const sectionGrid = document.getElementById('section-grid');
    const sectionTitle = document.getElementById('section-title');
    const deck = document.getElementById('deck');
    const learnModeBtn = document.getElementById('learn-mode-btn');
    const testModeBtn = document.getElementById('test-mode-btn');
    const testModeControls = document.getElementById('test-mode-controls');
    const revealBtn = document.getElementById('reveal-btn');
    const backToSectionsBtn = document.getElementById('back-to-sections');
    const changeLangBtn = document.getElementById('change-language');

    // --- FUNCTIONS ---

    /**
     * Fetches the lesson data from the JSON file.
     */
    async function loadData() {
        try {
            const response = await fetch('data/lessons.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allData = await response.json();
            initializeApp();
        } catch (error) {
            console.error("Failed to load lesson data:", error);
            appContainer.innerHTML = '<p class="text-red-500 text-center">Failed to load lessons. Please try refreshing the page.</p>';
        }
    }

    /**
     * Initializes the application.
     */
    function initializeApp() {
        if (currentLanguage && allData[currentLanguage]) {
            showSectionSelector();
        } else {
            showLanguageSelector();
        }
    }

    /**
     * Shows the language selection screen.
     */
    function showLanguageSelector() {
        languageSelector.classList.remove('hidden');
        sectionSelector.classList.add('hidden');
        flashcardContainer.classList.add('hidden');

        document.getElementById('select-english').addEventListener('click', () => selectLanguage('english'));
        document.getElementById('select-chinese').addEventListener('click', () => selectLanguage('chinese'));
    }

    /**
     * Sets the current language and shows the section selector.
     */
    function selectLanguage(language) {
        currentLanguage = language;
        localStorage.setItem('flashi_language', language);
        showSectionSelector();
    }
    
    /**
     * Shows the section selection screen for the current language.
     */
    function showSectionSelector() {
        currentSections = allData[currentLanguage];
        languageSelector.classList.add('hidden');
        flashcardContainer.classList.add('hidden');
        sectionSelector.classList.remove('hidden');
        document.getElementById('language-title').textContent = `เรียน${currentLanguage === 'english' ? 'ภาษาอังกฤษ' : 'ภาษาจีน'}`;
        initSectionGrid();
    }

    /**
     * Creates the HTML for a single flashcard.
     */
    function createCardElement(cardData, index) {
        const card = document.createElement('div');
        card.className = 'card shadow-lg';
        card.style.zIndex = currentDeck.length - index;

        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner bg-white';
        
        const bgColor = colorPalette[index % colorPalette.length];
        
        const targetLang = currentLanguage === 'english' ? cardData.english : cardData.chinese;
        const phonetic = currentLanguage === 'english' ? cardData.phonetic : cardData.pinyin;

        let topHalfHTML, bottomHalfHTML;

        if (isLearnMode) {
            cardInner.classList.add('learn-mode-card');
            topHalfHTML = `
                <div class="top-half w-full h-1/2 flex justify-center items-center ${bgColor}">
                    <h3 class="text-5xl font-bold text-gray-800/80 pointer-events-none">${targetLang}</h3>
                </div>
            `;
            bottomHalfHTML = `
                <div class="bottom-half w-full h-1/2 flex flex-col justify-center items-center p-6 pointer-events-none">
                     <h4 class="text-3xl font-semibold text-blue-600">${cardData.thai}</h4>
                     <p class="text-xl text-gray-500 mt-2">[${phonetic}]</p>
                     <span class="mt-4 text-3xl">🔊</span>
                </div>
            `;
        } else { // Test Mode
            topHalfHTML = `
                <div class="top-half w-full h-1/2 flex justify-center items-center ${bgColor} hidden">
                    <h3 class="text-5xl font-bold text-gray-800/80 pointer-events-none">${targetLang}</h3>
                </div>
            `;
            bottomHalfHTML = `
                 <div class="bottom-half w-full h-full flex flex-col justify-center items-center p-6">
                    <p class="text-5xl text-blue-600 font-bold">${cardData.thai}</p>
                    <div class="reveal-content mt-4 opacity-0 transition-opacity duration-300">
                        <p class="text-2xl text-gray-500 mt-2">[${phonetic}]</p>
                    </div>
                </div>
            `;
        }

        cardInner.innerHTML = topHalfHTML + bottomHalfHTML;
        card.appendChild(cardInner);
        
        addUnifiedInputListeners(card, cardData);

        return card;
    }

    /**
     * Renders the current deck of cards to the screen.
     */
    function renderDeck() {
        deck.innerHTML = '';
        if (cardIndex >= currentDeck.length) {
            showCompletionScreen();
            return;
        }
        currentDeck.slice(cardIndex).forEach((cardData, index) => {
            const cardEl = createCardElement(cardData, cardIndex + index);
            deck.appendChild(cardEl);
        });
    }
    
    /**
     * Shows the completion screen when a deck is finished.
     */
    function showCompletionScreen() {
        deck.innerHTML = `
            <div class="w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-lg p-4">
                <h3 class="text-2xl font-bold text-gray-700 mb-2">ยอดเยี่ยม!</h3>
                <p class="text-gray-600 mb-4">คุณเรียนรู้ครบทุกคำในบทนี้แล้ว</p>
                <button id="restart-section" class="px-6 py-2 bg-blue-500 text-white font-semibold rounded-full">เริ่มใหม่</button>
            </div>
        `;
        document.getElementById('restart-section').addEventListener('click', () => {
            startSection(currentSection);
        });
    }

    /**
     * Adds unified event listeners to a card to handle both tap and swipe.
     */
    function addUnifiedInputListeners(card, cardData) {
        let startX = 0, isDragging = false, startTime = 0;

        function onPointerDown(e) {
            isDragging = true;
            startX = e.clientX || e.touches[0].clientX;
            startTime = Date.now();
            card.classList.add('dragging');
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            const currentX = e.clientX || e.touches[0].clientX;
            const diffX = currentX - startX;
            card.style.transform = `translateX(${diffX}px) rotate(${diffX / 20}deg) translateZ(0)`;
            e.preventDefault(); // Prevent default scrolling
        }

        function onPointerUp(e) {
            if (!isDragging) return;
            isDragging = false;
            card.classList.remove('dragging');

            const diffX = (e.clientX || e.changedTouches[0].clientX) - startX;
            const timeElapsed = Date.now() - startTime;
            const velocity = Math.abs(diffX) / timeElapsed;

            // Define swipe thresholds
            const minSwipeDistance = 50; // pixels
            const minSwipeVelocity = 0.2; // pixels per millisecond

            if (isLearnMode && Math.abs(diffX) < 10 && timeElapsed < 200) {
                speak(currentLanguage === 'english' ? cardData.english : cardData.chinese);
                card.style.transform = '';
                return;
            }

            // Check for a swipe based on distance OR velocity
            if (Math.abs(diffX) > minSwipeDistance || velocity > minSwipeVelocity) {
                card.style.transform = `translateX(${diffX > 0 ? 500 : -500}px) rotate(${diffX > 0 ? 30 : -30}deg) translateZ(0)`;
                setTimeout(() => {
                    cardIndex++;
                    renderDeck();
                }, 300);
            } else { 
                card.style.transform = '';
            }
        }
        
        card.addEventListener('mousedown', onPointerDown);
        card.addEventListener('mousemove', onPointerMove);
        card.addEventListener('mouseup', onPointerUp);
        card.addEventListener('mouseleave', onPointerUp);
        
        card.addEventListener('touchstart', onPointerDown, { passive: true });
        card.addEventListener('touchmove', onPointerMove, { passive: true });
        card.addEventListener('touchend', onPointerUp);
    }

    /**
     * Switches the app mode between Learn and Test.
     */
    function switchMode(toLearnMode) {
        isLearnMode = toLearnMode;

        // Adjust deck aspect ratio for different modes to fit controls on screen
        if (toLearnMode) {
            // Restore original aspect ratio for Learn Mode
            deck.classList.remove('aspect-[5/6]');
            deck.classList.add('aspect-[3/4]');
        } else {
            // Make card shorter for Test Mode
            deck.classList.remove('aspect-[3/4]');
            deck.classList.add('aspect-[5/6]');
        }

        learnModeBtn.classList.toggle('bg-blue-500', isLearnMode);
        learnModeBtn.classList.toggle('text-white', isLearnMode);
        learnModeBtn.classList.toggle('bg-gray-200', !isLearnMode);
        learnModeBtn.classList.toggle('text-gray-700', !isLearnMode);
        
        testModeBtn.classList.toggle('bg-blue-500', !isLearnMode);
        testModeBtn.classList.toggle('text-white', !isLearnMode);
        testModeBtn.classList.toggle('bg-gray-200', isLearnMode);
        testModeBtn.classList.toggle('text-gray-700', isLearnMode);

        testModeControls.classList.toggle('hidden', isLearnMode);
        
        startSection(currentSection);
    }

    /**
     * Uses the Web Speech API to say a word.
     */
    function speak(text) {
        if (synth.speaking) synth.cancel();
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.lang = currentLanguage === 'english' ? 'en-US' : 'zh-CN';
        utterThis.pitch = 1;
        utterThis.rate = 0.9;
        synth.speak(utterThis);
    }
    
    /**
     * Starts a flashcard section.
     */
    function startSection(sectionName) {
        currentSection = sectionName;
        currentDeck = sectionName.includes("Review") 
            ? generateReviewDeck(sectionName) 
            : currentSections[sectionName];
        cardIndex = 0;
        
        sectionTitle.textContent = sectionName;
        sectionSelector.classList.add('hidden');
        flashcardContainer.classList.remove('hidden');
        
        renderDeck();
    }

    /**
     * Generates a shuffled deck for review tests.
     */
    function generateReviewDeck(reviewName) {
        // This is a placeholder. You'll need to define which sections go into which review.
        const reviewMap = {
            "Business Review (1-5)": ["Business 1: The Office", "Business 2: Money & Finance", "Business 3: Marketing & Sales", "Business 4: Jobs & Roles", "Business 5: Company & Growth"]
        };

        const sectionNames = reviewMap[reviewName] || [];
        let combinedDeck = sectionNames.flatMap(name => currentSections[name] || []);

        // Fisher-Yates shuffle
        for (let i = combinedDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combinedDeck[i], combinedDeck[j]] = [combinedDeck[j], combinedDeck[i]];
        }

        return combinedDeck.slice(0, 20);
    }

    /**
     * Initializes the section selection grid.
     */
    function initSectionGrid() {
        sectionGrid.innerHTML = '';
        const sectionNames = Object.keys(currentSections);

        sectionNames.forEach(sectionName => {
            const button = document.createElement('button');
            button.className = "p-4 bg-white border-2 border-gray-200 rounded-xl text-center shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200";
            button.innerHTML = `
                <div class="text-3xl mb-2">📚</div>
                <div class="font-semibold text-gray-700">${sectionName}</div>
                <div class="text-sm text-gray-500">${currentSections[sectionName].length} words</div>
            `;
            button.addEventListener('click', () => startSection(sectionName));
            sectionGrid.appendChild(button);
        });

        // Example of adding a review test button
        if (sectionNames.length >= 5) { // Only show review if there are enough sections
            const reviewButton = document.createElement('button');
            reviewButton.className = "p-4 bg-yellow-100 border-2 border-yellow-300 rounded-xl text-center shadow-sm hover:shadow-md hover:border-yellow-500 transition-all duration-200";
            reviewButton.innerHTML = `
                <div class="text-3xl mb-2">⭐</div>
                <div class="font-semibold text-gray-700">Business Review (1-5)</div>
                <div class="text-sm text-gray-500">Test - 20 words</div>
            `;
            reviewButton.addEventListener('click', () => startSection("Business Review (1-5)"));
            sectionGrid.appendChild(reviewButton);
        }
    }

    // --- EVENT LISTENERS ---
    learnModeBtn.addEventListener('click', () => switchMode(true));
    testModeBtn.addEventListener('click', () => switchMode(false));
    backToSectionsBtn.addEventListener('click', showSectionSelector);
    changeLangBtn.addEventListener('click', showLanguageSelector);

    revealBtn.addEventListener('click', () => {
        if (cardIndex >= currentDeck.length) return;
        
        const topCard = deck.querySelector('.card');
        if (!topCard) return;

        const revealContent = topCard.querySelector('.reveal-content');
        const topHalf = topCard.querySelector('.top-half');
        const bottomHalf = topCard.querySelector('.bottom-half');
        const cardData = currentDeck[cardIndex];
        
        if (revealContent.style.opacity === '1') {
            speak(currentLanguage === 'english' ? cardData.english : cardData.chinese);
        } else {
            topHalf.classList.remove('hidden');
            bottomHalf.classList.replace('h-full', 'h-1/2');
            revealContent.style.opacity = '1';
            speak(currentLanguage === 'english' ? cardData.english : cardData.chinese);
        }
    });

    // --- INITIALIZATION ---
    loadData();
});

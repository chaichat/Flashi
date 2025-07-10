document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    let allData = {};
    let currentLanguage = localStorage.getItem('flashi_language') || null;
    let currentCategory = null; // New state variable for selected category
    let currentLessons = {}; // Renamed from currentSections
    let currentLesson = null; // Renamed from currentSection
    let currentDeck = [];
    let cardIndex = 0;
    let isLearnMode = true;
    const synth = window.speechSynthesis;
    let voices = [];

    // This function populates the `voices` array. It's called both
    // immediately and whenever the voice list changes.
    function populateVoiceList() {
        voices = synth.getVoices();
        console.log("Available voices: ", voices);
    }
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    const colorPalette = [
        'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-red-200', 'bg-purple-200', 'bg-pink-200', 'bg-indigo-200'
    ];

    // --- DOM ELEMENTS ---
    const appContainer = document.getElementById('app-container');
    const languageSelector = document.getElementById('language-selector');
    const categorySelector = document.getElementById('category-selector'); // New element
    const categoryGrid = document.getElementById('category-grid'); // New element
    const categoryLanguageTitle = document.getElementById('category-language-title'); // New element
    const changeLanguageFromCategoryBtn = document.getElementById('change-language-from-category'); // New element

    const lessonSelector = document.getElementById('lesson-selector'); // Renamed from sectionSelector
    const lessonGrid = document.getElementById('lesson-grid'); // Renamed from sectionGrid
    const lessonCategoryTitle = document.getElementById('lesson-category-title'); // Renamed from sectionTitle
    const backToLessonsBtn = document.getElementById('back-to-lessons'); // Renamed from backToSectionsBtn
    const backToCategoriesBtn = document.getElementById('back-to-categories');
    const changeLanguageFromLessonBtn = document.getElementById('change-language-from-lesson'); // Renamed from changeLangBtn

    const flashcardContainer = document.getElementById('flashcard-container');
    const sectionTitle = document.getElementById('section-title'); // This is the title on the flashcard screen
    const deck = document.getElementById('deck');
    const learnModeBtn = document.getElementById('learn-mode-btn');
    const testModeBtn = document.getElementById('test-mode-btn');
    const testModeControls = document.getElementById('test-mode-controls');
    const revealBtn = document.getElementById('reveal-btn');

    // --- HELPER FUNCTIONS ---

    /**
     * Gets the text and language code for the current card based on the selected language.
     * @param {object} cardData The data for the current flashcard.
     * @returns {{text: string, lang: string}}
     */
    function getSpeechParametersForCard(cardData) {
        return currentLanguage === 'english'
            ? { text: cardData.english, lang: 'en-US' }
            : { text: cardData.chinese, lang: 'zh-CN' };
    }

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
            showCategorySelector();
        } else {
            showLanguageSelector();
        }
    }

    /**
     * Shows the language selection screen.
     */
    function showLanguageSelector() {
        languageSelector.classList.remove('hidden');
        categorySelector.classList.add('hidden');
        lessonSelector.classList.add('hidden');
        flashcardContainer.classList.add('hidden');

        document.getElementById('select-english').addEventListener('click', () => selectLanguage('english'));
        document.getElementById('select-chinese').addEventListener('click', () => selectLanguage('chinese'));
    }

    /**
     * Sets the current language and shows the category selector.
     */
    function selectLanguage(language) {
        currentLanguage = language;
        localStorage.setItem('flashi_language', language);
        // "Warm up" the speech synthesis engine on a user gesture, which is required by some browsers (e.g., mobile Safari).
        if (synth && !synth.speaking) {
            const warmUpUtterance = new SpeechSynthesisUtterance('');
            synth.speak(warmUpUtterance);
        }
        showCategorySelector();
    }
    
    /**
     * Shows the category selection screen for the current language.
     */
    function showCategorySelector() {
        if (!currentLanguage || !allData[currentLanguage]) {
            showLanguageSelector(); // Fallback if no language selected or data missing
            return;
        }
        languageSelector.classList.add('hidden');
        lessonSelector.classList.add('hidden');
        flashcardContainer.classList.add('hidden');
        categorySelector.classList.remove('hidden');
        categoryLanguageTitle.textContent = `เรียน${currentLanguage === 'english' ? 'ภาษาอังกฤษ' : 'ภาษาจีน'}`;
        initCategoryGrid();
    }

    /**
     * Initializes the category selection grid.
     */
    function initCategoryGrid() {
        categoryGrid.innerHTML = '';
        const categoryNames = Object.keys(allData[currentLanguage]);

        categoryNames.forEach(categoryName => {
            const button = document.createElement('button');
            button.className = "p-4 bg-white border-2 border-gray-200 rounded-xl text-center shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200";
            button.innerHTML = `
                <div class="text-3xl mb-2">📁</div>
                <div class="font-semibold text-gray-700">${categoryName}</div>
            `;
            button.addEventListener('click', () => showLessonSelector(categoryName));
            categoryGrid.appendChild(button);
        });
    }

    /**
     * Shows the lesson selection screen for the current category.
     */
    function showLessonSelector(categoryName) {
        currentCategory = categoryName;
        currentLessons = allData[currentLanguage][currentCategory];
        categorySelector.classList.add('hidden');
        flashcardContainer.classList.add('hidden');
        lessonSelector.classList.remove('hidden');
        lessonCategoryTitle.textContent = currentCategory;
        initLessonGrid();
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
        const phoneticHTML = phonetic ? `<p class="text-xl text-gray-500 mt-2">[${phonetic}]</p>` : '';

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
                     ${phoneticHTML}
                     <span class="mt-4 text-3xl">🔊</span>
                </div>
            `;
        } else { // Test Mode
            const testPhoneticHTML = phonetic ? `<p class="text-2xl text-gray-500 mt-2">[${phonetic}]</p>` : '';
            topHalfHTML = `
                <div class="top-half w-full h-1/2 flex justify-center items-center ${bgColor} hidden">
                    <h3 class="text-5xl font-bold text-gray-800/80 pointer-events-none">${targetLang}</h3>
                </div>
            `;
            bottomHalfHTML = `
                 <div class="bottom-half w-full h-full flex flex-col justify-center items-center p-6">
                    <p class="text-5xl text-blue-600 font-bold">${cardData.thai}</p>
                    <div class="reveal-content mt-4 opacity-0 transition-opacity duration-300">
                        ${testPhoneticHTML}
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
        
        // Render only a few cards at a time for performance
        const cardsToRender = currentDeck.slice(cardIndex, cardIndex + 3); // Render current + next 2 cards
        cardsToRender.forEach((cardData, index) => {
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
            startLesson(currentLesson);
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
            const minSwipeDistance = 75; // pixels
            const minSwipeVelocity = 0.3; // pixels per millisecond

            if (isLearnMode && Math.abs(diffX) < 10 && timeElapsed < 200) {
                const { text, lang } = getSpeechParametersForCard(cardData);
                speak(text, lang);
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
        card.addEventListener('touchmove', onPointerMove, { passive: false });
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
        
        startLesson(currentLesson);
    }

    /**
     * Uses the Web Speech API to say a word.
     */
    function speak(text, lang) {
        // If the synth is already speaking, cancel it to avoid overlap.
        if (synth.speaking) {
            console.warn('SpeechSynthesis is already speaking. Cancelling previous utterance.');
            synth.cancel();
        }

        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.lang = lang;
        utterThis.pitch = 1;
        utterThis.rate = 0.9;

        let voice = null;

        // iOS-specific voice selection with fallbacks, as per your requirements.
        if (lang.startsWith('en')) {
            // For English, prioritize 'Samantha' (high-quality iOS voice).
            voice = voices.find(v => v.name === 'Samantha' && v.lang.startsWith('en'));
            // Fallback to a high-quality Google voice.
            if (!voice) {
                voice = voices.find(v => v.name === 'Google US English' && v.lang.startsWith('en'));
            }
        } else if (lang.startsWith('zh')) {
            // For Chinese, prioritize 'Ting-Ting' (common iOS voice).
            voice = voices.find(v => v.name === 'Ting-Ting' && v.lang.startsWith('zh'));
        }

        // Generic fallback: Find the first available voice for the exact language code.
        if (!voice) {
            voice = voices.find(v => v.lang === lang);
        }

        // Broader fallback: Find a voice that starts with the language code (e.g., 'en' for 'en-GB').
        if (!voice) {
            const langPrefix = lang.split('-')[0];
            voice = voices.find(v => v.lang.startsWith(langPrefix));
        }

        if (voice) {
            utterThis.voice = voice;
            console.log(`Using voice: ${voice.name} (${voice.lang})`);
        } else {
            console.warn(`Voice for lang '${lang}' not found. Using default.`);
        }

        synth.speak(utterThis);
    }
    
    /**
     * Starts a flashcard lesson.
     */
    function startLesson(lessonName) {
        currentLesson = lessonName;
        currentDeck = lessonName.includes("Review") 
            ? generateReviewDeck(lessonName) 
            : currentLessons[lessonName];
        cardIndex = 0;
        
        sectionTitle.textContent = currentLesson;
        lessonSelector.classList.add('hidden');
        flashcardContainer.classList.remove('hidden');
        
        renderDeck();
    }

    /**
     * Generates a shuffled deck for review tests.
     */
    function generateReviewDeck(reviewName) {
        let combinedDeck = [];

        // Special case for old "Business" review format which has unique lesson names
        if (reviewName === "Business Review (1-5)") {
            const lessonNames = ["Business 1: The Office", "Business 2: Money & Finance", "Business 3: Marketing & Sales", "Business 4: Jobs & Roles", "Business 5: Company & Growth"];
            combinedDeck = lessonNames.flatMap(name => allData[currentLanguage]["Business"][name] || []);
        } else {
            // Dynamic generation for reviews like "Category Review (X-Y)"
            const match = reviewName.match(/(.+) Review \((\d+)-(\d+)\)/);

            if (match) {
                const category = match[1].trim();
                const start = parseInt(match[2], 10);
                const end = parseInt(match[3], 10);

                // Find the correct category key in the data, which might differ from the review name's casing
                const categoryKey = Object.keys(allData[currentLanguage]).find(k => k.toLowerCase() === category.toLowerCase());

                if (categoryKey) {
                    for (let i = start; i <= end; i++) {
                        const lessonName = `${categoryKey}: Lesson ${i}`;
                        const lessonCards = allData[currentLanguage][categoryKey][lessonName];
                        if (lessonCards) {
                            combinedDeck.push(...lessonCards);
                        }
                    }
                }
            }
        }

        // Fisher-Yates shuffle
        for (let i = combinedDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combinedDeck[i], combinedDeck[j]] = [combinedDeck[j], combinedDeck[i]];
        }

        return combinedDeck.slice(0, 20);
    }

    /**
     * Dynamically adds review buttons for categories with enough lessons.
     */
    function addReviewButtons(categoryName, totalLessons) {
        for (let i = 1; i <= totalLessons; i += 5) {
            const endLesson = i + 4;
            // Only create a review button if a full block of 5 lessons exists
            if (endLesson > totalLessons) {
                continue;
            }

            const reviewName = `${categoryName} Review (${i}-${endLesson})`;
            const reviewButton = document.createElement('button');
            reviewButton.className = "p-4 bg-yellow-100 border-2 border-yellow-300 rounded-xl text-center shadow-sm hover:shadow-md hover:border-yellow-500 transition-all duration-200";
            reviewButton.innerHTML = `
                <div class="text-3xl mb-2">⭐</div>
                <div class="font-semibold text-gray-700">${reviewName}</div>
                <div class="text-sm text-gray-500">Test - 20 words</div>
            `;
            reviewButton.addEventListener('click', () => startLesson(reviewName));
            lessonGrid.appendChild(reviewButton);
        }
    }
    /**
     * Initializes the lesson selection grid.
     */
    function initLessonGrid() {
        lessonGrid.innerHTML = '';
        const lessonNames = Object.keys(currentLessons);

        lessonNames.forEach(lessonName => {
            const button = document.createElement('button');
            button.className = "p-4 bg-white border-2 border-gray-200 rounded-xl text-center shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200";
            button.innerHTML = `
                <div class="text-3xl mb-2">📚</div>
                <div class="font-semibold text-gray-700">${lessonName}</div>
                <div class="text-sm text-gray-500">${currentLessons[lessonName].length} words</div>
            `;
            button.addEventListener('click', () => startLesson(lessonName));
            lessonGrid.appendChild(button);
        });

        const lessonKeys = lessonNames.filter(name => !name.includes("Review"));
        const totalLessons = lessonKeys.length;

        // Add review buttons
        if (currentCategory === "Business" && totalLessons >= 5) {
            const reviewButton = document.createElement('button');
            reviewButton.className = "p-4 bg-yellow-100 border-2 border-yellow-300 rounded-xl text-center shadow-sm hover:shadow-md hover:border-yellow-500 transition-all duration-200";
            reviewButton.innerHTML = `
                <div class="text-3xl mb-2">⭐</div>
                <div class="font-semibold text-gray-700">Business Review (1-5)</div>
                <div class="text-sm text-gray-500">Test - 20 words</div>
            `;
            reviewButton.addEventListener('click', () => startLesson("Business Review (1-5)"));
            lessonGrid.appendChild(reviewButton);
        } else if (["HSK 1", "IELTS Vocabulary", "Everyday"].includes(currentCategory)) {
            // Dynamically add review buttons for these categories
            addReviewButtons(currentCategory, totalLessons);
        }
    }

    // --- EVENT LISTENERS ---
    learnModeBtn.addEventListener('click', () => switchMode(true));
    testModeBtn.addEventListener('click', () => switchMode(false));
    
    // Updated navigation buttons
    backToLessonsBtn.addEventListener('click', () => showLessonSelector(currentCategory));
    backToCategoriesBtn.addEventListener('click', showCategorySelector);
    changeLanguageFromCategoryBtn.addEventListener('click', showLanguageSelector);
    changeLanguageFromLessonBtn.addEventListener('click', showLanguageSelector);

    revealBtn.addEventListener('click', () => {
        if (cardIndex >= currentDeck.length) return;
        
        const topCard = deck.querySelector('.card');
        if (!topCard) return;

        const revealContent = topCard.querySelector('.reveal-content');
        const topHalf = topCard.querySelector('.top-half');
        const bottomHalf = topCard.querySelector('.bottom-half');
        const cardData = currentDeck[cardIndex];
        
        const { text, lang } = getSpeechParametersForCard(cardData);

        if (revealContent.style.opacity === '1') {
            speak(text, lang);
        } else {
            topHalf.classList.remove('hidden');
            bottomHalf.classList.replace('h-full', 'h-1/2');
            revealContent.style.opacity = '1';
            speak(text, lang);
        }
    });

    // --- INITIALIZATION ---
    loadData();
});
document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    let manifest = {};
    let currentLanguage = localStorage.getItem('flashi_language') || null;
    let currentCategory = null;
    let currentCategoryLessons = []; // Holds the lesson list from the manifest for the current category
    let currentLesson = null;
    let currentDeck = [];
    let cardIndex = 0;
    let isLearnMode = true;
    const synth = window.speechSynthesis;
    let voices = [];

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
    const categorySelector = document.getElementById('category-selector');
    const categoryGrid = document.getElementById('category-grid');
    const categoryLanguageTitle = document.getElementById('category-language-title');
    const changeLanguageFromCategoryBtn = document.getElementById('change-language-from-category');

    const lessonSelector = document.getElementById('lesson-selector');
    const lessonGrid = document.getElementById('lesson-grid');
    const lessonCategoryTitle = document.getElementById('lesson-category-title');
    const backToCategoriesBtn = document.getElementById('back-to-categories');
    const changeLanguageFromLessonBtn = document.getElementById('change-language-from-lesson');

    const flashcardContainer = document.getElementById('flashcard-container');
    const sectionTitle = document.getElementById('section-title');
    const deck = document.getElementById('deck');
    const learnModeBtn = document.getElementById('learn-mode-btn');
    const testModeBtn = document.getElementById('test-mode-btn');
    const testModeControls = document.getElementById('test-mode-controls');
    const revealBtn = document.getElementById('reveal-btn');
    const backToLessonsBtn = document.getElementById('back-to-lessons');

    // --- HELPER FUNCTIONS ---
    function getSpeechParametersForCard(cardData) {
        return currentLanguage === 'english'
            ? { text: cardData.english, lang: 'en-US' }
            : { text: cardData.chinese, lang: 'zh-CN' };
    }

    // --- DATA LOADING ---
    async function loadManifest() {
        try {
            const response = await fetch('data/manifest.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            manifest = await response.json();
            initializeApp();
        } catch (error) {
            console.error("Failed to load manifest:", error);
            appContainer.innerHTML = '<p class="text-red-500 text-center">Failed to load lesson structure. Please try refreshing the page.</p>';
        }
    }

    async function loadLesson(lessonFile) {
        try {
            const response = await fetch(`data/${lessonFile}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to load lesson file: ${lessonFile}`, error);
            return []; // Return an empty deck on error
        }
    }

    // --- UI INITIALIZATION & NAVIGATION ---
    function initializeApp() {
        if (currentLanguage && manifest[currentLanguage]) {
            showCategorySelector();
        } else {
            showLanguageSelector();
        }
    }

    function showLanguageSelector() {
        languageSelector.classList.remove('hidden');
        categorySelector.classList.add('hidden');
        lessonSelector.classList.add('hidden');
        flashcardContainer.classList.add('hidden');

        document.getElementById('select-english').addEventListener('click', () => selectLanguage('english'));
        document.getElementById('select-chinese').addEventListener('click', () => selectLanguage('chinese'));
    }

    function selectLanguage(language) {
        currentLanguage = language;
        localStorage.setItem('flashi_language', language);
        if (synth && !synth.speaking) {
            const warmUpUtterance = new SpeechSynthesisUtterance('');
            synth.speak(warmUpUtterance);
        }
        showCategorySelector();
    }

    function showCategorySelector() {
        if (!currentLanguage || !manifest[currentLanguage]) {
            showLanguageSelector();
            return;
        }
        languageSelector.classList.add('hidden');
        lessonSelector.classList.add('hidden');
        flashcardContainer.classList.add('hidden');
        categorySelector.classList.remove('hidden');
        categoryLanguageTitle.textContent = `เรียน${currentLanguage === 'english' ? 'ภาษาอังกฤษ' : 'ภาษาจีน'}`;
        initCategoryGrid();
    }

    function initCategoryGrid() {
        categoryGrid.innerHTML = '';
        const categoryNames = Object.keys(manifest[currentLanguage]);

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

    function showLessonSelector(categoryName) {
        currentCategory = categoryName;
        currentCategoryLessons = manifest[currentLanguage][currentCategory];
        categorySelector.classList.add('hidden');
        flashcardContainer.classList.add('hidden');
        lessonSelector.classList.remove('hidden');
        lessonCategoryTitle.textContent = currentCategory;
        initLessonGrid();
    }

    function initLessonGrid() {
        lessonGrid.innerHTML = '';
        currentCategoryLessons.forEach(lessonInfo => {
            const button = document.createElement('button');
            const isReview = lessonInfo.isReview;
            
            if (isReview) {
                button.className = "p-4 bg-yellow-100 border-2 border-yellow-300 rounded-xl text-center shadow-sm hover:shadow-md hover:border-yellow-500 transition-all duration-200";
                button.innerHTML = `
                    <div class="text-3xl mb-2">⭐</div>
                    <div class="font-semibold text-gray-700">${lessonInfo.name}</div>
                `;
            } else {
                button.className = "p-4 bg-white border-2 border-gray-200 rounded-xl text-center shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200";
                button.innerHTML = `
                    <div class="text-3xl mb-2">📚</div>
                    <div class="font-semibold text-gray-700">${lessonInfo.name}</div>
                `;
            }
            
            button.addEventListener('click', () => startLesson(lessonInfo));
            lessonGrid.appendChild(button);
        });
    }

    // --- FLASHCARD LOGIC ---
    async function startLesson(lessonInfo) {
        currentLesson = lessonInfo;
        currentDeck = await loadLesson(lessonInfo.file);
        cardIndex = 0;
        
        sectionTitle.textContent = lessonInfo.name;
        lessonSelector.classList.add('hidden');
        flashcardContainer.classList.remove('hidden');
        
        renderDeck();
    }

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

    function renderDeck() {
        deck.innerHTML = '';
        if (cardIndex >= currentDeck.length) {
            showCompletionScreen();
            return;
        }
        
        const cardsToRender = currentDeck.slice(cardIndex, cardIndex + 3);
        cardsToRender.forEach((cardData, index) => {
            const cardEl = createCardElement(cardData, cardIndex + index);
            deck.appendChild(cardEl);
        });
    }
    
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
            e.preventDefault();
        }

        function onPointerUp(e) {
            if (!isDragging) return;
            isDragging = false;
            card.classList.remove('dragging');

            const diffX = (e.clientX || e.changedTouches[0].clientX) - startX;
            const timeElapsed = Date.now() - startTime;
            const velocity = Math.abs(diffX) / timeElapsed;

            const minSwipeDistance = 75;
            const minSwipeVelocity = 0.3;

            if (isLearnMode && Math.abs(diffX) < 10 && timeElapsed < 200) {
                const { text, lang } = getSpeechParametersForCard(cardData);
                speak(text, lang);
                card.style.transform = '';
                return;
            }

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

    function switchMode(toLearnMode) {
        isLearnMode = toLearnMode;

        if (toLearnMode) {
            deck.classList.remove('aspect-[5/6]');
            deck.classList.add('aspect-[3/4]');
        } else {
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

    function speak(text, lang) {
        if (synth.speaking) {
            synth.cancel();
        }

        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.lang = lang;
        utterThis.pitch = 1;
        utterThis.rate = 0.9;

        let voice = null;

        if (lang.startsWith('en')) {
            voice = voices.find(v => v.name === 'Samantha' && v.lang.startsWith('en'));
            if (!voice) {
                voice = voices.find(v => v.name === 'Google US English' && v.lang.startsWith('en'));
            }
        } else if (lang.startsWith('zh')) {
            voice = voices.find(v => v.name === 'Tingting' && v.lang.startsWith('zh'));
            if (!voice) {
                voice = voices.find(v => v.name === 'Ting-Ting' && v.lang.startsWith('zh'));
            }
            if (!voice) {
                voice = voices.find(v => v.lang.startsWith('zh') && !v.default);
            }
        }

        if (!voice) {
            voice = voices.find(v => v.lang === lang);
        }

        if (!voice) {
            const langPrefix = lang.split('-')[0];
            voice = voices.find(v => v.lang.startsWith(langPrefix));
        }

        if (voice) {
            utterThis.voice = voice;
        } else {
            console.warn(`Voice for lang '${lang}' not found. Using default.`);
        }

        synth.speak(utterThis);
    }
    
    // --- EVENT LISTENERS ---
    learnModeBtn.addEventListener('click', () => switchMode(true));
    testModeBtn.addEventListener('click', () => switchMode(false));
    
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
    loadManifest();
});
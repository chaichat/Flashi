import DOMHelpers from '../utils/DOMHelpers.js';
import { ELEMENT_IDS, UI_TEXT, LANGUAGES } from '../utils/Constants.js';

class LanguageSelector {
    constructor(state, storageService, router) {
        this.state = state;
        this.storageService = storageService;
        this.router = router;
        this.element = DOMHelpers.getElementById(ELEMENT_IDS.LANGUAGE_SELECTOR);
        this.deferredPrompt = null;
        this.setupEventListeners();
        this.setupPWAInstall();
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

    setupPWAInstall() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA install prompt available');
            e.preventDefault(); // Prevent the mini-infobar from appearing
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Handle install button click
        const installButton = DOMHelpers.getElementById('install-button');
        const dismissButton = DOMHelpers.getElementById('dismiss-install');

        if (installButton) {
            DOMHelpers.addEventListener(installButton, 'click', () => {
                this.installPWA();
            });
        }

        if (dismissButton) {
            DOMHelpers.addEventListener(dismissButton, 'click', () => {
                this.dismissInstallPrompt();
            });
        }

        // Check if already installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallPrompt();
            this.deferredPrompt = null;
        });

        // For iOS Safari, show manual install instructions
        if (this.isIOS() && !this.isInStandaloneMode()) {
            this.showIOSInstallInstructions();
        }
    }

    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('No install prompt available');
            return;
        }

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the deferredPrompt variable
        this.deferredPrompt = null;
        this.hideInstallPrompt();
    }

    showInstallPrompt() {
        const installPrompt = DOMHelpers.getElementById('install-prompt');
        if (installPrompt) {
            DOMHelpers.removeClass(installPrompt, 'hidden');
        }
    }

    hideInstallPrompt() {
        const installPrompt = DOMHelpers.getElementById('install-prompt');
        if (installPrompt) {
            DOMHelpers.addClass(installPrompt, 'hidden');
        }
    }

    dismissInstallPrompt() {
        this.hideInstallPrompt();
        // Store dismissal to not show again for a while
        localStorage.setItem('flashi-install-dismissed', Date.now().toString());
    }

    showIOSInstallInstructions() {
        const installPrompt = DOMHelpers.getElementById('install-prompt');
        const instructionText = installPrompt?.querySelector('p');
        
        if (instructionText) {
            DOMHelpers.setText(instructionText, '📱 Tap Share → "Add to Home Screen" to install!');
            DOMHelpers.removeClass(installPrompt, 'hidden');
            
            // Hide the install button since iOS doesn't support programmatic install
            const installButton = DOMHelpers.getElementById('install-button');
            if (installButton) {
                DOMHelpers.addClass(installButton, 'hidden');
            }
        }
    }

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    isInStandaloneMode() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
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

        // Check if user previously dismissed install prompt
        const dismissed = localStorage.getItem('flashi-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
            
            // Show again after 7 days
            if (daysSinceDismissed < 7) {
                this.hideInstallPrompt();
                return;
            }
        }
    }
}

export default LanguageSelector;
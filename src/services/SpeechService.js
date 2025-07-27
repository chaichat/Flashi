class SpeechService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.isInitialized = false;
        this.initializeVoices();
    }

    initializeVoices() {
        this.populateVoiceList();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.populateVoiceList();
        }
        
        // Warm up speech synthesis
        if (this.synth && !this.synth.speaking) {
            const warmUpUtterance = new SpeechSynthesisUtterance('');
            this.synth.speak(warmUpUtterance);
        }
    }

    populateVoiceList() {
        this.voices = this.synth.getVoices();
        this.isInitialized = this.voices.length > 0;
        console.log("Available voices: ", this.voices);
    }

    getSpeechParametersForCard(cardData, currentLanguage) {
        return currentLanguage === 'english'
            ? { text: cardData.english, lang: 'en-US' }
            : { text: cardData.chinese, lang: 'zh-CN' };
    }

    findVoiceForLanguage(lang) {
        let voice = null;

        if (lang.startsWith('en')) {
            voice = this.voices.find(v => v.name === 'Samantha' && v.lang.startsWith('en'));
            if (!voice) {
                voice = this.voices.find(v => v.name === 'Google US English' && v.lang.startsWith('en'));
            }
        } else if (lang.startsWith('zh')) {
            voice = this.voices.find(v => v.name === 'Tingting' && v.lang.startsWith('zh'));
            if (!voice) {
                voice = this.voices.find(v => v.name === 'Ting-Ting' && v.lang.startsWith('zh'));
            }
            if (!voice) {
                voice = this.voices.find(v => v.lang.startsWith('zh') && !v.default);
            }
        }

        if (!voice) {
            voice = this.voices.find(v => v.lang === lang);
        }

        if (!voice) {
            const langPrefix = lang.split('-')[0];
            voice = this.voices.find(v => v.lang.startsWith(langPrefix));
        }

        return voice;
    }

    speak(text, lang = 'en-US') {
        if (!this.synth) {
            console.warn('Speech synthesis not supported');
            return;
        }

        if (this.synth.speaking) {
            this.synth.cancel();
        }

        if (!text.trim()) {
            return;
        }

        // Android fix: Ensure voices are loaded before speaking
        if (this.voices.length === 0) {
            console.warn('Voices not loaded yet, retrying...');
            setTimeout(() => {
                this.populateVoiceList();
                if (this.voices.length > 0) {
                    this.speak(text, lang);
                }
            }, 100);
            return;
        }

        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.lang = lang;
        utterThis.pitch = 1;
        utterThis.rate = 0.9;

        const voice = this.findVoiceForLanguage(lang);
        if (voice) {
            utterThis.voice = voice;
        } else {
            console.warn(`Voice for lang '${lang}' not found. Using default.`);
        }

        // Android fix: Add error handling
        utterThis.onerror = (event) => {
            console.error('Speech synthesis error:', event);
        };

        utterThis.onstart = () => {
            console.log('Speech started');
        };

        this.synth.speak(utterThis);
    }

    speakCard(cardData, currentLanguage) {
        const { text, lang } = this.getSpeechParametersForCard(cardData, currentLanguage);
        this.speak(text, lang);
    }

    cancel() {
        if (this.synth && this.synth.speaking) {
            this.synth.cancel();
        }
    }

    isSpeaking() {
        return this.synth ? this.synth.speaking : false;
    }

    getAvailableVoices() {
        return this.voices;
    }

    isReady() {
        return this.isInitialized;
    }
}

export default SpeechService;
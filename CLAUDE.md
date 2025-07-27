# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Flashi is a language learning flashcard application supporting English and Chinese language learning. It's a client-side web application that uses JSON data files for lessons and a manifest system for organization.

## Architecture

- **Frontend**: Vanilla JavaScript with Tailwind CSS, served via HTML
- **Data Layer**: JSON files containing lessons organized by language, category, and lesson
- **Scripts**: Node.js utilities for data manipulation and lesson generation
- **Manifest System**: Central manifest.json tracks all lessons with metadata

### Core Data Structure

- `data/manifest.json` - Central registry of all lessons with names, file paths, and metadata
- `data/lessons.json` - Main lessons data (appears to be legacy/backup)
- `data/english/` - English lessons organized by category (everyday, ielts_vocabulary, useful_phrases)
- `data/chinese/` - Chinese lessons (hsk_1, useful_phrases)

### Key Files

- `index.html` - Main application entry point
- `js/script.js` - Core application logic for flashcard functionality
- `scripts/utils.js` - Shared utilities for data processing
- `data/manifest.json` - Lesson registry with localized names and file paths

## Common Development Commands

```bash
# Content generation and data management
npm run add-everyday      # Add everyday English lessons
npm run add-ielts        # Add IELTS vocabulary lessons
npm run translate        # Populate translations using Google Translate API
npm run phonetics        # Add phonetic transcriptions
npm run word-lists       # Generate word lists
npm run clean-list       # Clean existing word lists
npm run reset-everyday   # Reset everyday lessons data
```

## Data Management Scripts

The `scripts/` directory contains utilities for:
- `addEverydayLessons.js` - Generates everyday English lessons
- `addIELTSLessons.js` - Generates IELTS vocabulary lessons  
- `populateTranslations.js` - Uses Google Translate API to add translations
- `populatePhonetics.js` - Adds phonetic transcriptions
- `updateManifest.js` - Updates the central manifest file
- `utils.js` - Shared utilities for word processing and data validation

## Lesson Data Format

Each lesson file contains an array of flashcards:
```json
[
  {
    "english": "Hello",
    "thai": "สวัสดี", 
    "phonetic": "",
    "chinese": "你好",
    "pinyin": "nǐ hǎo"
  }
]
```

## Important Notes

- The application requires a Google Translate API key for translation scripts (uses dotenv)
- All lesson files are JSON and must maintain the consistent card structure
- The manifest.json file is critical for lesson discovery and must be updated when adding new lessons
- Review lessons are automatically generated for lesson ranges (e.g., "review_1-5")
- Text-to-speech functionality is implemented for pronunciation support

## Current Architecture Issues & Improvement Plan

### Current Pain Points

1. **Monolithic JavaScript (436 lines)**: Single `script.js` file handles all UI logic, state management, and business logic
2. **Tight Coupling**: 26 direct DOM element references, 20 event listeners scattered throughout
3. **No Separation of Concerns**: Data loading, UI rendering, and business logic mixed together
4. **State Management**: Global variables (12+ state variables) making debugging difficult
5. **No Error Boundaries**: Limited error handling and user feedback
6. **No Build Process**: Direct script inclusion, no bundling or optimization
7. **Scalability Issues**: Adding new features requires modifying the monolithic file

### Recommended Architecture Improvements

#### Phase 1: Modularization (High Priority)
```
src/
├── core/
│   ├── App.js                 # Main application controller
│   ├── Router.js              # Screen navigation logic
│   └── State.js               # Centralized state management
├── services/
│   ├── DataService.js         # Lesson loading and caching
│   ├── StorageService.js      # localStorage wrapper
│   └── SpeechService.js       # Text-to-speech functionality
├── components/
│   ├── LanguageSelector.js    # Language selection screen
│   ├── CategoryGrid.js        # Category listing
│   ├── LessonGrid.js          # Lesson listing
│   └── FlashcardDeck.js       # Flashcard logic
├── utils/
│   ├── DOMHelpers.js          # DOM manipulation utilities
│   └── Constants.js           # App constants and config
└── main.js                    # Entry point
```

#### Phase 2: Enhanced Features (Medium Priority)
- TypeScript conversion for type safety
- Build system (Vite/Webpack) for bundling and optimization
- Service Worker for offline functionality
- Progressive Web App (PWA) features
- Error boundaries and user feedback improvements
- Unit testing framework

#### Phase 3: Advanced Architecture (Low Priority)
- Component-based framework (React/Vue) migration
- Advanced state management (Redux/Zustand)
- Performance optimizations (virtual scrolling, lazy loading)
- Internationalization (i18n) system
- Analytics and user progress tracking

### Implementation Steps

1. **Extract Services First**: Move data loading, storage, and speech functionality to separate modules
2. **Separate UI Components**: Break down the monolithic render functions into reusable components
3. **Implement State Management**: Create a centralized state system with proper data flow
4. **Add Build Tooling**: Introduce bundling and module system
5. **Gradual Migration**: Migrate one screen at a time to maintain functionality

### Benefits of Improved Architecture

- **Maintainability**: Easier to locate and fix bugs
- **Scalability**: Simple to add new languages, lesson types, or features
- **Testability**: Isolated modules can be unit tested
- **Performance**: Better code splitting and lazy loading opportunities
- **Developer Experience**: Clearer code organization and faster development
- **User Experience**: Better error handling and offline capabilities
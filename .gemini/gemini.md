# Flashi - Prompt Requirement Document

**Version:** 1.1
**Date:** July 8, 2025

## 1. Introduction & Vision

This document outlines the requirements for "Flashi," a web-based flashcard application designed to help native Thai speakers learn English and Chinese vocabulary. The core vision is to create a simple, elegant, and effective learning tool that is both engaging and easy to use.

## 2. Core Application Functionality

The application will be a single-page web app with the following features:

*   **Language Selection:**
    *   On the first visit, the user will be presented with a choice: "Learn English" or "Learn Chinese".
    *   The app will remember the user's selection (e.g., using browser localStorage).
    *   On subsequent visits, the app will load directly into the lesson menu for the chosen language.
    *   A method to switch languages from within the app will be available.

*   **Section-Based Learning:** The app will be organized into thematic sections or "lessons."

*   **Two Modes:**
    *   **Learn Mode:** Users can study cards with all information visible (Target Language, Thai, phonetic spelling) and hear the pronunciation.
    *   **Test Mode:** Users are challenged to recall the target language word from the Thai prompt.

*   **Flashcard Mechanics:**
    *   Users can swipe left or right to move to the next card.
    *   In Learn Mode, tapping a card plays the target language audio.
    *   In Test Mode, a "Reveal" (เฉลย) button shows the answer and plays the audio.

*   **Review Tests:** After every 5 regular lessons within a category (e.g., Business), a special "Review" test will be available. This test will randomly select 20 words from the preceding 100 words (5 lessons x 20 words).

## 3. User Interface (UI) & Design

The application will maintain a clean, minimalist, and modern aesthetic.

*   **Card Design:**
    *   Flashcards will be text-only to ensure reliability and fast loading.
    *   The top half of the card will feature a solid, soft color block displaying the large target language word (in Learn Mode). The color will cycle through a pleasant palette for visual variety.
    *   The bottom half will be white and contain the Thai translation and phonetic spelling.

*   **Navigation:**
    *   The main screen will be a grid of buttons, all...
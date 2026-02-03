/**
 * Onboarding система: показывает слайды при первом входе.
 */

import { state } from './state.js';
import { TEXTS } from './config.js';
import { showScreen, applyTranslations } from './ui.js';

let currentSlide = 1;
const TOTAL_SLIDES = 3;

export function shouldShowOnboarding() {
    return !localStorage.getItem('onboarding_shown');
}

export function markOnboardingShown() {
    localStorage.setItem('onboarding_shown', 'true');
}

export function showOnboarding() {
    currentSlide = 1;
    showScreen('screen-onboarding');
    updateOnboardingUI();
    // Применить переводы к элементам onboarding
    applyTranslations();
}

function updateOnboardingUI() {
    // Показать текущий слайд
    for (let i = 1; i <= TOTAL_SLIDES; i++) {
        const slide = document.getElementById(`onboarding-slide-${i}`);
        const dot = document.getElementById(`onboarding-dot-${i}`);
        if (slide) {
            if (i === currentSlide) {
                slide.classList.remove('hidden');
            } else {
                slide.classList.add('hidden');
            }
        }
        if (dot) {
            if (i === currentSlide) {
                dot.classList.remove('bg-white/30');
                dot.classList.add('bg-cyan-400');
            } else {
                dot.classList.remove('bg-cyan-400');
                dot.classList.add('bg-white/30');
            }
        }
    }

    // Обновить кнопки
    const nextBtn = document.getElementById('onboarding-next');
    const startBtn = document.getElementById('onboarding-start');
    const skipBtn = document.getElementById('onboarding-skip');
    
    if (currentSlide === TOTAL_SLIDES) {
        if (nextBtn) nextBtn.classList.add('hidden');
        if (startBtn) startBtn.classList.remove('hidden');
    } else {
        if (nextBtn) nextBtn.classList.remove('hidden');
        if (startBtn) startBtn.classList.add('hidden');
    }
}

export function nextOnboardingSlide() {
    if (currentSlide < TOTAL_SLIDES) {
        currentSlide++;
        updateOnboardingUI();
    }
}

export function skipOnboarding() {
    markOnboardingShown();
    showScreen('screen-language');
}

export function finishOnboarding() {
    markOnboardingShown();
    showScreen('screen-language');
}

export function initOnboardingHandlers() {
    const nextBtn = document.getElementById('onboarding-next');
    const startBtn = document.getElementById('onboarding-start');
    const skipBtn = document.getElementById('onboarding-skip');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextOnboardingSlide();
        });
    }
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            finishOnboarding();
        });
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            skipOnboarding();
        });
    }
}

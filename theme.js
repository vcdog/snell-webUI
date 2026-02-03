/**
 * Theme Management
 * Supports: Light, Dark, and Auto (follow system)
 */

// Theme state
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto'
};

let currentTheme = THEMES.AUTO;

/**
 * Initialize theme on page load
 */
function initTheme() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || THEMES.AUTO;
    currentTheme = savedTheme;

    applyTheme(currentTheme);
    updateThemeIcon(currentTheme);

    // Listen to system theme changes when in auto mode
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (currentTheme === THEMES.AUTO) {
                applyTheme(THEMES.AUTO);
            }
        });
    }
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
    const html = document.documentElement;

    if (theme === THEMES.LIGHT) {
        html.setAttribute('data-theme', 'light');
    } else if (theme === THEMES.DARK) {
        html.setAttribute('data-theme', 'dark');
    } else { // AUTO
        html.removeAttribute('data-theme');
    }
}

/**
 * Update theme icon based on current theme
 */
function updateThemeIcon(theme) {
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');
    const autoIcon = document.getElementById('theme-icon-auto');

    // Hide all icons
    if (lightIcon) lightIcon.style.display = 'none';
    if (darkIcon) darkIcon.style.display = 'none';
    if (autoIcon) autoIcon.style.display = 'none';

    // Show current theme icon
    if (theme === THEMES.LIGHT && lightIcon) {
        lightIcon.style.display = 'block';
    } else if (theme === THEMES.DARK && darkIcon) {
        darkIcon.style.display = 'block';
    } else if (theme === THEMES.AUTO && autoIcon) {
        autoIcon.style.display = 'block';
    }
}

/**
 * Toggle theme (cycle through: auto -> light -> dark -> auto)
 */
function toggleTheme() {
    if (currentTheme === THEMES.AUTO) {
        currentTheme = THEMES.LIGHT;
    } else if (currentTheme === THEMES.LIGHT) {
        currentTheme = THEMES.DARK;
    } else {
        currentTheme = THEMES.AUTO;
    }

    // Save preference
    localStorage.setItem('theme', currentTheme);

    // Apply theme
    applyTheme(currentTheme);
    updateThemeIcon(currentTheme);

    // Show toast notification
    const themeNames = {
        [THEMES.LIGHT]: '浅色模式',
        [THEMES.DARK]: '深色模式',
        [THEMES.AUTO]: '自动模式'
    };

    showToast('success', '主题已切换', `当前：${themeNames[currentTheme]}`);
}

/**
 * Setup theme toggle button
 */
function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

// Initialize theme when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        setupThemeToggle();
    });
} else {
    initTheme();
    setupThemeToggle();
}

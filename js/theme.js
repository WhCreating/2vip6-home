/* =========================================================
   Theme — переключение тёмной/светлой темы
   ========================================================= */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'tui-theme';
    const THEMES = ['dark', 'light'];
    const DEFAULT = 'dark';

    const Theme = {
        current: DEFAULT,

        init() {
            const saved = localStorage.getItem(STORAGE_KEY);
            const prefersLight = window.matchMedia &&
                window.matchMedia('(prefers-color-scheme: light)').matches;

            const initial = THEMES.includes(saved)
                ? saved
                : (prefersLight ? 'light' : DEFAULT);

            this.apply(initial);
            this.bindToggle();
        },

        apply(theme) {
            if (!THEMES.includes(theme)) theme = DEFAULT;
            this.current = theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(STORAGE_KEY, theme);
            this.updateButton();
            document.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme } }));
        },

        toggle() {
            this.apply(this.current === 'dark' ? 'light' : 'dark');
        },

        updateButton() {
            const icon = document.getElementById('theme-icon');
            const label = document.querySelector('.theme-btn__label');
            const isDark = this.current === 'dark';
            if (icon) icon.textContent = isDark ? '☾' : '☀';
            if (label) {
                const key = isDark ? 'theme.dark' : 'theme.light';
                label.setAttribute('data-i18n', key);
                if (global.I18n && global.I18n.t) {
                    const val = global.I18n.t(key);
                    if (val !== key) label.textContent = val;
                } else {
                    label.textContent = isDark ? 'DARK' : 'LIGHT';
                }
            }
        },

        bindToggle() {
            const btn = document.getElementById('theme-toggle');
            if (!btn) return;
            btn.addEventListener('click', () => this.toggle());
        },
    };

    global.Theme = Theme;
})(window);
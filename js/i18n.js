/* =========================================================
   i18n — простая система переводов
   ========================================================= */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'tui-lang';
    const DEFAULT_LANG = 'ru';
    const SUPPORTED = ['ru', 'en'];

    const I18n = {
        lang: DEFAULT_LANG,
        translations: {},
        supported: SUPPORTED,

        async init() {
            const saved = localStorage.getItem(STORAGE_KEY);
            const browser = (navigator.language || '').slice(0, 2).toLowerCase();
            const initial = SUPPORTED.includes(saved)
                ? saved
                : SUPPORTED.includes(browser)
                    ? browser
                    : DEFAULT_LANG;

            await this.load(initial);
            this.bindSwitchers();
            this.apply();
        },

        async load(lang) {
            if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
            try {
                const res = await fetch(`locales/${lang}.json`, { cache: 'no-cache' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                this.translations = await res.json();
                this.lang = lang;
                localStorage.setItem(STORAGE_KEY, lang);
            } catch (err) {
                console.error('[i18n] Failed to load translations:', err);
                if (lang !== DEFAULT_LANG) {
                    await this.load(DEFAULT_LANG);
                }
            }
        },

        t(key) {
            const parts = key.split('.');
            let node = this.translations;
            for (const part of parts) {
                if (node && typeof node === 'object' && part in node) {
                    node = node[part];
                } else {
                    return key;
                }
            }
            return typeof node === 'string' ? node : key;
        },

        apply() {
            document.documentElement.lang = this.lang;

            document.querySelectorAll('[data-i18n]').forEach((el) => {
                const key = el.getAttribute('data-i18n');
                const val = this.t(key);
                if (val !== key) el.textContent = val;
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
                const key = el.getAttribute('data-i18n-placeholder');
                const val = this.t(key);
                if (val !== key) el.setAttribute('placeholder', val);
            });

            document.querySelectorAll('[data-i18n-title]').forEach((el) => {
                const key = el.getAttribute('data-i18n-title');
                const val = this.t(key);
                if (val !== key) el.setAttribute('title', val);
            });

            const langLabel = document.getElementById('current-lang');
            if (langLabel) langLabel.textContent = this.lang.toUpperCase();

            document.querySelectorAll('.lang-btn').forEach((btn) => {
                btn.classList.toggle('is-active', btn.dataset.lang === this.lang);
            });

            document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: this.lang } }));
        },

        bindSwitchers() {
            document.querySelectorAll('.lang-btn').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const lang = btn.dataset.lang;
                    if (!SUPPORTED.includes(lang) || lang === this.lang) return;
                    await this.load(lang);
                    this.apply();
                });
            });
        },
    };

    global.I18n = I18n;
})(window);
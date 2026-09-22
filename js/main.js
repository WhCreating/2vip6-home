/* =========================================================
   main.js — точка входа + обработка deep-link'ов из URL
   ========================================================= */
(function () {
    'use strict';

    async function boot() {
        try { await window.I18n.init(); } catch (e) { console.error(e); }

        window.Theme.init();
        window.Terminal.init();
        window.News.init();

        // Если в URL есть #install (или другой id) — открыть нужный раздел
        const hash = (location.hash || '').replace('#', '');
        if (hash) {
            // Секции имеют id = section
            const sectionIds = Array.from(document.querySelectorAll('.section')).map((s) => s.id);
            if (sectionIds.includes(hash)) {
                const idx = Array.from(document.querySelectorAll('.menu__item'))
                    .findIndex((it) => it.dataset.section === hash);
                if (idx >= 0) window.Terminal.selectSection(idx);
            } else {
                // Если это внутренний блок (например, install внутри home)
                const target = document.getElementById(hash);
                if (target) {
                    const section = target.closest('.section');
                    if (section) {
                        const idx = Array.from(document.querySelectorAll('.menu__item'))
                            .findIndex((it) => it.dataset.section === section.id);
                        if (idx >= 0) {
                            window.Terminal.selectSection(idx, hash);
                        }
                    }
                }
            }
        }

        // Перерисовка footer-lang и новостей при смене языка
        document.addEventListener('i18n:changed', () => {
            window.News.render();
            window.Theme.updateButton();
        });

        console.log('%c TUI Console ready ', 'background:#4a7bc8;color:#fff;font-weight:bold;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
/* =========================================================
   Terminal — меню (desktop + mobile footer), клавиатура, копирование, форма
   ========================================================= */
(function (global) {
    'use strict';

    const Terminal = {
        selectedIndex: 0,
        menuItems: [],       // элементы desktop-меню
        footerNavItems: [],  // элементы мобильного footer-меню

        init() {
            this.menuItems = Array.from(document.querySelectorAll('#menu-desktop .menu__item'));
            this.footerNavItems = Array.from(document.querySelectorAll('#menu-mobile .footer-nav__item'));

            this.bindMenu();
            this.bindKeyboard();
            this.bindCopy();
            this.bindContactForm();
            this.updateMenuSelection();
        },

        /* ---------- Меню ---------- */
        bindMenu() {
            // Desktop
            this.menuItems.forEach((item, idx) => {
                item.addEventListener('click', () => this.selectSection(idx));
                item.addEventListener('mouseenter', () => {
                    this.selectedIndex = idx;
                    this.updateMenuSelection();
                });
            });

            // Mobile footer
            this.footerNavItems.forEach((item, idx) => {
                item.addEventListener('click', () => this.selectSection(idx));
            });
        },

        selectSection(index, scrollToId = null) {
            if (index < 0 || index >= this.menuItems.length) return;
            this.selectedIndex = index;
            this.updateMenuSelection();

            const sectionId = this.menuItems[index].dataset.section;
            document.querySelectorAll('.section').forEach((s) => {
                s.classList.toggle('section--active', s.id === sectionId);
            });

            const content = document.querySelector('.content');
            if (scrollToId && content) {
                const target = document.getElementById(scrollToId);
                if (target) {
                    requestAnimationFrame(() => {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                }
            } else if (content) {
                content.scrollTop = 0;
            }

            const hash = scrollToId ? `#${scrollToId}` : `#${sectionId}`;
            if (history.replaceState) history.replaceState(null, '', hash);
        },

        updateMenuSelection() {
            // Desktop
            this.menuItems.forEach((item, idx) => {
                const selected = idx === this.selectedIndex;
                item.classList.toggle('menu__item--selected', selected);
                const pointer = item.querySelector('.pointer');
                if (pointer) pointer.textContent = selected ? '▶' : ' ';
            });

            // Mobile footer
            this.footerNavItems.forEach((item, idx) => {
                item.classList.toggle('footer-nav__item--selected', idx === this.selectedIndex);
            });
        },

        /* ---------- Клавиатура ---------- */
        bindKeyboard() {
            document.addEventListener('keydown', (e) => {
                const tag = (e.target.tagName || '').toLowerCase();
                const isInput = tag === 'input' || tag === 'textarea';

                if (isInput) {
                    if (e.key === 'Escape') e.target.blur();
                    return;
                }
                if (e.ctrlKey || e.metaKey || e.altKey) return;

                switch (e.key) {
                    case 'ArrowDown':
                    case 'j':
                        e.preventDefault();
                        this.selectSection(Math.min(this.selectedIndex + 1, this.menuItems.length - 1));
                        break;
                    case 'ArrowUp':
                    case 'k':
                        e.preventDefault();
                        this.selectSection(Math.max(this.selectedIndex - 1, 0));
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.selectSection(this.selectedIndex);
                        break;
                }
            });
        },

        /* ---------- Копирование ---------- */
        bindCopy() {
            document.querySelectorAll('.copy-btn').forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const sel = btn.getAttribute('data-copy');
                    const target = sel && document.querySelector(sel);
                    if (!target) return;
                    const text = target.textContent.trim();
                    try {
                        await navigator.clipboard.writeText(text);
                    } catch {
                        const ta = document.createElement('textarea');
                        ta.value = text;
                        document.body.appendChild(ta);
                        ta.select();
                        try { document.execCommand('copy'); } catch {}
                        document.body.removeChild(ta);
                    }
                    btn.classList.add('is-copied');
                    btn.textContent = '✓';
                    setTimeout(() => {
                        btn.classList.remove('is-copied');
                        btn.textContent = '⧉';
                    }, 1200);
                });
            });
        },

        /* ---------- Форма связи ---------- */
        bindContactForm() {
            const form = document.getElementById('contact-form');
            const status = document.getElementById('contact-status');
            if (!form || !status) return;

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = form.querySelector('#c-name').value.trim();
                const email = form.querySelector('#c-email').value.trim();
                const msg = form.querySelector('#c-msg').value.trim();
                if (!name || !email || !msg) return;

                const t = (k) => global.I18n ? global.I18n.t(k) : k;
                status.textContent = t('contact.form.sending');

                setTimeout(() => {
                    status.textContent = t('contact.form.success');
                    form.reset();
                    setTimeout(() => { status.textContent = ''; }, 4000);
                }, 600);
            });
        },
    };

    global.Terminal = Terminal;
})(window);
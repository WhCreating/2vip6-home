/* =========================================================
   News — загрузка и рендер новостей из content/news/
   Формат: content/news/index.json + content/news/*.md
   ========================================================= */
(function (global) {
    'use strict';

    const BASE = 'content/news';

    const News = {
        listEl: null,
        cache: null,

        init() {
            this.listEl = document.getElementById('news-list');
            if (!this.listEl) return;
            document.addEventListener('i18n:changed', () => this.render());
            document.addEventListener('theme:changed', () => { /* стили переприменяются автоматически */ });
            this.load();
        },

        async load() {
            try {
                const res = await fetch(`${BASE}/index.json`, { cache: 'no-cache' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const items = await res.json();

                // Загружаем каждый .md параллельно
                const enriched = await Promise.all(
                    items.map(async (item) => {
                        const body = await this.fetchMd(item.file);
                        return { ...item, body };
                    })
                );

                // Сортируем по дате (свежие сверху)
                enriched.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

                this.cache = enriched;
                this.render();
            } catch (err) {
                console.error('[news] load failed:', err);
                this.renderError();
            }
        },

        async fetchMd(file) {
            try {
                const res = await fetch(`${BASE}/${file}`, { cache: 'no-cache' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.text();
            } catch (e) {
                console.warn(`[news] cannot load ${file}:`, e);
                return '';
            }
        },

        render() {
            if (!this.listEl) return;
            if (!this.cache || !this.cache.length) {
                const emptyKey = 'news.empty';
                const emptyText = global.I18n ? global.I18n.t(emptyKey) : 'No news yet';
                this.listEl.innerHTML = `<div class="news__empty">${emptyText}</div>`;
                return;
            }

            const lang = global.I18n ? global.I18n.lang : 'ru';

            this.listEl.innerHTML = this.cache.map((item) => {
                const title = (item.title && (item.title[lang] || item.title.ru || item.title.en)) || '';
                const date = item.date || '';
                const tags = Array.isArray(item.tags) ? item.tags : [];
                const body = global.Markdown ? global.Markdown.render(item.body || '') : '';

                const tagsHtml = tags.length
                    ? `<div class="news-item__tags">${tags.map((t) => `<span class="news-item__tag">${this.esc(t)}</span>`).join('')}</div>`
                    : '';

                return `
<article class="news-item">
    <header class="news-item__head">
        <time class="news-item__date">[${this.esc(date)}]</time>
        <h3 class="news-item__title">${this.esc(title)}</h3>
        ${tagsHtml}
    </header>
    <div class="news-item__body">${body}</div>
</article>`.trim();
            }).join('');
        },

        renderError() {
            if (!this.listEl) return;
            const key = 'news.error';
            const text = global.I18n ? global.I18n.t(key) : 'Failed to load news';
            this.listEl.innerHTML = `<div class="news__empty">${text}</div>`;
        },

        esc(s) {
            return global.Markdown ? global.Markdown.escapeHtml(s) : String(s);
        },
    };

    global.News = News;
})(window);
/* =========================================================
   Markdown — минимальный рендерер (без внешних зависимостей)
   Поддержка: # заголовки, **bold**, *italic*, `code`, ```code```,
              [ссылки](url), - списки, 1. нумерованные, > цитаты,
              --- разделители, перенос строк.
   ========================================================= */
(function (global) {
    'use strict';

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function inline(text) {
        let s = escapeHtml(text);
        // code `...`
        s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
        // bold **...**
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // italic *...*
        s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
        // links [text](url)
        s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, url) => {
            const safe = /^(https?:|mailto:|\/|#)/i.test(url) ? url : '#';
            return `<a href="${safe}" target="_blank" rel="noopener">${txt}</a>`;
        });
        return s;
    }

    function render(md) {
        if (!md) return '';
        const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
        const out = [];
        let i = 0;
        let inList = false;
        let inOl = false;
        let paragraph = [];

        const flushParagraph = () => {
            if (paragraph.length) {
                out.push(`<p>${paragraph.map(inline).join('<br>')}</p>`);
                paragraph = [];
            }
        };

        const closeLists = () => {
            if (inList) { out.push('</ul>'); inList = false; }
            if (inOl) { out.push('</ol>'); inOl = false; }
        };

        while (i < lines.length) {
            const line = lines[i];

            // code fence
            if (/^```/.test(line)) {
                flushParagraph();
                closeLists();
                const lang = line.replace(/^```/, '').trim();
                const buf = [];
                i++;
                while (i < lines.length && !/^```/.test(lines[i])) {
                    buf.push(lines[i]);
                    i++;
                }
                i++; // skip closing fence
                out.push(
                    `<pre><code${lang ? ` class="lang-${escapeHtml(lang)}"` : ''}>${escapeHtml(buf.join('\n'))}</code></pre>`
                );
                continue;
            }

            // headings
            const h = line.match(/^(#{1,6})\s+(.*)$/);
            if (h) {
                flushParagraph();
                closeLists();
                const level = h[1].length;
                out.push(`<h${level}>${inline(h[2])}</h${level}>`);
                i++;
                continue;
            }

            // hr
            if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
                flushParagraph();
                closeLists();
                out.push('<hr>');
                i++;
                continue;
            }

            // blockquote
            if (/^>\s?/.test(line)) {
                flushParagraph();
                closeLists();
                const buf = [];
                while (i < lines.length && /^>\s?/.test(lines[i])) {
                    buf.push(lines[i].replace(/^>\s?/, ''));
                    i++;
                }
                out.push(`<blockquote>${buf.map(inline).join('<br>')}</blockquote>`);
                continue;
            }

            // unordered list
            if (/^\s*[-*+]\s+/.test(line)) {
                flushParagraph();
                if (inOl) { out.push('</ol>'); inOl = false; }
                if (!inList) { out.push('<ul>'); inList = true; }
                out.push(`<li>${inline(line.replace(/^\s*[-*+]\s+/, ''))}</li>`);
                i++;
                continue;
            }

            // ordered list
            if (/^\s*\d+\.\s+/.test(line)) {
                flushParagraph();
                if (inList) { out.push('</ul>'); inList = false; }
                if (!inOl) { out.push('<ol>'); inOl = true; }
                out.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`);
                i++;
                continue;
            }

            // empty line
            if (!line.trim()) {
                flushParagraph();
                closeLists();
                i++;
                continue;
            }

            // paragraph
            paragraph.push(line);
            i++;
        }

        flushParagraph();
        closeLists();
        return out.join('\n');
    }

    global.Markdown = { render, escapeHtml };
})(window);
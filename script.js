/* OPTIMA TOTAL SOLUTION - DOM wiring.
 * Every feature is guarded so a page without it does nothing.
 * Pure logic lives in js/optima-core.js (window.OptimaCore). No fetch, XHR or canvas reads. */
(function () {
    'use strict';

    var Core = window.OptimaCore || null;
    var qs = function (sel, root) { return (root || document).querySelector(sel); };
    var qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

    /* ---------- Navbar scroll ---------- */
    (function navbarScroll() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;
        var alwaysScrolled = navbar.classList.contains('scrolled'); // inner pages start with the solid header
        var update = function () {
            if (alwaysScrolled || window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        };
        window.addEventListener('scroll', update, { passive: true });
        update();
    })();

    var reducedMotion = function () {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    /* ---------- Featured project: the first visible project of each grid is shown large ---------- */
    function markFeatured() {
        qsa('.project-grid').forEach(function (grid) {
            var done = false;
            qsa('.project-item', grid).forEach(function (item) {
                var first = !done && !item.hidden;
                if (first) done = true;
                item.classList.toggle('is-featured', first);
            });
        });
    }
    markFeatured();

    /* ---------- Scroll progress and back to top (the active page is set in the markup) ---------- */
    (function scrollUi() {
        var bar = qs('.scroll-progress span');
        var toTop = qs('.to-top');
        var ticking = false;

        var update = function () {
            ticking = false;
            var y = window.scrollY || window.pageYOffset || 0;
            var doc = document.documentElement;
            var max = Math.max(1, doc.scrollHeight - window.innerHeight);
            if (bar) bar.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')';
            if (toTop) toTop.hidden = y < 700;
        };
        var request = function () {
            if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
        };
        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);
        if (toTop) {
            toTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
            });
        }
        update();
    })();
    /* ---------- Count-up for the highlights strip (final values are already in the HTML) ---------- */
    (function counters() {
        var nodes = qsa('.count[data-count]');
        if (!nodes.length || reducedMotion() || !('IntersectionObserver' in window)) return;
        var DURATION = 500;
        var format = function (n, pad) {
            var s = String(n);
            while (s.length < pad) s = '0' + s;
            return s;
        };
        var run = function (el) {
            var end = parseInt(el.getAttribute('data-count'), 10);
            var pad = parseInt(el.getAttribute('data-pad') || '0', 10);
            if (isNaN(end)) return;
            var start = null;
            var step = function (ts) {
                if (start === null) start = ts;
                var t = Math.min(1, (ts - start) / DURATION);
                el.textContent = format(Math.round(end * t), pad);
                if (t < 1) window.requestAnimationFrame(step);
                else el.textContent = format(end, pad);
            };
            window.requestAnimationFrame(step);
        };
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        nodes.forEach(function (el) { io.observe(el); });
    })();

    /* ---------- Mobile menu ---------- */
    (function mobileMenu() {
        var toggle = qs('.nav-toggle');
        var links = document.getElementById('nav-links') || qs('.nav-links');
        if (!toggle || !links) return;
        var state = { open: false };
        var reduce = function (state, event) {
            if (Core && Core.menuReducer) return Core.menuReducer(state, event);
            if (event === 'toggle') return { open: !state.open };
            return { open: false };
        };
        var render = function () {
            links.classList.toggle('open', state.open);
            var navEl = document.getElementById('navbar');
            if (navEl) navEl.classList.toggle('menu-open', state.open);
            toggle.setAttribute('aria-expanded', state.open ? 'true' : 'false');
        };
        var send = function (event) { state = reduce(state, event); render(); };

        toggle.setAttribute('aria-controls', 'nav-links');
        render();
        toggle.addEventListener('click', function () { send('toggle'); });
        links.addEventListener('click', function (e) {
            if (e.target.closest && e.target.closest('a')) send('linkSelected');
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && state.open) {
                send('escape');
                toggle.focus();
            }
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth >= 768 && state.open) send('linkSelected');
        });
    })();

    /* ---------- Smooth scroll for in-page anchors ---------- */
    (function smoothScroll() {
        qsa('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var id = anchor.getAttribute('href');
                if (!id || id === '#') return;
                var target;
                try { target = document.querySelector(id); } catch (err) { return; }
                if (!target) return;
                e.preventDefault();
                var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                // Offset comes from CSS scroll-margin-top on sections.
                target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
            });
        });
    })();

    /* ---------- Page loader: CSS clears it by itself; this just ends it early ---------- */
    (function pageLoader() {
        var loader = qs('.page-loader');
        if (!loader) return;
        var done = function () {
            loader.classList.add('is-done');
            window.setTimeout(function () {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
            }, 350);
        };
        if (document.readyState === 'complete') done();
        else window.addEventListener('load', done);
        window.setTimeout(done, 1000);
    })();

    /* ---------- Reveal once ---------- */
    (function reveal() {
        var items = qsa('.reveal');
        if (!items.length) return;
        if (!('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('active'); });
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        items.forEach(function (el) { observer.observe(el); });
    })();

    /* ---------- Gallery / project filter ----------
     * Each filter bar only acts on the .gallery-item elements of its own section.
     * ?filter=<category> in the page address presses the matching button (used by the service links). */
    (function galleryFilter() {
        qsa('.gallery-filters').forEach(initFilterBar);

        function initFilterBar(bar) {
            var scope = (bar.closest && bar.closest('section')) || bar.parentNode;
            var buttons = qsa('.filter-btn', bar);
            var items = qsa('.gallery-item', scope);
            if (!buttons.length || !items.length) return;
            var status = qs('.filter-status', scope);
            var noun = items[0].classList.contains('project-item') ? 'projects' : 'photographs';

            // number of items per filter, shown on the buttons
            buttons.forEach(function (btn) {
                var value = btn.getAttribute('data-filter') || 'all';
                var n = items.filter(function (i) { return value === 'all' || i.getAttribute('data-category') === value; }).length;
                btn.setAttribute('data-count', String(n));
            });

            var apply = function (btn) {
                buttons.forEach(function (b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                var value = btn.getAttribute('data-filter') || 'all';
                var shown = 0;
                items.forEach(function (item) {
                    var show = value === 'all' || item.getAttribute('data-category') === value;
                    if (show) {
                        shown++;
                        var wasHidden = item.hidden;
                        item.hidden = false;
                        if (wasHidden) {
                            item.classList.remove('fade-in');
                            void item.offsetWidth; // restart animation
                            item.classList.add('fade-in');
                        }
                    } else {
                        item.hidden = true;
                        item.classList.remove('fade-in');
                    }
                });
                if (status) {
                    status.textContent = value === 'all'
                        ? 'Showing all ' + shown + ' ' + noun + '.'
                        : 'Showing ' + shown + ' of ' + items.length + ' ' + noun + '.';
                }
                markFeatured();
            };

            buttons.forEach(function (btn) {
                btn.addEventListener('click', function () { apply(btn); });
            });

            var wanted = null;
            try { wanted = new URLSearchParams(window.location.search).get('filter'); } catch (err) { wanted = null; }
            var match = wanted && buttons.filter(function (b) { return b.getAttribute('data-filter') === wanted; })[0];
            if (match) apply(match);
            else if (status) status.textContent = 'Showing all ' + items.length + ' ' + noun + '.';
        }
    })();
    /* ---------- Lightbox ---------- */
    (function lightbox() {
        var tiles = qsa('.gallery-item');
        if (!tiles.length) return;

        var box = qs('.lightbox');
        if (!box) {
            box = document.createElement('div');
            box.className = 'lightbox';
            box.setAttribute('role', 'dialog');
            box.setAttribute('aria-modal', 'true');
            box.setAttribute('aria-label', 'Project photo viewer');
            box.innerHTML =
                '<button type="button" class="lightbox-close" aria-label="Close">&times;</button>' +
                '<button type="button" class="lightbox-prev" aria-label="Previous photo">&#10094;</button>' +
                '<figure class="lightbox-figure">' +
                '<img class="lightbox-img" alt="">' +
                '<figcaption class="lightbox-caption"><h3></h3><p></p>' +
                '<a href="contact.html" class="btn-primary lightbox-inquire">Inquire This Service</a></figcaption>' +
                '</figure>' +
                '<button type="button" class="lightbox-next" aria-label="Next photo">&#10095;</button>';
            document.body.appendChild(box);
        }
        var img = qs('.lightbox-img', box);
        var caption = qs('.lightbox-caption', box);
        var capTitle = caption && (qs('h3', caption) || caption.appendChild(document.createElement('h3')));
        var capDesc = caption && (qs('p', caption) || caption.appendChild(document.createElement('p')));
        var closeBtn = qs('.lightbox-close', box);
        var prevBtn = qs('.lightbox-prev', box);
        var nextBtn = qs('.lightbox-next', box);
        if (!img) return;

        var state = { open: false, index: 0, count: 0 };
        var visible = [];
        var lastFocus = null;

        var reduce = function (s, ev) {
            if (Core && Core.lightboxReducer) return Core.lightboxReducer(s, ev);
            var n = s.count;
            switch (ev.type) {
                case 'open': return n > 0 ? { open: true, index: Math.min(Math.max(ev.index, 0), n - 1), count: n } : s;
                case 'close': return { open: false, index: s.index, count: n };
                case 'next': return n > 0 ? { open: s.open, index: (s.index + 1) % n, count: n } : s;
                case 'prev': return n > 0 ? { open: s.open, index: (s.index - 1 + n) % n, count: n } : s;
                default: return s;
            }
        };

        var scopeOf = function (t) { return (t.closest && t.closest('section')) || document; };
        var visibleTiles = function (from) {
            var scope = scopeOf(from);
            return tiles.filter(function (t) { return !t.hidden && scopeOf(t) === scope; });
        };

        var tileImg = function (tile) { return tile.tagName === 'IMG' ? tile : qs('img', tile); };

        var render = function () {
            box.classList.toggle('open', state.open);
            if (!state.open) { document.body.classList.remove('lightbox-open'); return; }
            document.body.classList.add('lightbox-open');
            var tile = visible[state.index];
            if (!tile) return;
            var thumb = tileImg(tile);
            var title = tile.getAttribute('data-title') || (thumb && thumb.getAttribute('alt')) || '';
            var desc = tile.getAttribute('data-desc') || '';
            img.src = tile.getAttribute('data-full') || (thumb && thumb.getAttribute('src')) || '';
            img.alt = (thumb && thumb.getAttribute('alt')) || title;
            if (capTitle) { capTitle.textContent = title; capTitle.hidden = !title; }
            if (capDesc) { capDesc.textContent = desc; capDesc.hidden = !desc; }
            var many = state.count > 1;
            if (prevBtn) prevBtn.hidden = !many;
            if (nextBtn) nextBtn.hidden = !many;
        };

        var send = function (ev) { state = reduce(state, ev); render(); };

        var open = function (tile) {
            visible = visibleTiles(tile);
            var idx = visible.indexOf(tile);
            if (idx < 0) return;
            // Return focus to the tile that opened the viewer. Safari does not focus a <button>
            // on click, so document.activeElement would be <body> there; use the tile itself.
            lastFocus = tile.contains(document.activeElement) ? document.activeElement : tile;
            state = { open: false, index: idx, count: visible.length };
            send({ type: 'open', index: idx });
            if (state.open && closeBtn) closeBtn.focus();
        };

        var close = function () {
            if (!state.open) return;
            send({ type: 'close' });
            img.removeAttribute('src');
            if (lastFocus && lastFocus.focus) lastFocus.focus();
            lastFocus = null;
        };

        tiles.forEach(function (tile) {
            if (!tile.hasAttribute('tabindex') && tile.tagName !== 'BUTTON' && tile.tagName !== 'A') {
                tile.setAttribute('tabindex', '0');
            }
            if (!tile.hasAttribute('role') && tile.tagName !== 'BUTTON' && tile.tagName !== 'A') {
                tile.setAttribute('role', 'button');
            }
            tile.addEventListener('click', function (e) { e.preventDefault(); open(tile); });
            tile.addEventListener('keydown', function (e) {
                if (e.target !== tile) return;
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    open(tile);
                }
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', close);
        if (prevBtn) prevBtn.addEventListener('click', function () { send({ type: 'prev' }); });
        if (nextBtn) nextBtn.addEventListener('click', function () { send({ type: 'next' }); });
        box.addEventListener('click', function (e) { if (e.target === box) close(); });

        document.addEventListener('keydown', function (e) {
            if (!state.open) return;
            if (e.key === 'Escape') { e.preventDefault(); close(); }
            else if (e.key === 'ArrowLeft') { send({ type: 'prev' }); }
            else if (e.key === 'ArrowRight') { send({ type: 'next' }); }
            else if (e.key === 'Tab') {
                var focusable = qsa('button', box).filter(function (b) { return !b.hidden; });
                if (!focusable.length) { e.preventDefault(); return; }
                var first = focusable[0];
                var last = focusable[focusable.length - 1];
                var active = document.activeElement;
                if (!box.contains(active)) { e.preventDefault(); first.focus(); }
                else if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
            }
        });

        // Thin wrappers kept for older inline callers.
        window.openModal = function (element) {
            var tile = element && element.closest ? element.closest('.gallery-item') : null;
            open(tile || element);
        };
        window.closeModal = close;
    })();

    /* ---------- Contact form (WhatsApp) ---------- */
    (function contactForms() {
        var forms = qsa('form[data-whatsapp]');
        if (!forms.length || !Core || !Core.validateForm || !Core.buildWhatsAppUrl) return;
        var FIELDS = ['name', 'email', 'subject', 'message'];

        forms.forEach(function (form) {
            var controls = {};
            FIELDS.forEach(function (key) {
                controls[key] = form.elements[key] || qs('#' + key, form) || null;
            });

            var errorEl = function (key) {
                var field = controls[key];
                if (!field) return null;
                var el = field.id ? document.getElementById(field.id + '-err') : null;
                if (!el && field.parentNode) el = qs('.field-error', field.parentNode);
                if (!el && field.parentNode) {
                    el = document.createElement('span');
                    el.className = 'field-error';
                    if (field.id) el.id = field.id + '-err';
                    field.parentNode.appendChild(el);
                }
                if (el && field.id && !field.getAttribute('aria-describedby')) {
                    field.setAttribute('aria-describedby', el.id || '');
                }
                return el;
            };

            var status = qs('.form-status', form);
            if (!status) {
                status = document.createElement('p');
                status.className = 'form-status';
                form.appendChild(status);
            }
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');

            var clearField = function (key) {
                var el = errorEl(key);
                if (el) el.textContent = '';
                if (controls[key]) controls[key].removeAttribute('aria-invalid');
            };
            FIELDS.forEach(function (key) {
                if (controls[key]) controls[key].addEventListener('input', function () { clearField(key); });
            });

            form.setAttribute('novalidate', '');
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                status.textContent = '';
                var values = {};
                FIELDS.forEach(function (key) { values[key] = controls[key] ? controls[key].value : ''; });

                var result = Core.validateForm(values);
                var firstInvalid = null;
                FIELDS.forEach(function (key) {
                    var el = errorEl(key);
                    var msg = result.errors && result.errors[key];
                    if (msg) {
                        if (el) el.textContent = msg;
                        if (controls[key]) {
                            controls[key].setAttribute('aria-invalid', 'true');
                            if (!firstInvalid) firstInvalid = controls[key];
                        }
                    } else {
                        clearField(key);
                    }
                });
                if (!result.valid) {
                    if (firstInvalid) firstInvalid.focus();
                    return;
                }

                var url = Core.buildWhatsAppUrl(values);
                var win = null;
                try { win = window.open(url, '_blank', 'noopener'); } catch (err) { win = null; }
                status.textContent = '';
                if (win) {
                    status.textContent = 'Opening WhatsApp with your message.';
                } else {
                    var link = document.createElement('a');
                    link.href = url;
                    link.target = '_blank';
                    link.rel = 'noopener';
                    link.textContent = 'Open WhatsApp to send your message';
                    status.appendChild(document.createTextNode('Your browser blocked the new tab. '));
                    status.appendChild(link);
                }
            });
        });
    })();

    /* ---------- Footer copyright ---------- */
    (function copyright() {
        var el = document.getElementById('copyright');
        if (el && Core && Core.copyrightLine) {
            el.textContent = Core.copyrightLine(new Date().getFullYear());
        }
    })();
})();

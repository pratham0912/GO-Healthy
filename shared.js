/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SHARED.JS — GoHealthy Global Scripts
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

(function () {
    'use strict';

    /* ——— Scroll Reveal (IntersectionObserver) ——— */
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    /* ——— Nav Scroll Effect ——— */
    const nav = document.querySelector('.glass-nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    /* ——— Counter Animation ——— */
    window.animateCounter = function (el, target, duration = 2000) {
        let start = 0;
        const step = target / (duration / 16);
        const suffix = el.dataset.suffix || '';
        function update() {
            start += step;
            if (start >= target) {
                el.textContent = target.toLocaleString() + suffix;
                return;
            }
            el.textContent = Math.floor(start).toLocaleString() + suffix;
            requestAnimationFrame(update);
        }
        update();
    };

    // Auto-init counters
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.count);
                    window.animateCounter(entry.target, target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => counterObserver.observe(el));
    }

    /* ——— Chatbase Embed ——— */
    (function () {
        if (!window.chatbase || window.chatbase("getState") !== "initialized") {
            window.chatbase = (...args) => {
                if (!window.chatbase.q) { window.chatbase.q = []; }
                window.chatbase.q.push(args);
            };
        }
        const loadChatbase = () => {
            const s = document.createElement("script");
            s.src = "https://www.chatbase.co/embed.min.js";
            s.id = "2L1-xIZFH1M2w9bX9EDxq";
            s.domain = "www.chatbase.co";
            document.body.appendChild(s);
        };
        window.addEventListener("load", loadChatbase);
    })();

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".open-chatbot").forEach(btn => {
            btn.addEventListener("click", e => {
                e.preventDefault();
                if (window.chatbase) window.chatbase("open");
            });
        });
    });

    /* ——— Smooth Scroll for anchor links ——— */
    // Only target links with actual section IDs (e.g. "#features"), NOT plain "#"
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const hash = anchor.getAttribute('href');
        // Skip plain "#" links — they may be dynamic (modal links, etc.)
        if (!hash || hash === '#') return;
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ——— Toast Notification System ——— */
    let toastContainer = null;
    function ensureToastContainer() {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
    }

    window.showToast = function (message, type = 'success') {
        ensureToastContainer();
        const icons = { success: '<i class="bi bi-check-circle"></i>', warning: '<i class="bi bi-exclamation-triangle"></i>', info: '<i class="bi bi-info-circle"></i>' };
        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        toast.innerHTML = `<span class="toast-icon">${icons[type] || '<i class="bi bi-check-circle"></i>'}</span><span class="toast-text">${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };

    /* ——— Voice Search (Web Speech API) ——— */
    window.initVoiceSearch = function (inputEl, callback) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.log('Speech Recognition not supported');
            return null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = function (event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            if (inputEl) inputEl.value = transcript;
            if (event.results[event.resultIndex].isFinal && callback) {
                callback(transcript);
            }
        };

        recognition.onerror = function (e) {
            console.log('Speech error:', e.error);
            window.showToast('Voice input error. Please try again.', 'warning');
        };

        return recognition;
    };

    /* ——— PDF Generation Utility ——— */
    window.generatePDF = async function (element, filename = 'GoHealthy_Report.pdf') {
        window.showToast('Generating PDF...', 'info');

        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(filename);
            window.showToast('PDF downloaded successfully!', 'success');
        } catch (err) {
            console.error('PDF generation error:', err);
            window.showToast('PDF generation failed. Please try again.', 'warning');
        }
    };

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    /* ——— Dynamic Footer System ——— */
    const FOOTER_CONFIG = [
        {
            title: "Platform",
            links: [
                { name: "Recipes", path: "recipes.html", status: "active" },
                { name: "Meal Planner", path: "Mealplanner.html", status: "active" },
                { name: "Nutri AI", path: "nutriai.html", status: "active" },
                { name: "Dashboard", path: "dashboard.html", status: "active" }
            ]
        },
        {
            title: "Resources",
            links: [
                { name: "Blog", path: "#", status: "coming-soon" },
                { name: "Nutrition Guide", path: "#", status: "coming-soon" },
                { name: "API Docs", path: "#", status: "coming-soon" },
                { name: "Help Center", path: "#", status: "coming-soon" }
            ]
        },
        {
            title: "Company",
            links: [
                { name: "About Us", path: "#", status: "coming-soon" },
                { name: "Careers", path: "#", status: "coming-soon" },
                { name: "Privacy", path: "#", status: "coming-soon" },
                { name: "Terms", path: "#", status: "coming-soon" }
            ]
        },
        {
            title: "Contact",
            links: [
                { name: "hello@gohealthy.app", path: "mailto:hello@gohealthy.app", status: "active" },
                { name: "Support", path: "#", status: "coming-soon" },
                { name: "Feedback", path: "#", status: "coming-soon" }
            ]
        }
    ];

    function renderFooter() {
        const footer = document.getElementById('mainFooter');
        if (!footer) return;

        let linksHTML = '';
        FOOTER_CONFIG.forEach(col => {
            let colLinks = col.links.map(link => {
                if (link.status === 'coming-soon') {
                    return `<a href="#" class="coming-soon-link"><span class="link-text">${link.name}</span><span class="coming-soon-badge">Soon</span></a>`;
                }
                return `<a href="${link.path}">${link.name}</a>`;
            }).join('');

            linksHTML += `
                <div class="col-6 col-lg-2">
                    <h6>${col.title}</h6>
                    ${colLinks}
                </div>
            `;
        });

        footer.innerHTML = `
            <div class="container">
                <div class="row g-4">
                    <div class="col-lg-4 mb-4 mb-lg-0">
                        <div class="d-flex align-items-center gap-2 mb-3">
                            <i class="bi bi-heart-pulse-fill" style="color: var(--neon-green); font-size: 1.5rem;"></i>
                            <span class="footer-brand">Go<span class="text-gradient">Healthy</span></span>
                        </div>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 300px; line-height: 1.7;">
                            AI-powered nutrition platform helping you eat smarter, plan better, and live your healthiest life.
                        </p>
                        <div class="d-flex gap-3 mt-3">
                            <a href="#" class="icon-circle green" style="width: 40px; height: 40px; font-size: 1rem;"><i class="bi bi-twitter-x"></i></a>
                            <a href="#" class="icon-circle green" style="width: 40px; height: 40px; font-size: 1rem;"><i class="bi bi-instagram"></i></a>
                            <a href="#" class="icon-circle green" style="width: 40px; height: 40px; font-size: 1rem;"><i class="bi bi-github"></i></a>
                        </div>
                    </div>
                    ${linksHTML}
                </div>
                <div class="footer-bottom text-center">
                    <p class="mb-0">© 2026 GoHealthy. Made with <i class="bi bi-heart-fill" style="color: var(--neon-green);"></i> for a healthier world.</p>
                </div>
            </div>
        `;

        // Attach event listeners for coming soon links
        footer.querySelectorAll('.coming-soon-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.showToast) {
                    window.showToast('This feature is under development 🚧', 'info');
                }
            });
        });
    }

    // Auto-render footer on load
    document.addEventListener("DOMContentLoaded", renderFooter);

})();

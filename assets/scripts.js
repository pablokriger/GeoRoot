// ============================================================
//  GeoRoot - Scripts compartidos (internacionalización, cookies, etc.)
// ============================================================

(function () {
    'use strict';

    // === CONFIGURACIÓN ===
    const AVAILABLE_LANGS = ['es', 'en', 'de', 'pt'];
    const DEFAULT_LANG = 'es';
    const LANG_PATH = 'https://pablokriger.github.io/GeoRoot/lang/';
    let currentLang = DEFAULT_LANG;
    let translations = {};

    // === ELEMENTOS DEL DOM ===
    function getLangBtn() {
        return document.getElementById('langDropdown');
    }
    function getCookieBanner() {
        return document.getElementById('cookieBanner');
    }
    function getAcceptBtn() {
        return document.getElementById('acceptCookies');
    }
    function getCloseBtn() {
        return document.getElementById('closeCookieBanner');
    }

    // === COOKIE BANNER ===
    let cookieBannerInitialized = false;

    function hasConsent() {
        try {
            return localStorage.getItem('geoRoot_cookie_consent') === 'accepted';
        } catch (e) {
            return false;
        }
    }

    function setCookieConsent() {
        try {
            localStorage.setItem('geoRoot_cookie_consent', 'accepted');
            localStorage.setItem('geoRoot_cookie_consent_date', new Date().toISOString());
        } catch (e) { }
    }

    function initCookieBanner() {
        const banner = getCookieBanner();
        const acceptBtn = getAcceptBtn();
        const closeBtn = getCloseBtn();

        // Si no hay banner, no hacemos nada.
        if (!banner) return;

        // Si ya tiene consentimiento, ocultar y salir.
        if (hasConsent()) {
            banner.style.display = 'none';
            return;
        }

        // Si ya se inicializó antes, no volver a asignar eventos.
        if (cookieBannerInitialized) return;

        // Función para ocultar y guardar consentimiento
        function hideBanner() {
            banner.classList.add('hidden-banner');
            setTimeout(function () {
                if (banner.parentNode) {
                    banner.parentNode.removeChild(banner);
                }
            }, 500);
            setCookieConsent();
        }

        if (acceptBtn) {
            acceptBtn.addEventListener('click', hideBanner);
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', hideBanner);
        }

        cookieBannerInitialized = true;
    }

    // === SUBMENÚS MÓVILES ===
    function initMobileSubmenus() {
        document.querySelectorAll('.dropdown-submenu > a').forEach(function (submenuLink) {
            submenuLink.removeEventListener('click', handleSubmenuClick);
            submenuLink.addEventListener('click', handleSubmenuClick);
        });
    }

    function handleSubmenuClick(e) {
        if (window.innerWidth < 992) {
            e.preventDefault();
            e.stopPropagation();
            const parentLi = this.closest('.dropdown-submenu');
            if (parentLi) {
                parentLi.classList.toggle('show');
            }
        }
    }

    // === INTERNACIONALIZACIÓN ===
    function loadLanguage(lang) {
        const url = LANG_PATH + lang + '.json';
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                translations = data;
                currentLang = lang;
                try {
                    localStorage.setItem('geoRoot_preferred_lang', lang);
                } catch (ex) { }
                updateLangButton(lang);
                applyTranslations();
                document.documentElement.lang = lang;
            })
            .catch(error => {
                console.warn('Error cargando idioma:', error);
            });
    }

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            const key = el.getAttribute('data-i18n');
            if (translations[key]) {
                if (translations[key].includes('<')) {
                    el.innerHTML = translations[key];
                } else {
                    el.textContent = translations[key];
                }
            }
        });
    }

    function updateLangButton(lang) {
        const langBtn = getLangBtn();
        if (!langBtn) return;
        const langItem = document.querySelector(`.lang-menu .dropdown-item[data-lang="${lang}"]`);
        if (langItem) {
            const flagSpan = langItem.querySelector('.lang-flag');
            if (flagSpan) {
                langBtn.innerHTML = flagSpan.outerHTML;
            }
        }
    }

    function initLanguageSelector() {
        const langBtn = getLangBtn();
        if (!langBtn) return;

        try {
            const savedLang = localStorage.getItem('geoRoot_preferred_lang');
            if (savedLang && AVAILABLE_LANGS.includes(savedLang)) {
                currentLang = savedLang;
            }
        } catch (ex) { }

        document.querySelectorAll('.lang-menu .dropdown-item').forEach(function (item) {
            item.removeEventListener('click', handleLangClick);
            item.addEventListener('click', handleLangClick);
        });

        updateLangButton(currentLang);
        loadLanguage(currentLang);
    }

    function handleLangClick(e) {
        e.preventDefault();
        const lang = this.getAttribute('data-lang');
        if (lang && AVAILABLE_LANGS.includes(lang) && lang !== currentLang) {
            loadLanguage(lang);
        }
        const langBtn = getLangBtn();
        if (langBtn) {
            const dropdown = bootstrap.Dropdown.getInstance(langBtn);
            if (dropdown) {
                dropdown.hide();
            }
        }
    }

    // === INICIALIZACIÓN ===
    function initApp() {
        // El cookie banner se inicializa después de cargar el footer (ver llamada al final del fetch del footer)
        initMobileSubmenus();
        initLanguageSelector();
    }

    // Exponer funciones globalmente
    window.initApp = initApp;
    window.applyTranslations = applyTranslations;
    window.loadLanguage = loadLanguage;
    window.currentLang = currentLang;
    window.initCookieBanner = initCookieBanner;

    // Si el DOM ya está cargado, ejecutar initApp (por si acaso)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    }

})();

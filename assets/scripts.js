// ============================================================
//  GeoRoot - Scripts compartidos (internacionalización, cookies, etc.)
//  Se carga una vez desde cada página después de insertar el header.
// ============================================================

(function () {
    'use strict';

    // === CONFIGURACIÓN ===
    const AVAILABLE_LANGS = ['es', 'en', 'de', 'pt'];
    const DEFAULT_LANG = 'es';
    const LANG_PATH = 'https://pablokriger.github.io/GeoRoot/lang/'; // Ajusta si es necesario
    let currentLang = DEFAULT_LANG;
    let translations = {};

    // === ELEMENTOS DEL DOM (se buscan cuando se necesitan) ===
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
    function initCookieBanner() {
        const banner = getCookieBanner();
        const acceptBtn = getAcceptBtn();
        const closeBtn = getCloseBtn();

        function hideBanner() {
            if (banner) {
                banner.classList.add('hidden-banner');
                setTimeout(function () {
                    if (banner.parentNode) {
                        banner.parentNode.removeChild(banner);
                    }
                }, 500);
            }
        }

        function setCookieConsent() {
            try {
                localStorage.setItem('geoRoot_cookie_consent', 'accepted');
                localStorage.setItem('geoRoot_cookie_consent_date', new Date().toISOString());
            } catch (e) { }
        }

        function hasConsent() {
            try {
                return localStorage.getItem('geoRoot_cookie_consent') === 'accepted';
            } catch (e) {
                return false;
            }
        }

        // Si ya hay consentimiento, ocultar banner
        if (hasConsent() && banner) {
            banner.style.display = 'none';
            return;
        }

        // Asignar eventos si los botones existen
        if (acceptBtn) {
            acceptBtn.addEventListener('click', function () {
                setCookieConsent();
                hideBanner();
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                setCookieConsent();
                hideBanner();
            });
        }
    }

    // === SUBMENÚS MÓVILES ===
    function initMobileSubmenus() {
        document.querySelectorAll('.dropdown-submenu > a').forEach(function (submenuLink) {
            // Remover listeners previos para evitar duplicados
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

        // Cargar preferencia guardada
        try {
            const savedLang = localStorage.getItem('geoRoot_preferred_lang');
            if (savedLang && AVAILABLE_LANGS.includes(savedLang)) {
                currentLang = savedLang;
            }
        } catch (ex) { }

        // Asignar eventos a las opciones del dropdown
        document.querySelectorAll('.lang-menu .dropdown-item').forEach(function (item) {
            item.removeEventListener('click', handleLangClick);
            item.addEventListener('click', handleLangClick);
        });

        // Cargar idioma inicial
        updateLangButton(currentLang);
        loadLanguage(currentLang);
    }

    function handleLangClick(e) {
        e.preventDefault();
        const lang = this.getAttribute('data-lang');
        if (lang && AVAILABLE_LANGS.includes(lang) && lang !== currentLang) {
            loadLanguage(lang);
        }
        // Cerrar dropdown
        const langBtn = getLangBtn();
        if (langBtn) {
            const dropdown = bootstrap.Dropdown.getInstance(langBtn);
            if (dropdown) {
                dropdown.hide();
            }
        }
    }

    // === INICIALIZACIÓN COMPLETA (se llama después de cargar header y footer) ===
    function initApp() {
        initCookieBanner();
        initMobileSubmenus();
        initLanguageSelector();
    }

    // Exponer funciones globalmente para que puedan ser llamadas desde los includes
    window.initApp = initApp;
    window.applyTranslations = applyTranslations;
    window.loadLanguage = loadLanguage;
    window.currentLang = currentLang;

    // Si el DOM ya está cargado, ejecutar initApp (por si se carga el script después del header)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // Si el script se carga después de que el DOM esté listo (ej. mediante fetch)
        // esperamos un poco para asegurar que header y footer estén insertados.
        // Pero como se llama desde el index después de insertar el header, podemos ejecutar directamente.
        // Sin embargo, lo dejamos como función para que se llame explícitamente desde el index.
        // initApp(); // No ejecutamos automáticamente, lo llamará el index después de cargar footer también.
    }

})();
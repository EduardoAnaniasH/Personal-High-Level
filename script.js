// ===== PERFORMANCE OPTIMIZATIONS =====
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

// ===== COUNTDOWN TIMER (VERSÃO CORRIGIDA) =====
let countdownInterval;

function initCountdown() {
    // Seleciona os elementos de ambos os timers
    const elementsDesktop = {
        hours: document.getElementById('hours-desktop'),
        minutes: document.getElementById('minutes-desktop'),
        seconds: document.getElementById('seconds-desktop'),
    };
    const elementsMobile = {
        hours: document.getElementById('hours-mobile'),
        minutes: document.getElementById('minutes-mobile'),
        seconds: document.getElementById('seconds-mobile'),
    };

    // Agrupa os elementos correspondentes
    const timerElements = {
        hours: [elementsDesktop.hours, elementsMobile.hours].filter(Boolean),
        minutes: [elementsDesktop.minutes, elementsMobile.minutes].filter(Boolean),
        seconds: [elementsDesktop.seconds, elementsMobile.seconds].filter(Boolean),
    };

    // Verifica se pelo menos um conjunto de timers existe
    if (timerElements.hours.length === 0) return;

    let totalSeconds = 35 * 60 + 59; // 35 minutos e 59 segundos

    function updateTimer() {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Atualiza todos os elementos de hora, minuto e segundo
        timerElements.hours.forEach(el => el.textContent = hours.toString().padStart(2, '0'));
        timerElements.minutes.forEach(el => el.textContent = minutes.toString().padStart(2, '0'));
        timerElements.seconds.forEach(el => el.textContent = seconds.toString().padStart(2, '0'));

        const allElements = [...timerElements.hours, ...timerElements.minutes, ...timerElements.seconds];

        // Adiciona ou remove a classe de piscar
        if (totalSeconds <= 300) { // Últimos 5 minutos
            allElements.forEach(el => el.classList.add('blinking'));
        } else {
            allElements.forEach(el => el.classList.remove('blinking'));
        }

        if (totalSeconds < 0) {
            clearInterval(countdownInterval);
            // Reinicia o processo
            initCountdown(); // Chama a função novamente para reiniciar
            return;
        }

        totalSeconds--;
    }

    // Limpa qualquer intervalo anterior para evitar múltiplos contadores
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    updateTimer(); // Chama uma vez para não haver atraso
    countdownInterval = setInterval(updateTimer, 1000);
}


// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

let observer;
if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
}

// ===== SCROLL FUNCTIONALITIES =====
function initScrollFunctionalities() {
    const scrollToTop = document.querySelector('.scroll-to-top');
    const allTimers = document.querySelectorAll('.desktop-timer, .mobile-timer');

    let scrollStopTimer; // Timer para detectar quando a rolagem para
    let isMouseOverTimer = false; // Flag para saber se o cursor está sobre o timer

    const handleScroll = () => {
        const scrollTop = window.pageYOffset;

        // --- Lógica para o botão "Voltar ao Topo" (permanece a mesma) ---
        if (scrollToTop) {
            if (scrollTop > 500) {
                scrollToTop.classList.add('visible');
            } else {
                scrollToTop.classList.remove('visible');
            }
        }

        // --- Lógica para os Timers ---
        clearTimeout(scrollStopTimer);

        if (scrollTop > 200) {
            allTimers.forEach(timer => timer.classList.add('visible'));

            // Só define o timer para desaparecer se o rato não estiver sobre ele
            if (!isMouseOverTimer) {
                scrollStopTimer = setTimeout(() => {
                    allTimers.forEach(timer => timer.classList.remove('visible'));
                }, 3000); // Banners desaparecem após 3s de inatividade
            }
        } else {
            allTimers.forEach(timer => timer.classList.remove('visible'));
        }
    };

    // Otimiza o evento de scroll para melhor performance
    const throttledScrollHandler = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });

    // Event listeners para o botão "Voltar ao Topo" (permanecem os mesmos)
    if (scrollToTop) {
        scrollToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        scrollToTop.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // Adiciona event listeners para manter o timer visível durante a interação
    allTimers.forEach(timer => {
        // Quando o rato entra na área do banner, cancela o temporizador e define a flag.
        timer.addEventListener('mouseenter', () => {
            isMouseOverTimer = true;
            clearTimeout(scrollStopTimer);
        });

        // Quando o rato sai, reinicia o temporizador e redefine a flag.
        timer.addEventListener('mouseleave', () => {
            isMouseOverTimer = false;
            scrollStopTimer = setTimeout(() => {
                timer.classList.remove('visible');
            }, 3000);
        });
    });
}


// ===== IMAGE LAZY LOADING =====
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }
}

// ===== ERROR HANDLING FOR IMAGES =====
function initImageErrorHandling() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function () {
            console.warn('Failed to load image:', img.src);
            // Fallback to a placeholder
            const width = this.getAttribute('width') || 400;
            const height = this.getAttribute('height') || 300;
            this.src = `https://via.placeholder.com/${width}x${height}/1a1a1a/cccccc?text=Imagem+Indisponível`;
        });
    });
}

// ===== ANALYTICS TRACKING =====
function trackEvent(eventName, eventData = {}) {
    // Placeholder for analytics integration
    console.log('Event tracked:', eventName, eventData);

    // Google Analytics 4 example:
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', eventName, eventData);
    // }
}

function initAnalytics() {
    // Track CTA button clicks
    document.querySelectorAll('.btn-primary, .purchase-btn, .timer-cta-btn, .timer-cta-btn-mobile').forEach(btn => {
        btn.addEventListener('click', function () {
            trackEvent('cta_click', {
                button_text: this.textContent.trim(),
                button_location: this.closest('section, .discount-timer-banner')?.className || 'unknown'
            });
        });
    });

    // Track scroll depth
    let maxScroll = 0;
    const trackScrollDepth = throttle(() => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll % 25 === 0 && maxScroll <= 100) {
                trackEvent('scroll_depth', {
                    percent: maxScroll
                });
            }
        }
    }, 1000);

    window.addEventListener('scroll', trackScrollDepth, {
        passive: true
    });
}

// ===== ACCESSIBILITY IMPROVEMENTS =====
function initAccessibility() {
    // Keyboard navigation for custom elements
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close any modals or overlays
            document.querySelectorAll('.modal, .overlay').forEach(el => {
                el.classList.remove('active');
            });
        }
    });

    // Focus management for skip links
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(skipLink.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }

    // Improve focus visibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

// ===== FAQ ACCORDION LOGIC =====
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-accordion .faq-item');
    faqItems.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.open) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });
}

// ===== SWIPER CAROUSEL LOGIC =====
function initSwiperCarousel() {
    if (document.querySelector('.swiper')) {
        const swiper = new Swiper('.swiper', {
            // Configurações do Swiper
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            grabCursor: true,
            
            // Navegação (Setas)
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            
            // Paginação (Pontos)
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },

            // Slides visíveis e responsividade
            breakpoints: {
                // Mobile
                320: {
                    slidesPerView: 1.2,
                    spaceBetween: 15
                },
                // Tablet
                768: {
                    slidesPerView: 2,
                    spaceBetween: 20
                },
                // Desktop
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30
                },
                // Desktop Grande
                1400: {
                    slidesPerView: 4,
                    spaceBetween: 30
                }
            }
        });
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initCountdown();
    initScrollFunctionalities();
    initLazyLoading();
    initImageErrorHandling();
    initAnalytics();
    initAccessibility();
    initFaqAccordion();
    initSwiperCarousel(); // Adicionado o carrossel

    // Initialize intersection observer for animations
    if (observer) {
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('visible');
        });
    }
});

// ===== CLEANUP ON PAGE UNLOAD =====
window.addEventListener('beforeunload', () => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    if (observer) {
        observer.disconnect();
    }
});

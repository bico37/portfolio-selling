/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ONYX DIGITAL - Premium Animation Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * High-End Agency Animation Framework
 * Optimiert für Desktop-Impact & Mobile-Performance
 * 
 * @author Onyx Digital
 * @version 2.0.0
 * @requires GSAP 3.12+, ScrollTrigger
 * 
 * Performance-Ziele:
 * - Lighthouse Score: 96+
 * - First Contentful Paint: < 1.5s
 * - Nur GPU-beschleunigte Properties (transform, opacity)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const CONFIG = {
    // Breakpoints
    breakpoints: {
      mobile: '(max-width: 768px)',
      desktop: '(min-width: 769px)'
    },
    
    // Animation Timings
    duration: {
      fast: 0.4,
      normal: 0.8,
      slow: 1.2,
      hero: 1.5
    },
    
    // Easing Functions
    ease: {
      smooth: 'power3.out',
      bounce: 'back.out(1.4)',
      elastic: 'elastic.out(1, 0.5)',
      expo: 'expo.out',
      power4: 'power4.out'
    },
    
    // ScrollTrigger Defaults
    scrollTrigger: {
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    
    // Movement Distances (Desktop)
    distance: {
      desktop: {
        small: 30,
        medium: 50,
        large: 80,
        hero: 100
      },
      mobile: {
        small: 15,
        medium: 25,
        large: 40,
        hero: 50
      }
    },
    
    // Stagger Values
    stagger: {
      fast: 0.08,
      normal: 0.15,
      slow: 0.25
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Split text into individual lines or words for animation
   * @param {HTMLElement} element - Target element
   * @param {string} type - 'lines' | 'words' | 'chars'
   * @returns {HTMLElement[]} Array of wrapped elements
   */
  function splitText(element, type = 'lines') {
    if (!element) return [];
    
    const text = element.innerHTML;
    element.setAttribute('data-original-text', text);
    
    if (type === 'words') {
      const words = text.split(/\s+/);
      element.innerHTML = words
        .map(word => `<span class="split-word" style="display: inline-block; will-change: transform, opacity;">${word}</span>`)
        .join(' ');
      return Array.from(element.querySelectorAll('.split-word'));
    }
    
    if (type === 'lines') {
      // Für mehrzeilige Texte mit <br> Tags
      const lines = text.split(/<br\s*\/?>/gi);
      element.innerHTML = lines
        .map(line => `<span class="split-line" style="display: block; will-change: transform, opacity; overflow: hidden;"><span class="split-line-inner" style="display: block;">${line.trim()}</span></span>`)
        .join('');
      return Array.from(element.querySelectorAll('.split-line-inner'));
    }
    
    return [];
  }

  /**
   * Restore original text content
   * @param {HTMLElement} element - Target element
   */
  function restoreText(element) {
    if (!element) return;
    const original = element.getAttribute('data-original-text');
    if (original) {
      element.innerHTML = original;
      element.removeAttribute('data-original-text');
    }
  }

  /**
   * Check if device is touch-enabled
   * @returns {boolean}
   */
  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get distance values based on screen size
   * @param {boolean} isMobile - Mobile device check
   * @returns {Object} Distance configuration
   */
  function getDistance(isMobile) {
    return isMobile ? CONFIG.distance.mobile : CONFIG.distance.desktop;
  }

  /**
   * Add will-change property for performance
   * @param {HTMLElement|HTMLElement[]} elements - Target elements
   */
  function addWillChange(elements) {
    const els = Array.isArray(elements) ? elements : [elements];
    els.forEach(el => {
      if (el) el.style.willChange = 'transform, opacity';
    });
  }

  /**
   * Remove will-change property after animation
   * @param {HTMLElement|HTMLElement[]} elements - Target elements
   */
  function removeWillChange(elements) {
    const els = Array.isArray(elements) ? elements : [elements];
    els.forEach(el => {
      if (el) el.style.willChange = 'auto';
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN ANIMATION ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  function initAnimations() {
    // Prüfe ob GSAP verfügbar ist
    if (!window.gsap) {
      console.warn('GSAP nicht geladen - Animationen deaktiviert');
      document.body.classList.add('loaded');
      return;
    }

    const { gsap } = window;
    
    // Registriere ScrollTrigger Plugin
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    } else {
      console.warn('ScrollTrigger nicht geladen');
      document.body.classList.add('loaded');
      return;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GSAP CONTEXT - Memory Leak Prevention
    // ═══════════════════════════════════════════════════════════════════════
    
    const ctx = gsap.context(() => {
      
      // ═════════════════════════════════════════════════════════════════════
      // GSAP MATCH MEDIA - Responsive Animations
      // ═════════════════════════════════════════════════════════════════════
      
      const mm = gsap.matchMedia();

      // ─────────────────────────────────────────────────────────────────────
      // DESKTOP ANIMATIONS (min-width: 769px)
      // ─────────────────────────────────────────────────────────────────────
      
      mm.add(CONFIG.breakpoints.desktop, () => {
        const dist = getDistance(false);
        
        console.log('🖥️ Desktop Animations initialisiert');

        // ═══════════════════════════════════════════════════════════════════
        // SECTION 1: HERO ANIMATION SEQUENCE
        // ═══════════════════════════════════════════════════════════════════
        
        initHeroDesktop(gsap, dist);
        
        // ═══════════════════════════════════════════════════════════════════
        // SECTION 2: SCROLL-TRIGGERED REVEALS
        // ═══════════════════════════════════════════════════════════════════
        
        initScrollRevealsDesktop(gsap, dist);
        
        // ═══════════════════════════════════════════════════════════════════
        // SECTION 3: SERVICE CARDS BATCH ANIMATION
        // ═══════════════════════════════════════════════════════════════════
        
        initServiceCardsDesktop(gsap, dist);
        
        // ═══════════════════════════════════════════════════════════════════
        // SECTION 4: PARALLAX & FLOATING ELEMENTS
        // ═══════════════════════════════════════════════════════════════════
        
        initParallaxDesktop(gsap, dist);
        
        // ═══════════════════════════════════════════════════════════════════
        // SECTION 5: SPECIAL EFFECTS
        // ═══════════════════════════════════════════════════════════════════
        
        initSpecialEffectsDesktop(gsap, dist);
        
        // Cleanup function für Desktop
        return () => {
          console.log('🖥️ Desktop Animations cleanup');
        };
      });

      // ─────────────────────────────────────────────────────────────────────
      // MOBILE ANIMATIONS (max-width: 768px)
      // ─────────────────────────────────────────────────────────────────────
      
      mm.add(CONFIG.breakpoints.mobile, () => {
        const dist = getDistance(true);
        
        console.log('📱 Mobile Animations initialisiert');

        // ═══════════════════════════════════════════════════════════════════
        // MOBILE: SIMPLIFIED HERO
        // ═══════════════════════════════════════════════════════════════════
        
        initHeroMobile(gsap, dist);
        
        // ═══════════════════════════════════════════════════════════════════
        // MOBILE: BASIC SCROLL REVEALS
        // ═══════════════════════════════════════════════════════════════════
        
        initScrollRevealsMobile(gsap, dist);
        
        // ═══════════════════════════════════════════════════════════════════
        // MOBILE: SIMPLIFIED CARDS
        // ═══════════════════════════════════════════════════════════════════
        
        initServiceCardsMobile(gsap, dist);
        
        // Cleanup function für Mobile
        return () => {
          console.log('📱 Mobile Animations cleanup');
        };
      });

      // ─────────────────────────────────────────────────────────────────────
      // UNIVERSAL ANIMATIONS (All Breakpoints)
      // ─────────────────────────────────────────────────────────────────────
      
      initUniversalAnimations(gsap);

    }); // Ende gsap.context

    // Speichere Context für späteren Cleanup
    window.onyxAnimationContext = ctx;

    // Body loaded class setzen
    requestAnimationFrame(() => {
      document.body.classList.add('loaded');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DESKTOP ANIMATION MODULES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Hero Section - Desktop
   * Komplexe Eingangsanimation mit Split-Text und Stagger
   */
  function initHeroDesktop(gsap, dist) {
    const heroSection = document.querySelector('section:first-of-type');
    if (!heroSection) return;

    // Elemente selektieren
    const badge = heroSection.querySelector('.inline-flex.rounded-full');
    const headline = heroSection.querySelector('h1');
    const description = heroSection.querySelector('p.text-lg');
    const ctaButtons = heroSection.querySelector('.flex.flex-col.sm\\:flex-row');
    const browserMockup = heroSection.querySelector('.relative.max-w-4xl');
    const codeCard = heroSection.querySelector('[class*="-rotate-6"]');
    const statsCard = heroSection.querySelector('.animate-bounce');
    const glowElements = heroSection.querySelectorAll('.blur-\\[100px\\], .blur-\\[80px\\]');

    // Will-change für Performance
    addWillChange([badge, headline, description, ctaButtons, browserMockup, codeCard, statsCard]);

    // ─────────────────────────────────────────────────────────────────────
    // HEADLINE SPLIT-TEXT ANIMATION
    // ─────────────────────────────────────────────────────────────────────
    
    let headlineLines = [];
    if (headline) {
      headlineLines = splitText(headline, 'lines');
      // Initial state setzen
      gsap.set(headlineLines, { 
        y: dist.hero, 
        opacity: 0,
        rotationX: -15
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // MASTER TIMELINE
    // ─────────────────────────────────────────────────────────────────────
    
    const heroTl = gsap.timeline({
      defaults: { 
        ease: CONFIG.ease.power4, 
        duration: CONFIG.duration.slow 
      },
      onComplete: () => {
        // Will-change entfernen nach Animation
        removeWillChange([badge, headline, description, ctaButtons, browserMockup]);
      }
    });

    // Animation Sequence
    heroTl
      // 1. Background Glow Elements fade in
      .fromTo(glowElements, 
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: CONFIG.duration.hero, ease: CONFIG.ease.expo },
        0
      )
      
      // 2. Badge slides in from top
      .fromTo(badge,
        { y: -dist.medium, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: CONFIG.duration.normal, ease: CONFIG.ease.bounce },
        0.2
      )
      
      // 3. Headline lines stagger in
      .to(headlineLines, {
        y: 0,
        opacity: 1,
        rotationX: 0,
        stagger: CONFIG.stagger.normal,
        duration: CONFIG.duration.slow,
        ease: CONFIG.ease.power4
      }, 0.4)
      
      // 4. Description fades up
      .fromTo(description,
        { y: dist.small, opacity: 0 },
        { y: 0, opacity: 1, duration: CONFIG.duration.normal },
        '-=0.6'
      )
      
      // 5. CTA Buttons appear
      .fromTo(ctaButtons,
        { y: dist.small, opacity: 0 },
        { y: 0, opacity: 1, duration: CONFIG.duration.normal },
        '-=0.4'
      )
      
      // 6. Browser Mockup scales in
      .fromTo(browserMockup,
        { scale: 0.85, opacity: 0, y: dist.medium },
        { scale: 1, opacity: 1, y: 0, duration: CONFIG.duration.hero, ease: CONFIG.ease.expo },
        '-=0.6'
      )
      
      // 7. Code Card slides in from left
      .fromTo(codeCard,
        { x: -dist.large, opacity: 0, rotation: -12 },
        { x: 0, opacity: 1, rotation: -6, duration: CONFIG.duration.slow, ease: CONFIG.ease.bounce },
        '-=0.8'
      )
      
      // 8. Stats Card pops in
      .fromTo(statsCard,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: CONFIG.duration.normal, ease: CONFIG.ease.elastic },
        '-=0.4'
      );

    // ─────────────────────────────────────────────────────────────────────
    // BROWSER MOCKUP PARALLAX ON SCROLL
    // ─────────────────────────────────────────────────────────────────────
    
    if (browserMockup) {
      gsap.to(browserMockup, {
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5
        },
        scale: 0.95,
        y: -30,
        ease: 'none'
      });
    }
  }

  /**
   * Scroll Reveals - Desktop
   * Split-Text für alle H2 Headlines
   */
  function initScrollRevealsDesktop(gsap, dist) {
    
    // ─────────────────────────────────────────────────────────────────────
    // H2 HEADLINES MIT SPLIT-TEXT EFFECT
    // ─────────────────────────────────────────────────────────────────────
    
    const sectionHeadlines = document.querySelectorAll('section:not(:first-of-type) h2');
    
    sectionHeadlines.forEach(headline => {
      const lines = splitText(headline, 'lines');
      
      if (lines.length === 0) return;
      
      // Initial state
      gsap.set(lines, { 
        y: dist.medium, 
        opacity: 0 
      });
      
      // ScrollTrigger Animation
      gsap.to(lines, {
        scrollTrigger: {
          trigger: headline,
          start: CONFIG.scrollTrigger.start,
          toggleActions: CONFIG.scrollTrigger.toggleActions
        },
        y: 0,
        opacity: 1,
        stagger: CONFIG.stagger.fast,
        duration: CONFIG.duration.normal,
        ease: CONFIG.ease.smooth
      });
    });

    // ─────────────────────────────────────────────────────────────────────
    // SECTION DESCRIPTIONS FADE IN
    // ─────────────────────────────────────────────────────────────────────
    
    const sectionDescriptions = document.querySelectorAll('section:not(:first-of-type) .text-center p, section:not(:first-of-type) > div > p.text-slate-200');
    
    sectionDescriptions.forEach(desc => {
      gsap.fromTo(desc,
        { y: dist.small, opacity: 0 },
        {
          scrollTrigger: {
            trigger: desc,
            start: CONFIG.scrollTrigger.start,
            toggleActions: CONFIG.scrollTrigger.toggleActions
          },
          y: 0,
          opacity: 1,
          duration: CONFIG.duration.normal,
          ease: CONFIG.ease.smooth
        }
      );
    });

    // ─────────────────────────────────────────────────────────────────────
    // ABOUT SECTION SPECIAL ANIMATION
    // ─────────────────────────────────────────────────────────────────────
    
    const aboutSection = document.querySelector('#ueber-mich');
    if (aboutSection) {
      const imageWrapper = aboutSection.querySelector('.relative.group');
      const contentBlocks = aboutSection.querySelectorAll('.space-y-6 p, .grid.grid-cols-2 > div');
      
      // Image reveal with glow
      if (imageWrapper) {
        gsap.fromTo(imageWrapper,
          { x: -dist.large, opacity: 0, scale: 0.9 },
          {
            scrollTrigger: {
              trigger: aboutSection,
              start: 'top 75%',
              toggleActions: CONFIG.scrollTrigger.toggleActions
            },
            x: 0,
            opacity: 1,
            scale: 1,
            duration: CONFIG.duration.slow,
            ease: CONFIG.ease.expo
          }
        );
      }
      
      // Content stagger
      if (contentBlocks.length) {
        gsap.fromTo(contentBlocks,
          { y: dist.medium, opacity: 0 },
          {
            scrollTrigger: {
              trigger: aboutSection,
              start: 'top 70%',
              toggleActions: CONFIG.scrollTrigger.toggleActions
            },
            y: 0,
            opacity: 1,
            stagger: CONFIG.stagger.normal,
            duration: CONFIG.duration.normal,
            ease: CONFIG.ease.smooth
          }
        );
      }
    }

    // ─────────────────────────────────────────────────────────────────────
    // CONTACT FORM REVEAL - als Ganzes
    // ─────────────────────────────────────────────────────────────────────
    
    const contactSection = document.querySelector('#kontakt');
    if (contactSection) {
      const formWrapper = contactSection.querySelector('.bg-slate-900.border');
      
      // Formular als Ganzes animieren
      if (formWrapper) {
        gsap.fromTo(formWrapper,
          { y: dist.large, opacity: 0, scale: 0.97 },
          {
            scrollTrigger: {
              trigger: contactSection,
              start: 'top 75%',
              toggleActions: CONFIG.scrollTrigger.toggleActions
            },
            y: 0,
            opacity: 1,
            scale: 1,
            duration: CONFIG.duration.slow,
            ease: CONFIG.ease.expo
          }
        );
      }
    }
  }

  /**
   * Service Cards - Desktop
   * ScrollTrigger.batch() mit 3D-Tilt Effect
   */
  function initServiceCardsDesktop(gsap, dist) {
    
    // ─────────────────────────────────────────────────────────────────────
    // VORTEILE SECTION - BENEFIT CARDS BATCH
    // ─────────────────────────────────────────────────────────────────────
    
    const benefitCards = gsap.utils.toArray('#vorteile .group');
    
    if (benefitCards.length) {
      // Initial state
      gsap.set(benefitCards, { 
        y: dist.large, 
        opacity: 0,
        rotationY: -5,
        transformPerspective: 1000
      });
      
      ScrollTrigger.batch(benefitCards, {
        start: 'top 88%',
        onEnter: batch => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            rotationY: 0,
            stagger: CONFIG.stagger.normal,
            duration: CONFIG.duration.normal,
            ease: CONFIG.ease.bounce,
            overwrite: true
          });
        },
        onLeaveBack: batch => {
          gsap.to(batch, {
            y: dist.medium,
            opacity: 0,
            rotationY: -5,
            stagger: CONFIG.stagger.fast,
            duration: CONFIG.duration.fast,
            ease: CONFIG.ease.smooth,
            overwrite: true
          });
        }
      });
      
      // 3D Tilt Effect on Hover
      benefitCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.02,
            rotationY: 3,
            duration: CONFIG.duration.fast,
            ease: CONFIG.ease.smooth
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            rotationY: 0,
            duration: CONFIG.duration.fast,
            ease: CONFIG.ease.smooth
          });
        });
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // LEISTUNGEN SECTION - PRICING CARDS (alle 4 gleichzeitig)
    // ─────────────────────────────────────────────────────────────────────
    
    const pricingGrid = document.querySelector('#leistungen .grid');
    const pricingCards = gsap.utils.toArray('#leistungen .grid > div');
    
    if (pricingCards.length && pricingGrid) {
      // Initial state für alle Cards
      gsap.set(pricingCards, { 
        y: dist.medium, 
        opacity: 0,
        scale: 0.97
      });
      
      // Alle 4 Cards zusammen animieren, getriggert vom Grid-Container
      gsap.to(pricingCards, {
        scrollTrigger: {
          trigger: pricingGrid,
          start: 'top 80%',
          toggleActions: CONFIG.scrollTrigger.toggleActions
        },
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: CONFIG.stagger.fast, // schnellerer stagger (0.08s)
        duration: CONFIG.duration.normal,
        ease: CONFIG.ease.expo
      });
      
      // Hover lift effect
      pricingCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -8,
            duration: CONFIG.duration.fast,
            ease: CONFIG.ease.smooth
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: CONFIG.duration.fast,
            ease: CONFIG.ease.smooth
          });
        });
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // PORTFOLIO SECTION - PROJECT CARDS
    // ─────────────────────────────────────────────────────────────────────
    
    const portfolioCards = gsap.utils.toArray('#portfolio .grid > div');
    
    if (portfolioCards.length) {
      portfolioCards.forEach((card, i) => {
        gsap.fromTo(card,
          { 
            y: dist.large, 
            opacity: 0,
            rotationX: -10,
            transformPerspective: 1200
          },
          {
            scrollTrigger: {
              trigger: card,
              start: CONFIG.scrollTrigger.start,
              toggleActions: CONFIG.scrollTrigger.toggleActions
            },
            y: 0,
            opacity: 1,
            rotationX: 0,
            duration: CONFIG.duration.slow,
            delay: i * 0.1,
            ease: CONFIG.ease.expo
          }
        );
      });
    }
  }

  /**
   * Parallax Effects - Desktop
   * Floating blobs and depth effects
   */
  function initParallaxDesktop(gsap, dist) {
    
    // ─────────────────────────────────────────────────────────────────────
    // BACKGROUND BLOBS PARALLAX
    // ─────────────────────────────────────────────────────────────────────
    
    const blobs = gsap.utils.toArray('.blur-3xl');
    
    blobs.forEach((blob, i) => {
      gsap.to(blob, {
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2
        },
        y: (i + 1) * 200,
        rotation: i % 2 === 0 ? 60 : -60,
        scale: 1 + (i * 0.1),
        ease: 'none'
      });
    });

    // ─────────────────────────────────────────────────────────────────────
    // SECTION DEPTH PARALLAX
    // ─────────────────────────────────────────────────────────────────────
    
    const sectionsWithBg = document.querySelectorAll('.bg-slate-900');
    
    sectionsWithBg.forEach(section => {
      const innerGlow = section.querySelector('[class*="blur-"]');
      if (innerGlow) {
        gsap.to(innerGlow, {
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          },
          y: 100,
          ease: 'none'
        });
      }
    });
  }

  /**
   * Special Effects - Desktop
   * Marquee, floating stats, etc.
   */
  function initSpecialEffectsDesktop(gsap, dist) {
    
    // ─────────────────────────────────────────────────────────────────────
    // TECH MARQUEE REVEAL
    // ─────────────────────────────────────────────────────────────────────
    
    const marquee = document.querySelector('.marquee-container');
    if (marquee) {
      gsap.fromTo(marquee,
        { opacity: 0, scaleX: 0.8 },
        {
          scrollTrigger: {
            trigger: marquee,
            start: 'top 90%',
            toggleActions: CONFIG.scrollTrigger.toggleActions
          },
          opacity: 1,
          scaleX: 1,
          duration: CONFIG.duration.slow,
          ease: CONFIG.ease.expo
        }
      );
    }

    // ─────────────────────────────────────────────────────────────────────
    // FLOATING ANIMATION FOR STATS CARD
    // ─────────────────────────────────────────────────────────────────────
    
    const statsCard = document.querySelector('.animate-bounce');
    if (statsCard) {
      // Override CSS animation with GSAP
      statsCard.classList.remove('animate-bounce');
      
      gsap.to(statsCard, {
        y: -15,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // NAVBAR SCROLL EFFECT
    // ─────────────────────────────────────────────────────────────────────
    
    const navbar = document.querySelector('nav');
    if (navbar) {
      ScrollTrigger.create({
        start: 'top -80',
        onUpdate: (self) => {
          if (self.direction === 1 && self.progress > 0.02) {
            gsap.to(navbar, {
              y: -100,
              duration: CONFIG.duration.fast,
              ease: CONFIG.ease.smooth
            });
          } else {
            gsap.to(navbar, {
              y: 0,
              duration: CONFIG.duration.fast,
              ease: CONFIG.ease.smooth
            });
          }
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MOBILE ANIMATION MODULES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Hero Section - Mobile
   * Vereinfachte Animation für Performance
   */
  function initHeroMobile(gsap, dist) {
    const heroSection = document.querySelector('section:first-of-type');
    if (!heroSection) return;

    const badge = heroSection.querySelector('.inline-flex.rounded-full');
    const headline = heroSection.querySelector('h1');
    const description = heroSection.querySelector('p.text-lg');
    const ctaButtons = heroSection.querySelector('.flex.flex-col.sm\\:flex-row');
    const browserMockup = heroSection.querySelector('.relative.max-w-4xl');

    // Simplified timeline - keine Split-Text Animation auf Mobile
    const heroTl = gsap.timeline({
      defaults: { 
        ease: CONFIG.ease.smooth, 
        duration: CONFIG.duration.normal 
      }
    });

    heroTl
      .fromTo(badge,
        { y: -dist.small, opacity: 0 },
        { y: 0, opacity: 1 },
        0.1
      )
      .fromTo(headline,
        { y: dist.medium, opacity: 0 },
        { y: 0, opacity: 1, duration: CONFIG.duration.slow },
        0.2
      )
      .fromTo(description,
        { y: dist.small, opacity: 0 },
        { y: 0, opacity: 1 },
        '-=0.5'
      )
      .fromTo(ctaButtons,
        { y: dist.small, opacity: 0 },
        { y: 0, opacity: 1 },
        '-=0.3'
      )
      .fromTo(browserMockup,
        { y: dist.medium, opacity: 0 },
        { y: 0, opacity: 1, duration: CONFIG.duration.slow },
        '-=0.4'
      );
  }

  /**
   * Scroll Reveals - Mobile
   * Einfache Fade-In Animationen
   */
  function initScrollRevealsMobile(gsap, dist) {
    
    // Simple fade-in für alle Section Headlines
    const sectionHeadlines = document.querySelectorAll('section:not(:first-of-type) h2');
    
    sectionHeadlines.forEach(headline => {
      gsap.fromTo(headline,
        { y: dist.small, opacity: 0 },
        {
          scrollTrigger: {
            trigger: headline,
            start: 'top 90%',
            toggleActions: CONFIG.scrollTrigger.toggleActions
          },
          y: 0,
          opacity: 1,
          duration: CONFIG.duration.normal,
          ease: CONFIG.ease.smooth
        }
      );
    });

    // Section descriptions
    const descriptions = document.querySelectorAll('section:not(:first-of-type) .text-center p');
    
    descriptions.forEach(desc => {
      gsap.fromTo(desc,
        { y: dist.small, opacity: 0 },
        {
          scrollTrigger: {
            trigger: desc,
            start: 'top 90%',
            toggleActions: CONFIG.scrollTrigger.toggleActions
          },
          y: 0,
          opacity: 1,
          duration: CONFIG.duration.fast,
          ease: CONFIG.ease.smooth
        }
      );
    });

    // Contact form - als Ganzes
    const contactSection = document.querySelector('#kontakt');
    const contactFormWrapper = document.querySelector('#kontakt .bg-slate-900.border');
    if (contactFormWrapper && contactSection) {
      gsap.fromTo(contactFormWrapper,
        { y: dist.medium, opacity: 0 },
        {
          scrollTrigger: {
            trigger: contactSection,
            start: 'top 80%',
            toggleActions: CONFIG.scrollTrigger.toggleActions
          },
          y: 0,
          opacity: 1,
          duration: CONFIG.duration.normal,
          ease: CONFIG.ease.smooth
        }
      );
    }
  }

  /**
   * Service Cards - Mobile
   * Einfaches Stagger ohne komplexe Effekte
   */
  function initServiceCardsMobile(gsap, dist) {
    
    // Benefit Cards - simple fade
    const benefitCards = gsap.utils.toArray('#vorteile .group');
    
    if (benefitCards.length) {
      gsap.set(benefitCards, { y: dist.medium, opacity: 0 });
      
      ScrollTrigger.batch(benefitCards, {
        start: 'top 92%',
        onEnter: batch => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            stagger: CONFIG.stagger.fast,
            duration: CONFIG.duration.fast,
            ease: CONFIG.ease.smooth,
            overwrite: true
          });
        }
      });
    }

    // Pricing Cards - alle zusammen
    const pricingGrid = document.querySelector('#leistungen .grid');
    const pricingCards = gsap.utils.toArray('#leistungen .grid > div');
    
    if (pricingCards.length && pricingGrid) {
      gsap.set(pricingCards, { y: dist.small, opacity: 0 });
      
      gsap.to(pricingCards, {
        scrollTrigger: {
          trigger: pricingGrid,
          start: 'top 85%',
          toggleActions: CONFIG.scrollTrigger.toggleActions
        },
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: CONFIG.duration.fast,
        ease: CONFIG.ease.smooth
      });
    }

    // Portfolio Cards
    const portfolioCards = gsap.utils.toArray('#portfolio .grid > div');
    
    portfolioCards.forEach(card => {
      gsap.fromTo(card,
        { y: dist.medium, opacity: 0 },
        {
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: CONFIG.scrollTrigger.toggleActions
          },
          y: 0,
          opacity: 1,
          duration: CONFIG.duration.fast,
          ease: CONFIG.ease.smooth
        }
      );
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIVERSAL ANIMATIONS (All Breakpoints)
  // ═══════════════════════════════════════════════════════════════════════════

  function initUniversalAnimations(gsap) {
    
    // ─────────────────────────────────────────────────────────────────────
    // FOOTER REVEAL
    // ─────────────────────────────────────────────────────────────────────
    
    const footer = document.querySelector('footer');
    if (footer) {
      gsap.fromTo(footer,
        { opacity: 0 },
        {
          scrollTrigger: {
            trigger: footer,
            start: 'top 95%'
          },
          opacity: 1,
          duration: CONFIG.duration.normal,
          ease: CONFIG.ease.smooth
        }
      );
    }

    // ─────────────────────────────────────────────────────────────────────
    // LINK HOVER EFFECTS
    // ─────────────────────────────────────────────────────────────────────
    
    const ctaLinks = document.querySelectorAll('a[href="#kontakt"]');
    
    ctaLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        gsap.to(link, {
          scale: 1.02,
          duration: CONFIG.duration.fast,
          ease: CONFIG.ease.smooth
        });
      });
      
      link.addEventListener('mouseleave', () => {
        gsap.to(link, {
          scale: 1,
          duration: CONFIG.duration.fast,
          ease: CONFIG.ease.smooth
        });
      });
    });

    // ─────────────────────────────────────────────────────────────────────
    // SCROLL PROGRESS INDICATOR (Optional)
    // ─────────────────────────────────────────────────────────────────────
    
    // Kann später aktiviert werden
    /*
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #f97316, #f59e0b);
      z-index: 9999;
      transform-origin: left;
      transform: scaleX(0);
    `;
    document.body.appendChild(progressBar);
    
    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3
      }
    });
    */
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP FUNCTION
  // ═══════════════════════════════════════════════════════════════════════════

  function cleanup() {
    if (window.onyxAnimationContext) {
      window.onyxAnimationContext.revert();
      window.onyxAnimationContext = null;
    }
    
    // Restore split text
    document.querySelectorAll('[data-original-text]').forEach(el => {
      restoreText(el);
    });
    
    // Kill all ScrollTriggers
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll().forEach(st => st.kill());
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  // Start animations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  // Expose cleanup function globally for SPA navigation
  window.onyxCleanup = cleanup;

})();


// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT FORM HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!contactForm || !submitBtn) return;

  // Form submission handler
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const originalBtnText = submitBtn.innerText;
    
    // Button loading state
    submitBtn.innerText = 'Wird gesendet...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    // Optional: Animate button
    if (window.gsap) {
      gsap.to(submitBtn, {
        scale: 0.98,
        duration: 0.2
      });
    }

    const formData = new FormData(contactForm);

    try {
      const response = await fetch('https://formspree.io/f/mlgeozzr', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Success animation
        if (window.gsap) {
          gsap.to(submitBtn, {
            scale: 1.05,
            backgroundColor: '#22c55e',
            duration: 0.3,
            onComplete: () => {
              contactForm.reset();
              window.location.href = './pages/success.html';
            }
          });
        } else {
          contactForm.reset();
          window.location.href = './pages/success.html';
        }
      } else {
        // Error handling
        alert('Hoppla! Da gab es ein Problem. Bitte versuchen Sie es erneut.');
        resetButton();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung.');
      resetButton();
    }

    function resetButton() {
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      
      if (window.gsap) {
        gsap.to(submitBtn, {
          scale: 1,
          duration: 0.2
        });
      }
    }
  });

  // Input focus animations
  const formInputs = contactForm.querySelectorAll('input, textarea, select');
  
  formInputs.forEach(input => {
    input.addEventListener('focus', function() {
      if (window.gsap) {
        gsap.to(this, {
          borderColor: '#f97316',
          duration: 0.3
        });
      }
    });
    
    input.addEventListener('blur', function() {
      if (window.gsap && !this.value) {
        gsap.to(this, {
          borderColor: '',
          duration: 0.3
        });
      }
    });
  });

})();

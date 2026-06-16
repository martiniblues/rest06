// DreamITbiz — script.js
// Vanilla JS, no frameworks

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. SCROLL PROGRESS BAR
  // ============================================================
  const scrollProgress = document.getElementById('scrollProgress');

  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = scrollPercent + '%';
  }

  // ============================================================
  // 2. NAVBAR — add .scrolled class on scroll
  // ============================================================
  const navbar = document.getElementById('navbar');

  function updateNavbar() {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Combined scroll handler
  window.addEventListener('scroll', () => {
    updateScrollProgress();
    updateNavbar();
    updateParallax();
    updateActiveNav();
  }, { passive: true });

  // Initial calls
  updateScrollProgress();
  updateNavbar();

  // ============================================================
  // 3. DARK MODE TOGGLE
  // ============================================================
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    localStorage.setItem('dreamitbiz-theme', theme);
  }

  // Load saved preference
  const savedTheme = localStorage.getItem('dreamitbiz-theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    // Respect OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ============================================================
  // 4. MOBILE MENU
  // ============================================================
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      navMenu.classList.toggle('open', !isOpen);
      hamburger.classList.toggle('open', !isOpen);
      hamburger.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
    });

    // Toggle dropdowns on mobile via click
    const hasDropdownItems = navMenu.querySelectorAll('.has-dropdown');
    hasDropdownItems.forEach(item => {
      const link = item.querySelector('a');
      if (link) {
        link.addEventListener('click', (e) => {
          // Only intercept on mobile (hamburger visible)
          if (window.innerWidth <= 768) {
            e.preventDefault();
            item.classList.toggle('mobile-open');
          }
        });
      }
    });

    // Close menu when a dropdown link is clicked
    const dropdownLinks = navMenu.querySelectorAll('.dropdown a');
    dropdownLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  }

  // ============================================================
  // 5. COUNT-UP ANIMATION
  // ============================================================
  const countEls = document.querySelectorAll('[data-count]');
  let countAnimated = false;

  function formatCount(value, target) {
    // Special formatting for large numbers
    if (target === 38000) return '38K+';
    if (target === 2015) return '2015';
    if (target === 320) return '320+';
    if (target === 500) return '500+';
    if (value >= 1000) {
      return Math.round(value / 1000) + 'K+';
    }
    return Math.round(value).toString();
  }

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;

    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startVal = 0;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentVal = startVal + (target - startVal) * easedProgress;

      el.textContent = formatCount(currentVal, target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatCount(target, target);
      }
    }

    requestAnimationFrame(step);
  }

  // Use IntersectionObserver on the #about section
  const aboutSection = document.getElementById('about');
  if (aboutSection && countEls.length > 0) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countAnimated) {
          countAnimated = true;
          countEls.forEach(el => animateCount(el));
          countObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });

    countObserver.observe(aboutSection);
  }

  // ============================================================
  // 6. SCROLL ANIMATIONS — .fade-in → .visible
  // ============================================================
  const fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeEls.forEach(el => fadeObserver.observe(el));
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ============================================================
  // 7. COURSE TABS
  // ============================================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const onlineCourses = document.getElementById('onlineCourses');
  const offlineCourses = document.getElementById('offlineCourses');

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');

        // Update button states
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show/hide content
        if (tab === 'online') {
          if (onlineCourses) {
            onlineCourses.classList.add('active');
          }
          if (offlineCourses) {
            offlineCourses.classList.remove('active');
          }
        } else if (tab === 'offline') {
          if (offlineCourses) {
            offlineCourses.classList.add('active');
          }
          if (onlineCourses) {
            onlineCourses.classList.remove('active');
          }
        }

        // Trigger fade-in for newly visible cards
        const newCards = document.querySelectorAll('.tab-content.active .fade-in:not(.visible)');
        newCards.forEach((card, i) => {
          setTimeout(() => {
            card.classList.add('visible');
          }, i * 60);
        });
      });
    });
  }

  // ============================================================
  // 8. FAQ ACCORDION
  // ============================================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all items
      faqItems.forEach(i => {
        i.classList.remove('open');
      });

      // If it wasn't open, open it
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // ============================================================
  // 9. PARALLAX — heroOrb follows scroll
  // ============================================================
  const heroOrb = document.getElementById('heroOrb');

  function updateParallax() {
    if (!heroOrb) return;
    const scrollY = window.scrollY;
    heroOrb.style.transform = `translateY(${scrollY * 0.3}px)`;
  }

  // ============================================================
  // 10. CHAT POPUP — Supabase Edge Function (syu-chat)
  // ============================================================
  const SUPABASE_URL = 'https://hcmgdztsgjvzcyxyayaj.supabase.co';
  const EDGE_FN_URL  = SUPABASE_URL + '/functions/v1/syu-chat';

  const chatBtn      = document.getElementById('chatBtn');
  const chatWrapper  = document.getElementById('chatWrapper');
  const chatModal    = document.getElementById('chatModal');
  const chatClose    = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput    = document.getElementById('chatInput');
  const chatSend     = document.getElementById('chatSend');
  const apiBtns      = document.querySelectorAll('.api-btn');

  let currentApi = 'solar'; // 'solar' | 'openai'
  let isTyping   = false;

  // API toggle
  apiBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentApi = btn.dataset.api;
      apiBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  function scrollChatToBottom() {
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendMessage(text, type) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg ' + type;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
    scrollChatToBottom();
    return bubble;
  }

  function showTyping() {
    if (!chatMessages || isTyping) return null;
    isTyping = true;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg bot';
    msgDiv.id = 'typingIndicator';
    msgDiv.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(msgDiv);
    scrollChatToBottom();
    return msgDiv;
  }

  function removeTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
    isTyping = false;
  }

  async function sendChatMessage(text) {
    if (!text) {
      text = chatInput ? chatInput.value.trim() : '';
    }
    if (!text || isTyping) return;

    appendMessage(text, 'user');
    if (chatInput) chatInput.value = '';

    // Hide suggestion buttons after first message
    const suggestions = chatMessages.querySelector('.chat-suggestions');
    if (suggestions) suggestions.style.display = 'none';

    showTyping();

    try {
      const res = await fetch(EDGE_FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, api: currentApi })
      });

      removeTyping();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 503 || err.code === 'NOT_CONFIGURED') {
          appendMessage(
            '⚙️ AI 도우미 설정이 아직 완료되지 않았습니다.\nSupabase Edge Function 배포 후 이용 가능합니다.',
            'bot'
          );
        } else {
          appendMessage('죄송합니다. 일시적 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'bot');
        }
        return;
      }

      const data = await res.json();
      appendMessage(data.reply || '응답을 받아오지 못했습니다.', 'bot');

    } catch (e) {
      removeTyping();
      appendMessage('⚙️ 서버에 연결할 수 없습니다. Edge Function이 배포되면 정상 동작합니다.', 'bot');
    }
  }

  if (chatBtn && chatModal) {
    chatBtn.addEventListener('click', () => {
      chatModal.classList.toggle('open');
      if (chatModal.classList.contains('open') && chatInput) {
        setTimeout(() => chatInput.focus(), 250);
      }
    });
  }

  if (chatClose && chatModal) {
    chatClose.addEventListener('click', () => chatModal.classList.remove('open'));
  }

  if (chatSend) chatSend.addEventListener('click', () => sendChatMessage());

  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
    });
  }

  // Suggested questions
  document.querySelectorAll('.chat-suggest').forEach(btn => {
    btn.addEventListener('click', () => sendChatMessage(btn.dataset.q));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (chatModal && chatModal.classList.contains('open')) {
      if (!chatModal.contains(e.target) && chatWrapper && !chatWrapper.contains(e.target)) {
        chatModal.classList.remove('open');
      }
    }
  });

  // ============================================================
  // 11. SMOOTH ACTIVE NAV HIGHLIGHT
  // ============================================================
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateActiveNav() {
    let currentId = '';
    const scrollY = window.scrollY;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  // Initial active nav update
  updateActiveNav();

  // ============================================================
  // 12. FORM SUBMIT
  // ============================================================
  const applyForm = document.getElementById('applyForm');

  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('formName');
      const emailInput = document.getElementById('formEmail');

      // Basic validation
      if (nameInput && !nameInput.value.trim()) {
        nameInput.focus();
        nameInput.style.borderColor = 'var(--c1)';
        nameInput.style.boxShadow = '0 0 0 3px rgba(255, 59, 46, 0.2)';
        setTimeout(() => {
          nameInput.style.borderColor = '';
          nameInput.style.boxShadow = '';
        }, 2000);
        return;
      }

      if (emailInput && !emailInput.value.trim()) {
        emailInput.focus();
        emailInput.style.borderColor = 'var(--c1)';
        emailInput.style.boxShadow = '0 0 0 3px rgba(255, 59, 46, 0.2)';
        setTimeout(() => {
          emailInput.style.borderColor = '';
          emailInput.style.boxShadow = '';
        }, 2000);
        return;
      }

      // Show success alert
      alert('문의가 접수되었습니다. 1일 이내에 연락드리겠습니다!');

      // Reset form
      applyForm.reset();
    });
  }

  // ============================================================
  // BONUS: Smooth scroll for anchor links
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navH - 8;

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        if (navMenu && navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          if (hamburger) hamburger.classList.remove('open');
        }
      }
    });
  });

}); // end DOMContentLoaded

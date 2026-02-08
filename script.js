(() => {
  'use strict';

  /* ── DOM refs ── */
  const overlay        = document.getElementById('loading-overlay');
  const mainContent    = document.getElementById('main-content');
  const openBtn        = document.getElementById('open-letter-btn');
  const letterCard     = document.getElementById('letter-card');
  const heartsField    = document.getElementById('hearts-field');
  const nextBtn        = document.getElementById('next-btn');
  const questionScreen = document.getElementById('question-screen');
  const yesBtn         = document.getElementById('yes-btn');
  const noBtn          = document.getElementById('no-btn');
  const questionBtns   = document.getElementById('question-buttons');
  const celebrateMsg   = document.getElementById('celebrate-msg');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const questionHeartsField = document.getElementById('question-hearts-field');

  /* ── Settings ── */
  const LOADING_DURATION_MS = 2800;
  const HEART_COUNT         = 18;
  const HEART_INTERVAL_MS   = 600;
  const MAX_CONCURRENT      = 12;
  const NO_DANGER_RADIUS    = 160; // px – how close pointer gets before NO flees

  /* ── Reduced-motion check ── */
  const prefersReduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════════════════════════
     1. Loading → Reveal
     ══════════════════════════════════════════ */
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      overlay.classList.add('fade-out');
      overlay.addEventListener('transitionend', () => {
        overlay.classList.add('hidden');
      }, { once: true });
      mainContent.classList.remove('hidden');
    }, LOADING_DURATION_MS);
  });

  /* ══════════════════════════════════════════
     2. Open Letter
     ══════════════════════════════════════════ */
  openBtn.addEventListener('click', revealLetter);

  function revealLetter() {
    openBtn.classList.add('btn-hide');
    letterCard.classList.remove('hidden');
    letterCard.classList.add('reveal');

    if (!prefersReduced) {
      startFloatingHearts();
    }

    // Show "Next" once letter reveal animation ends
    letterCard.addEventListener('animationend', showNextButton, { once: true });

    // Fallback: if reduced motion kills the animation, show Next after a short delay
    if (prefersReduced) {
      setTimeout(showNextButton, 300);
    }
  }

  /* ══════════════════════════════════════════
     3. Next Button
     ══════════════════════════════════════════ */
  function showNextButton() {
    nextBtn.classList.remove('hidden');
    nextBtn.classList.add('show');
    nextBtn.focus();
  }

  nextBtn.addEventListener('click', goToQuestion);

  function goToQuestion() {
    mainContent.classList.add('hidden');
    questionScreen.classList.remove('hidden');
    yesBtn.focus();
    initEvadeNO();

    // Spawn ambient hearts on the question screen
    if (!prefersReduced) {
      startQuestionHearts();
    }
  }

  /* ── Ambient hearts for question screen ── */
  let qHeartTimer = null;
  let qHeartsSpawned = 0;
  const Q_HEART_COUNT = 14;
  const Q_HEART_INTERVAL = 900;

  function startQuestionHearts() {
    for (let i = 0; i < 4; i++) {
      spawnHeartIn(questionHeartsField);
    }
    qHeartsSpawned = 4;
    qHeartTimer = setInterval(() => {
      if (questionHeartsField.childElementCount < 8) {
        spawnHeartIn(questionHeartsField);
        qHeartsSpawned++;
      }
      if (qHeartsSpawned >= Q_HEART_COUNT) {
        clearInterval(qHeartTimer);
      }
    }, Q_HEART_INTERVAL);
  }

  /* ══════════════════════════════════════════
     4. Evasive NO Button
     ══════════════════════════════════════════ */
  let noEvading = false;
  let noInitialized = false; // track whether NO has been pulled out of flow yet

  function initEvadeNO() {
    noEvading = true;

    // Desktop: evade when pointer approaches
    document.addEventListener('pointermove', handlePointerNear);

    // Mobile / touch: evade on touchstart near NO
    noBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      moveNoButton();
    });

    // Also evade on hover for fast moves that skip pointermove
    noBtn.addEventListener('pointerenter', () => {
      moveNoButton();
    });
  }

  function handlePointerNear(e) {
    if (!noEvading) return;
    const rect = noBtn.getBoundingClientRect();
    const noCX = rect.left + rect.width / 2;
    const noCY = rect.top  + rect.height / 2;
    const dist = Math.hypot(e.clientX - noCX, e.clientY - noCY);
    if (dist < NO_DANGER_RADIUS) {
      moveNoButton();
    }
  }

  function moveNoButton() {
    // On the first move, snapshot its natural rect, then switch to absolute
    if (!noInitialized) {
      noBtn.classList.add('evading');
      noInitialized = true;
    }

    // Move within the entire viewport (with some padding) so it really runs away
    const pad  = 20;
    const btnW = noBtn.offsetWidth;
    const btnH = noBtn.offsetHeight;
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;

    // Use the question-screen as the positioning parent (it's position:fixed)
    const maxX = vw - btnW - pad;
    const maxY = vh - btnH - pad;
    const newX = Math.max(pad, Math.random() * maxX);
    const newY = Math.max(pad, Math.random() * maxY);

    noBtn.style.left = `${newX}px`;
    noBtn.style.top  = `${newY}px`;
  }

  /* ══════════════════════════════════════════
     5. YES → Celebration
     ══════════════════════════════════════════ */
  yesBtn.addEventListener('click', celebrate);

  function celebrate() {
    // Stop NO evasion
    noEvading = false;
    document.removeEventListener('pointermove', handlePointerNear);

    // Hide buttons, show message
    questionBtns.classList.add('hidden');
    celebrateMsg.classList.remove('hidden');

    if (!prefersReduced) {
      // Fire confetti
      confettiCanvas.classList.remove('hidden');
      startConfetti();

      // Heart burst
      burstHearts(40);
    }
  }

  /* ── Heart burst (reuse existing heart system) ── */
  function burstHearts(count) {
    // Make sure hearts field is visible and on top
    heartsField.style.zIndex = '8';
    for (let i = 0; i < count; i++) {
      setTimeout(() => spawnHeart(), i * 80);
    }
  }

  /* ══════════════════════════════════════════
     6. Floating Hearts
     ══════════════════════════════════════════ */
  let heartTimer = null;
  let heartsSpawned = 0;

  function createHeartSVG(size) {
    const ns  = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d',
      'M32 56 C16 44, 2 32, 2 20 A14 14 0 0 1 32 12 A14 14 0 0 1 62 20 C62 32, 48 44, 32 56Z');

    const hue = Math.random() > 0.5 ? '#c084fc' : '#f472b6';
    path.setAttribute('fill', hue);

    svg.appendChild(path);
    return svg;
  }

  function spawnHeart() {
    spawnHeartIn(heartsField);
  }

  function spawnHeartIn(container) {
    const el = document.createElement('div');
    el.classList.add('floating-heart');

    const size     = randomBetween(18, 34);
    const left     = randomBetween(5, 95);
    const duration = randomBetween(5, 9);
    const delay    = randomBetween(0, 1.5);
    const rotate   = randomBetween(-40, 40);
    const scale    = (randomBetween(60, 120) / 100).toFixed(2);

    el.style.left = `${left}%`;
    el.style.setProperty('--duration', `${duration}s`);
    el.style.setProperty('--delay', `${delay}s`);
    el.style.setProperty('--rotate', `${rotate}deg`);
    el.style.setProperty('--scale', scale);

    el.appendChild(createHeartSVG(size));
    container.appendChild(el);

    const totalTime = (duration + delay) * 1000 + 200;
    setTimeout(() => {
      el.remove();
    }, totalTime);
  }

  function startFloatingHearts() {
    for (let i = 0; i < 6; i++) {
      spawnHeart();
    }
    heartsSpawned = 6;

    heartTimer = setInterval(() => {
      if (heartsField.childElementCount < MAX_CONCURRENT) {
        spawnHeart();
        heartsSpawned++;
      }
      if (heartsSpawned >= HEART_COUNT) {
        clearInterval(heartTimer);
      }
    }, HEART_INTERVAL_MS);
  }

  /* ══════════════════════════════════════════
     7. Canvas Confetti (no external libs)
     ══════════════════════════════════════════ */
  function startConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    confettiCanvas.width  = W;
    confettiCanvas.height = H;

    const COLORS = [
      '#c084fc', '#f472b6', '#a855f7', '#ec4899',
      '#e879f9', '#fb7185', '#f9a8d4', '#d946ef',
      '#fbbf24', '#34d399'
    ];
    const PARTICLE_COUNT = 180;
    const GRAVITY = 0.12;
    const DRAG = 0.98;
    const DURATION_MS = 4500;
    const startTime = performance.now();

    // Create particles
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: W / 2 + randomBetween(-80, 80),
        y: H / 2 + randomBetween(-40, 40),
        vx: randomBetween(-12, 12),
        vy: randomBetween(-18, -4),
        w: randomBetween(6, 12),
        h: randomBetween(4, 8),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: randomBetween(0, 360),
        rotSpeed: randomBetween(-8, 8),
        alpha: 1,
      });
    }

    let rafId;
    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION_MS, 1);

      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.vy += GRAVITY;
        p.vx *= DRAG;
        p.vy *= DRAG;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        // Fade out in last 30%
        if (progress > 0.7) {
          p.alpha = Math.max(0, 1 - (progress - 0.7) / 0.3);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        // Clean up
        ctx.clearRect(0, 0, W, H);
        confettiCanvas.classList.add('hidden');
        cancelAnimationFrame(rafId);
      }
    }

    rafId = requestAnimationFrame(frame);

    // Handle resize
    function onResize() {
      W = window.innerWidth;
      H = window.innerHeight;
      confettiCanvas.width  = W;
      confettiCanvas.height = H;
    }
    window.addEventListener('resize', onResize);
    // Remove resize listener after confetti ends
    setTimeout(() => window.removeEventListener('resize', onResize), DURATION_MS + 500);
  }

  /* ── Helpers ── */
  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }
})();

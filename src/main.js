// Main Orchestration Script for Shaik Mustafa Ali's AWS Portfolio
import { sounds } from './audio.js';
import { initParticleCanvas } from './particles.js';
import { CloudTerminal } from './terminal.js';
import { ServerlessDefenderGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Interactive Background Canvas
  initParticleCanvas('bg-canvas');

  // DOM Elements
  const terminalModal = document.getElementById('terminal-modal');
  const termBody = document.getElementById('term-body');
  const termOutput = document.getElementById('term-output');
  const termInput = document.getElementById('term-input');
  const termCloseBtn = document.getElementById('term-close-btn');
  const termThemeSelect = document.getElementById('term-theme-select');
  const terminalWindow = document.getElementById('terminal-window');

  const arcadeModal = document.getElementById('arcade-modal');
  const gameCanvas = document.getElementById('game-canvas');
  const gameScoreDisplay = document.getElementById('game-score-display');
  const arcadeCloseBtn = document.getElementById('arcade-close-btn');
  const gameRestartBtn = document.getElementById('game-restart-btn');
  const gameBackToCliBtn = document.getElementById('game-back-to-cli-btn');

  const achievementModal = document.getElementById('achievement-modal');
  const achievementClaimBtn = document.getElementById('achievement-claim-btn');

  const projectModal = document.getElementById('project-modal');
  const projectModalBody = document.getElementById('project-modal-body');
  const projModalCloseBtn = document.getElementById('proj-modal-close-btn');

  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');

  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  // 2. Setup Audio State
  function updateAudioUI() {
    if (sounds.isMuted()) {
      audioIcon.textContent = '🔇';
      audioToggleBtn.title = 'Sound FX Muted (Click to enable)';
    } else {
      audioIcon.textContent = '🔊';
      audioToggleBtn.title = 'Sound FX Enabled (Click to mute)';
    }
  }
  updateAudioUI();

  audioToggleBtn.addEventListener('click', () => {
    const isMuted = sounds.toggleMute();
    updateAudioUI();
    showToast(isMuted ? 'Sound FX Muted' : 'Sound FX Enabled 🔊');
  });

  // 3. Initialize Game Instance
  let gameInstance = null;

  function launchArcadeGame() {
    terminalModal.classList.add('hidden');
    arcadeModal.classList.remove('hidden');

    if (!gameInstance) {
      gameInstance = new ServerlessDefenderGame(gameCanvas, gameScoreDisplay, (score) => {
        // Victory Callback (100+ points)
        setTimeout(() => {
          arcadeModal.classList.add('hidden');
          achievementModal.classList.remove('hidden');
        }, 800);
      });
    }

    gameInstance.start();
    sounds.playTerminalOpen();
  }

  function closeArcadeGame() {
    if (gameInstance) {
      gameInstance.stop();
    }
    arcadeModal.classList.add('hidden');
  }

  arcadeCloseBtn.addEventListener('click', closeArcadeGame);
  gameRestartBtn.addEventListener('click', () => {
    if (gameInstance) gameInstance.start();
  });
  gameBackToCliBtn.addEventListener('click', () => {
    closeArcadeGame();
    openTerminal();
  });

  // Touch arcade controls for mobile
  const touchLeft = document.getElementById('touch-left');
  const touchRight = document.getElementById('touch-right');
  const touchFire = document.getElementById('touch-fire');

  if (touchLeft && touchRight && touchFire) {
    const triggerTouch = (code, down) => {
      const evt = new KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true });
      window.dispatchEvent(evt);
    };

    touchLeft.addEventListener('touchstart', (e) => { e.preventDefault(); triggerTouch('ArrowLeft', true); });
    touchLeft.addEventListener('touchend', (e) => { e.preventDefault(); triggerTouch('ArrowLeft', false); });

    touchRight.addEventListener('touchstart', (e) => { e.preventDefault(); triggerTouch('ArrowRight', true); });
    touchRight.addEventListener('touchend', (e) => { e.preventDefault(); triggerTouch('ArrowRight', false); });

    touchFire.addEventListener('touchstart', (e) => { e.preventDefault(); triggerTouch('Space', true); });
    touchFire.addEventListener('touchend', (e) => { e.preventDefault(); triggerTouch('Space', false); });
  }

  // 4. Initialize Cloud CLI Terminal
  const terminal = new CloudTerminal({
    container: terminalWindow,
    output: termOutput,
    input: termInput,
    onLaunchGame: launchArcadeGame
  });

  function openTerminal() {
    terminalModal.classList.remove('hidden');
    sounds.playTerminalOpen();
    setTimeout(() => {
      termInput.focus();
    }, 150);
  }

  function closeTerminal() {
    terminalModal.classList.add('hidden');
  }

  termCloseBtn.addEventListener('click', closeTerminal);
  terminalModal.addEventListener('click', (e) => {
    if (e.target === terminalModal) {
      closeTerminal();
    }
  });

  // Terminal Theme Select
  termThemeSelect.addEventListener('change', (e) => {
    terminal.cmdTheme([e.target.value]);
  });

  // Quick Command Buttons
  document.querySelectorAll('.quick-cmd-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) {
        termInput.value = cmd;
        terminal.executeCommand(cmd);
        termInput.value = '';
        termInput.focus();
      }
    });
  });

  // Global Triggers for Terminal (Visible Hints)
  const triggers = [
    document.getElementById('nav-terminal-trigger'),
    document.getElementById('hero-terminal-btn'),
    document.getElementById('banner-open-terminal-btn'),
    document.getElementById('floating-btn'),
    document.getElementById('footer-terminal-btn'),
    document.getElementById('mobile-terminal-trigger')
  ];

  triggers.forEach((trigger) => {
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openTerminal();
      });
    }
  });

  document.querySelectorAll('.terminal-launch-from-project').forEach((btn) => {
    btn.addEventListener('click', openTerminal);
  });

  // Global Keyboard Shortcut (~ or ` to open terminal, Esc to close)
  window.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
      // Avoid triggering when user is typing inside an input form
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && document.activeElement !== termInput) {
        return;
      }
      e.preventDefault();
      if (terminalModal.classList.contains('hidden')) {
        openTerminal();
      } else {
        closeTerminal();
      }
    } else if (e.key === 'Escape') {
      if (!terminalModal.classList.contains('hidden')) closeTerminal();
      if (!arcadeModal.classList.contains('hidden')) closeArcadeGame();
      if (!achievementModal.classList.contains('hidden')) achievementModal.classList.add('hidden');
      if (!projectModal.classList.contains('hidden')) projectModal.classList.add('hidden');
    }
  });

  // Achievement Claim Button
  achievementClaimBtn.addEventListener('click', () => {
    achievementModal.classList.add('hidden');
    showToast('🏆 Master Cloud Builder badge added to your session!');
  });

  // Top Hint Banner Dismiss
  const bannerCloseBtn = document.getElementById('banner-close-btn');
  const topHintBanner = document.getElementById('top-hint-banner');
  if (bannerCloseBtn && topHintBanner) {
    bannerCloseBtn.addEventListener('click', () => {
      topHintBanner.style.display = 'none';
    });
  }

  // 5. Mobile Menu Toggle
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  document.querySelectorAll('.mobile-item').forEach((item) => {
    item.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });

  // 6. Skills Filter Tabs
  const filterTabs = document.querySelectorAll('.filter-tab');
  const skillCards = document.querySelectorAll('.skill-card');

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      sounds.playKeyClick();
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');
      skillCards.forEach((card) => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 7. Project Case Studies Modal Data
  const projectCaseStudies = {
    hacktoberfest: {
      title: '🏆 Hacktoberfest Global Open Source Champion',
      badge: 'Open Source Impact • 2026',
      content: `
        <h4 style="color: var(--aws-orange); margin-bottom: 8px;">The Challenge:</h4>
        <p style="color: var(--text-secondary); margin-bottom: 14px; font-size: 0.94rem;">
          Navigating massive unfamiliar open-source repositories, collaborating asynchronously with international maintainers across time zones, and complying with strict coding standards and automated CI test suites.
        </p>
        <h4 style="color: var(--aws-orange); margin-bottom: 8px;">My Contribution & Solutions:</h4>
        <ul style="color: var(--text-secondary); margin-left: 20px; margin-bottom: 16px; font-size: 0.94rem; line-height: 1.7;">
          <li>Engineered bug fixes for front-end rendering performance in modern JavaScript frameworks.</li>
          <li>Refactored modular utility functions, eliminating redundant code blocks.</li>
          <li>Authored technical documentation and API usage guides, improving onboarding for new developers.</li>
          <li>Earned 4+ accepted, production-merged pull requests within the official challenge window.</li>
        </ul>
        <h4 style="color: var(--aws-orange); margin-bottom: 8px;">Key Takeaway:</h4>
        <p style="color: var(--text-secondary); font-size: 0.94rem;">
          Open-source taught me how to write code for human readers, participate in constructive peer code reviews, and automate verification using CI/CD.
        </p>
      `
    },
    'aws-portfolio': {
      title: '☁️ AWS Serverless Portfolio & Interactive CLI',
      badge: 'AWS Amplify Hosting • 2026',
      content: `
        <h4 style="color: var(--aws-orange); margin-bottom: 8px;">AWS Architecture & Services:</h4>
        <ul style="color: var(--text-secondary); margin-left: 20px; margin-bottom: 16px; font-size: 0.94rem; line-height: 1.7;">
          <li><strong>AWS Amplify Hosting:</strong> Continuous delivery connected directly to GitHub with zero-downtime atomic builds.</li>
          <li><strong>Amazon CloudFront:</strong> Global content delivery network ensuring edge caching and &lt;200ms latency worldwide.</li>
          <li><strong>Amazon S3:</strong> Encrypted, high-durability static object storage.</li>
          <li><strong>Web Audio API:</strong> Synthesized retro audio feedback without external asset weight.</li>
        </ul>
        <h4 style="color: var(--aws-orange); margin-bottom: 8px;">Creative Feature Highlights:</h4>
        <p style="color: var(--text-secondary); margin-bottom: 14px; font-size: 0.94rem;">
          Includes a fully interactive retro terminal emulator with tab-autocomplete, dynamic color themes, secret easter eggs revealing personal builder values, and an embedded "Serverless Defender" arcade mini-game.
        </p>
        <h4 style="color: var(--aws-orange); margin-bottom: 8px;">Challenges Overcome:</h4>
        <p style="color: var(--text-secondary); font-size: 0.94rem;">
          Balancing an engaging retro interactive experience while preserving 100% accessible navigation and clean responsive usability across both mobile screens and desktop monitors.
        </p>
      `
    },
    cloudscale: {
      title: '📊 CloudScale: Real-Time Metrics Dashboard',
      badge: 'Full-Stack Web App • 2025',
      content: `
        <h4 style="color: var(--aws-orange); margin-bottom: 8px;">Overview:</h4>
        <p style="color: var(--text-secondary); margin-bottom: 14px; font-size: 0.94rem;">
          A real-time telemetry dashboard designed for monitoring distributed cloud microservices. Provides interactive time-series visualizations, alerts, and live server health checks.
        </p>
        <h4 style="color: var(--aws-orange); margin-bottom: 8px;">Tech Stack:</h4>
        <p style="color: var(--text-secondary); font-size: 0.94rem;">
          Node.js, Express REST API, Canvas Charting Engine, Modular CSS3.
        </p>
      `
    },
    'event-pipeline': {
      title: '⚡ Serverless Event-Driven Processing System',
      badge: 'AWS Lambda & API Gateway • 2025',
      content: `
        <h4 style="color: var(--aws-orange); margin-bottom: 8px;">Overview:</h4>
        <p style="color: var(--text-secondary); margin-bottom: 14px; font-size: 0.94rem;">
          An asynchronous webhook consumer using AWS Lambda and API Gateway. Ingests high-volume event payloads, validates JSON schemas, and logs telemetry to Amazon CloudWatch with zero provisioned server overhead.
        </p>
      `
    }
  };

  document.querySelectorAll('.project-details-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const projKey = btn.getAttribute('data-project');
      const data = projectCaseStudies[projKey];
      if (data) {
        projectModalBody.innerHTML = `
          <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--cloud-cyan); text-transform: uppercase; margin-bottom: 6px;">
            ${data.badge}
          </div>
          <h3 id="modal-proj-title" style="font-family: var(--font-heading); font-size: 1.5rem; color: #fff; margin-bottom: 18px;">
            ${data.title}
          </h3>
          ${data.content}
        `;
        projectModal.classList.remove('hidden');
        sounds.playKeyClick();
      }
    });
  });

  projModalCloseBtn.addEventListener('click', () => {
    projectModal.classList.add('hidden');
  });
  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) {
      projectModal.classList.add('hidden');
    }
  });

  // 8. Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sounds.playVictory();
      showToast('🚀 Message received! Mustafa will connect with you shortly.');
      contactForm.reset();
    });
  }

  // Toast Notification Helper
  function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
});

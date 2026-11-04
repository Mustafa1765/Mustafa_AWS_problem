// Cloud CLI Terminal Engine for AWS Portfolio
import { sounds } from './audio.js';

export class CloudTerminal {
  constructor(options = {}) {
    this.container = options.container;
    this.output = options.output;
    this.input = options.input;
    this.history = [];
    this.historyIndex = -1;
    this.onLaunchGame = options.onLaunchGame;

    this.commands = {
      help: () => this.cmdHelp(),
      whoami: () => this.cmdWhoAmI(),
      skills: () => this.cmdSkills(),
      projects: () => this.cmdProjects(),
      hacktoberfest: () => this.cmdHacktoberfest(),
      aws: () => this.cmdAws(),
      secret: () => this.cmdSecret(),
      play: () => this.cmdPlay(),
      arcade: () => this.cmdPlay(),
      game: () => this.cmdPlay(),
      theme: (args) => this.cmdTheme(args),
      clear: () => this.cmdClear(),
      contact: () => this.cmdContact(),
      exit: () => this.cmdExit()
    };

    this.init();
  }

  init() {
    if (!this.input) return;

    this.input.addEventListener('keydown', (e) => {
      sounds.playKeyClick();

      if (e.key === 'Enter') {
        const val = this.input.value.trim();
        if (val) {
          this.history.push(val);
          this.historyIndex = this.history.length;
          this.executeCommand(val);
        } else {
          this.appendPromptLine('');
        }
        this.input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex] || '';
        } else {
          this.historyIndex = this.history.length;
          this.input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autocomplete();
      }
    });

    // Initial banner
    this.printWelcome();
  }

  printWelcome() {
    this.output.innerHTML = `
      <div class="term-banner">
        <pre class="term-ascii-logo">
    _ __      ______    ____        _ __    __         
   / / /_  __/ ____/   / __ )__  __(_) /___/ /__  _____
  / / / / / / /       / __  / / / / / / __  / _ \\/ ___/
 / /_/ /_/ / /___    / /_/ / /_/ / / / /_/ /  __/ /    
/_/\\__, /_/\\____/   /_____/\\__,_/_/_/\\__,_/\\___/_/     
  /____/                                               
        </pre>
        <div class="term-highlight">🚀 Welcome to <strong>Mustafa's AWS Cloud CLI</strong> (v2.6-amplify)</div>
        <div class="term-muted">Type <span class="cmd-pill">help</span> to view commands, or click quick buttons below.</div>
        <div class="term-accent">💡 Tip: Run <span class="cmd-pill">secret</span> to uncover a unique story, or <span class="cmd-pill">play</span> to launch Serverless Defender!</div>
      </div>
    `;
  }

  executeCommand(rawCmd) {
    const parts = rawCmd.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    this.appendPromptLine(rawCmd);

    if (this.commands[cmd]) {
      this.commands[cmd](args);
    } else {
      this.appendOutput(
        `<span class="term-error">Command not found: "${cmd}". Type <span class="cmd-pill">help</span> for available commands.</span>`
      );
    }

    this.scrollToBottom();
  }

  autocomplete() {
    const cur = this.input.value.trim().toLowerCase();
    if (!cur) return;

    const available = Object.keys(this.commands);
    const matches = available.filter((c) => c.startsWith(cur));

    if (matches.length === 1) {
      this.input.value = matches[0];
    } else if (matches.length > 1) {
      this.appendPromptLine(cur);
      this.appendOutput(`<div class="term-muted">Matches: ${matches.join('  ')}</div>`);
      this.scrollToBottom();
    }
  }

  appendPromptLine(text) {
    const line = document.createElement('div');
    line.className = 'term-line term-history-line';
    line.innerHTML = `<span class="term-prompt">mustafa@aws-cloud:~$</span> <span class="term-cmd-text">${this.escapeHtml(text)}</span>`;
    this.output.appendChild(line);
  }

  appendOutput(html) {
    const div = document.createElement('div');
    div.className = 'term-output-block';
    div.innerHTML = html;
    this.output.appendChild(div);
  }

  scrollToBottom() {
    this.output.scrollTop = this.output.scrollHeight;
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Commands Implementation
  cmdHelp() {
    this.appendOutput(`
      <div class="term-help-grid">
        <div class="help-row"><span class="cmd-name">whoami</span><span class="cmd-desc">Inspect builder profile, passion & background</span></div>
        <div class="help-row"><span class="cmd-name">skills</span><span class="cmd-desc">List AWS & full-stack superpowers</span></div>
        <div class="help-row"><span class="cmd-name">projects</span><span class="cmd-desc">Browse flagship engineering projects</span></div>
        <div class="help-row"><span class="cmd-name">hacktoberfest</span><span class="cmd-desc">Read the story behind the Hacktoberfest win!</span></div>
        <div class="help-row"><span class="cmd-name">aws</span><span class="cmd-desc">View AWS Amplify & serverless architecture</span></div>
        <div class="help-row"><span class="cmd-name">secret</span><span class="cmd-desc">✨ Reveals something unique about Mustafa</span></div>
        <div class="help-row"><span class="cmd-name">play</span><span class="cmd-desc">🎮 Launch "Serverless Defender" arcade game</span></div>
        <div class="help-row"><span class="cmd-name">theme</span><span class="cmd-desc">Change terminal theme (matrix, amber, cyber, dark)</span></div>
        <div class="help-row"><span class="cmd-name">contact</span><span class="cmd-desc">Get direct email, LinkedIn, and GitHub links</span></div>
        <div class="help-row"><span class="cmd-name">clear</span><span class="cmd-desc">Clear terminal buffer</span></div>
        <div class="help-row"><span class="cmd-name">exit</span><span class="cmd-desc">Close CLI window</span></div>
      </div>
    `);
  }

  cmdWhoAmI() {
    this.appendOutput(`
      <div class="term-card">
        <div class="term-title">👤 Shaik Mustafa Ali — Student Cloud Builder</div>
        <p>A relentless developer dedicated to bridging intuitive user interfaces with resilient cloud infrastructure on AWS.</p>
        <p>• <strong>Location:</strong> India | Active Global Student Builder</p>
        <p>• <strong>Status:</strong> Hacktoberfest Winner | AWS Builder Center Competitor</p>
        <p>• <strong>Mission:</strong> Designing high-availability, low-latency applications that solve genuine problems at scale.</p>
      </div>
    `);
  }

  cmdSkills() {
    this.appendOutput(`
      <div class="term-card">
        <div class="term-title">⚡ Tech Superpowers Breakdown</div>
        <div class="term-skill-bar"><span>Cloud / AWS (Amplify, S3, CloudFront, Lambda)</span> <span>[██████████] 92%</span></div>
        <div class="term-skill-bar"><span>JavaScript / Web Platforms (ES6+, DOM, APIs)</span> <span>[██████████] 95%</span></div>
        <div class="term-skill-bar"><span>Full-Stack Architecture (Node, Express, REST)</span> <span>[████████░░] 85%</span></div>
        <div class="term-skill-bar"><span>Git, GitHub & CI/CD Pipelines</span> <span>[█████████░] 90%</span></div>
      </div>
    `);
  }

  cmdProjects() {
    this.appendOutput(`
      <div class="term-card">
        <div class="term-title">📂 Featured Projects</div>
        <p>1. <strong>Hacktoberfest Global Open Source Impact</strong> — Champion contributions across 4+ production repos.</p>
        <p>2. <strong>AWS Amplify Serverless Portfolio & CLI</strong> — Live cloud-hosted showcase with sub-second TTFB.</p>
        <p>3. <strong>CloudScale Real-Time Web Platform</strong> — Scalable full-stack application with real-time UI.</p>
        <div class="term-muted">Tip: Scroll on the main page to inspect interactive visual cards and live demos!</div>
      </div>
    `);
  }

  cmdHacktoberfest() {
    this.appendOutput(`
      <div class="term-card special-card">
        <div class="term-title">🏆 The Hacktoberfest Victory Story</div>
        <p>Winning Hacktoberfest required more than writing code—it tested code quality, asynchronous open-source collaboration, and rigorous PR reviews with international maintainers.</p>
        <p>Each accepted pull request strengthened real-world engineering fundamentals: strict linting, modularity, git hygiene, and clear documentation. That same commitment to quality powers this AWS portfolio!</p>
      </div>
    `);
  }

  cmdAws() {
    this.appendOutput(`
      <div class="term-card">
        <div class="term-title">☁️ AWS Infrastructure Stack</div>
        <p>• <strong>AWS Amplify Hosting:</strong> Continuous CI/CD deployment linked to Git, zero-downtime atomic builds.</p>
        <p>• <strong>Amazon CloudFront:</strong> Global Edge distribution for ultra-low latency worldwide.</p>
        <p>• <strong>Amazon S3:</strong> High-durability object storage for static assets.</p>
        <p>• <strong>SSL / TLS:</strong> Automated Amazon Certificate Manager (ACM) HTTPS enforcement.</p>
      </div>
    `);
  }

  cmdSecret() {
    sounds.playVictory();
    this.appendOutput(`
      <div class="term-card secret-card">
        <div class="term-title">✨ Something Unique About Mustafa (Creative Reveal)</div>
        <p>Behind the code and cloud architectures, Mustafa is a passionate <strong>tactical chess player and analog mechanical watch enthusiast</strong>!</p>
        <p><em>"In chess, every move must anticipate 5 steps ahead under strict constraints. In mechanical watchmaking, hundreds of precision gears must harmonize without a single missed tick. That exact obsession with foresight and harmonic precision is why I fell in love with Distributed Cloud Systems."</em></p>
        <div class="term-highlight">🎯 Bonus: You unlocked the [Harmonic Builder] title! Run <span class="cmd-pill">play</span> to test your reflexes in the arcade.</div>
      </div>
    `);
  }

  cmdPlay() {
    this.appendOutput(`
      <div class="term-card">
        <div class="term-title">🎮 Initializing Serverless Defender Arcade...</div>
        <p>Defend the cloud! Blast incoming DDoS packets and server bugs. Score 100+ points to achieve Champion status!</p>
      </div>
    `);
    if (this.onLaunchGame) {
      setTimeout(() => {
        this.onLaunchGame();
      }, 400);
    }
  }

  cmdTheme(args) {
    const themeName = args[0] ? args[0].toLowerCase() : '';
    const validThemes = ['dark', 'matrix', 'amber', 'cyber'];

    if (!validThemes.includes(themeName)) {
      this.appendOutput(
        `<span class="term-error">Invalid theme. Choose: ${validThemes.map((t) => `<span class="cmd-pill">theme ${t}</span>`).join(' ')}</span>`
      );
      return;
    }

    this.container.classList.remove('theme-dark', 'theme-matrix', 'theme-amber', 'theme-cyber');
    this.container.classList.add(`theme-${themeName}`);
    this.appendOutput(`<div class="term-highlight">Theme updated to <strong>${themeName}</strong>.</div>`);
  }

  cmdClear() {
    this.output.innerHTML = '';
  }

  cmdContact() {
    this.appendOutput(`
      <div class="term-card">
        <div class="term-title">📬 Get in Touch</div>
        <p>• <strong>Email:</strong> <a href="mailto:mustafaalishaik@example.com" class="term-link">Contact Mustafa</a></p>
        <p>• <strong>GitHub:</strong> <a href="https://github.com" target="_blank" class="term-link">github.com (Repository Linked)</a></p>
        <p>• <strong>LinkedIn:</strong> <a href="https://linkedin.com" target="_blank" class="term-link">Shaik Mustafa Ali</a></p>
      </div>
    `);
  }

  cmdExit() {
    const modal = document.getElementById('terminal-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
}

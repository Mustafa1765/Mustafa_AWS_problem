// Serverless Defender - Interactive Cloud Arcade Mini-Game
import { sounds } from './audio.js';
import { triggerConfetti } from './particles.js';

export class ServerlessDefenderGame {
  constructor(canvasElement, scoreElement, onVictoryCallback) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.scoreElement = scoreElement;
    this.onVictoryCallback = onVictoryCallback;

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('cloud_high_score') || '0', 10);
    this.gameOver = false;
    this.gameWon = false;
    this.animationId = null;

    this.keys = {
      left: false,
      right: false,
      shoot: false
    };

    this.player = {
      x: 200,
      y: 350,
      width: 36,
      height: 24,
      speed: 6,
      color: '#ff9900' // AWS Orange
    };

    this.lasers = [];
    this.enemies = [];
    this.particles = [];
    this.lastEnemySpawn = 0;
    this.enemyInterval = 1200; // ms
    this.lastShotTime = 0;

    this.setupListeners();
  }

  setupListeners() {
    this.handleKeyDown = (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      if (['Space', 'KeyW', 'ArrowUp'].includes(e.code)) {
        this.keys.shoot = true;
        e.preventDefault();
      }
    };

    this.handleKeyUp = (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
      if (['Space', 'KeyW', 'ArrowUp'].includes(e.code)) this.keys.shoot = false;
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  cleanup() {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  start() {
    this.canvas.width = Math.min(window.innerWidth - 40, 520);
    this.canvas.height = 420;

    this.player.x = this.canvas.width / 2 - this.player.width / 2;
    this.player.y = this.canvas.height - 45;

    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.lasers = [];
    this.enemies = [];
    this.particles = [];
    this.updateScoreDisplay();

    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animationId = requestAnimationFrame(this.loop);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  spawnEnemy() {
    const types = [
      { label: 'DDoS', color: '#ff3366', speed: 1.8, points: 10, width: 34 },
      { label: '404', color: '#ffaa00', speed: 2.2, points: 15, width: 30 },
      { label: 'BUG', color: '#00f0ff', speed: 2.5, points: 20, width: 28 },
      { label: '502', color: '#a855f7', speed: 1.5, points: 25, width: 36 }
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * (this.canvas.width - type.width - 20) + 10;

    this.enemies.push({
      x,
      y: -20,
      width: type.width,
      height: 20,
      label: type.label,
      color: type.color,
      speed: type.speed,
      points: type.points
    });
  }

  shoot() {
    const now = performance.now();
    if (now - this.lastShotTime > 220) {
      this.lastShotTime = now;
      this.lasers.push({
        x: this.player.x + this.player.width / 2 - 2,
        y: this.player.y - 8,
        width: 4,
        height: 12,
        speed: 8,
        color: '#00f0ff'
      });
      sounds.playLaser();
    }
  }

  createExplosion(x, y, color) {
    sounds.playExplosion();
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        radius: Math.random() * 3 + 1,
        color,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  update(now, delta) {
    if (this.gameOver) return;

    // Movement
    if (this.keys.left && this.player.x > 8) {
      this.player.x -= this.player.speed;
    }
    if (this.keys.right && this.player.x < this.canvas.width - this.player.width - 8) {
      this.player.x += this.player.speed;
    }

    // Shooting
    if (this.keys.shoot) {
      this.shoot();
    }

    // Update lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.y -= laser.speed;
      if (laser.y < -10) {
        this.lasers.splice(i, 1);
      }
    }

    // Spawn enemies
    if (now - this.lastEnemySpawn > this.enemyInterval) {
      this.spawnEnemy();
      this.lastEnemySpawn = now;
      if (this.enemyInterval > 650) {
        this.enemyInterval -= 15;
      }
    }

    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.y += enemy.speed;

      // Check collision with player
      if (
        enemy.x < this.player.x + this.player.width &&
        enemy.x + enemy.width > this.player.x &&
        enemy.y < this.player.y + this.player.height &&
        enemy.y + enemy.height > this.player.y
      ) {
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff3366');
        this.gameOver = true;
        break;
      }

      // Check reached bottom (escaped)
      if (enemy.y > this.canvas.height) {
        this.enemies.splice(i, 1);
        continue;
      }

      // Check collision with lasers
      for (let j = this.lasers.length - 1; j >= 0; j--) {
        const laser = this.lasers[j];
        if (
          laser.x < enemy.x + enemy.width &&
          laser.x + laser.width > enemy.x &&
          laser.y < enemy.y + enemy.height &&
          laser.y + laser.height > enemy.y
        ) {
          this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
          this.score += enemy.points;
          this.enemies.splice(i, 1);
          this.lasers.splice(j, 1);
          this.updateScoreDisplay();

          // Check winning condition
          if (this.score >= 100 && !this.gameWon) {
            this.gameWon = true;
            sounds.playVictory();
            triggerConfetti();
            if (this.onVictoryCallback) {
              this.onVictoryCallback(this.score);
            }
          }
          break;
        }
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  updateScoreDisplay() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('cloud_high_score', this.highScore.toString());
    }
    if (this.scoreElement) {
      this.scoreElement.innerHTML = `<span>Score: <strong>${this.score}</strong></span> | <span>Best: <strong>${this.highScore}</strong></span>`;
    }
  }

  draw() {
    this.ctx.fillStyle = '#0a0f1d';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid background
    this.ctx.strokeStyle = 'rgba(0, 180, 255, 0.07)';
    this.ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Draw lasers
    this.lasers.forEach((l) => {
      this.ctx.fillStyle = l.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = l.color;
      this.ctx.fillRect(l.x, l.y, l.width, l.height);
      this.ctx.shadowBlur = 0;
    });

    // Draw enemies
    this.enemies.forEach((e) => {
      this.ctx.fillStyle = e.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = e.color;
      this.ctx.fillRect(e.x, e.y, e.width, e.height);

      // Label
      this.ctx.fillStyle = '#0a0f1d';
      this.ctx.font = 'bold 9px "JetBrains Mono", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(e.label, e.x + e.width / 2, e.y + 14);
      this.ctx.shadowBlur = 0;
    });

    // Draw player (AWS Cloud Lambda Cruiser)
    if (!this.gameOver) {
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = '#ff9900';

      // Triangle ship body
      this.ctx.fillStyle = '#ff9900';
      this.ctx.beginPath();
      this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
      this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
      this.ctx.lineTo(this.player.x + this.player.width / 2, this.player.y + this.player.height - 6);
      this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
      this.ctx.closePath();
      this.ctx.fill();

      // Cockpit glow
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(this.player.x + this.player.width / 2 - 2, this.player.y + 6, 4, 6);
      this.ctx.shadowBlur = 0;
    }

    // Draw particles
    this.particles.forEach((p) => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    });

    // Game Over Overlay
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#ff3366';
      this.ctx.font = 'bold 22px "Outfit", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('SERVER OUTAGE DETECTED', this.canvas.width / 2, this.canvas.height / 2 - 20);

      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.font = '14px "JetBrains Mono", monospace';
      this.ctx.fillText(`Final Resolved Traffic: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);

      this.ctx.fillStyle = '#00f0ff';
      this.ctx.font = 'bold 12px "JetBrains Mono", monospace';
      this.ctx.fillText('Click [Restart Simulator] below to retry', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
  }

  loop(timestamp) {
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(timestamp, delta);
    this.draw();

    this.animationId = requestAnimationFrame(this.loop);
  }
}

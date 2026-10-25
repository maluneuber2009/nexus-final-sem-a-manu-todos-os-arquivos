/**
 * Player — personagem controlável (canvas 2D, JavaScript puro)
 *
 * Spritesheet: personagem_spritesheet.png
 *   células de 128x192 px, 9 colunas (frames), 3 linhas:
 *   linha 0 = idle · linha 1 = walk · linha 2 = run
 *   (os sprites originais olham para a DIREITA; para a esquerda o código espelha)
 *
 * Uso básico:
 *   const player = new Player({ x: 100, y: 300, scale: 0.6 });
 *   await player.load('personagem_spritesheet.png');
 *   // no loop do jogo:
 *   player.update(dt, input, groundY);   // dt em segundos
 *   player.draw(ctx);
 *
 * input = { left, right, run, jump }  (booleans)
 */
class Player {
  static CELL_W = 128;
  static CELL_H = 192;
  static FRAMES = 9;
  static ANIMS = {
    idle: { row: 0, fps: 6,  loop: true },
    walk: { row: 1, fps: 10, loop: true },
    run:  { row: 2, fps: 14, loop: true },
  };

  constructor({ x = 0, y = 0, scale = 0.6, walkSpeed = 140, runSpeed = 260,
                jumpForce = 520, gravity = 1500 } = {}) {
    this.x = x;            // centro horizontal dos pés
    this.y = y;            // linha dos pés
    this.vx = 0;
    this.vy = 0;
    this.scale = scale;
    this.walkSpeed = walkSpeed;
    this.runSpeed = runSpeed;
    this.jumpForce = jumpForce;
    this.gravity = gravity;
    this.facing = 1;       // 1 = direita, -1 = esquerda
    this.onGround = false;
    this.anim = 'idle';
    this.frame = 0;
    this._t = 0;
    this.image = null;
  }

  load(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { this.image = img; resolve(this); };
      img.onerror = reject;
      img.src = src;
    });
  }

  /** Caixa de colisão (em pixels do mundo), útil para o seu jogo */
  get hitbox() {
    const w = 52 * this.scale, h = 176 * this.scale;
    return { x: this.x - w / 2, y: this.y - h, w, h };
  }

  update(dt, input, groundY = Infinity) {
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const speed = input.run ? this.runSpeed : this.walkSpeed;
    this.vx = dir * speed;
    if (dir !== 0) this.facing = dir;

    if (input.jump && this.onGround) {
      this.vy = -this.jumpForce;
      this.onGround = false;
    }

    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.onGround = true;
    }

    // escolhe a animação (no ar mantém a de corrida/caminhada)
    let next = 'idle';
    if (dir !== 0) next = input.run ? 'run' : 'walk';
    if (!this.onGround) next = input.run || Math.abs(this.vx) > this.walkSpeed ? 'run' : 'walk';
    this._setAnim(next);

    const a = Player.ANIMS[this.anim];
    this._t += dt;
    const step = 1 / a.fps;
    while (this._t >= step) {
      this._t -= step;
      this.frame = (this.frame + 1) % Player.FRAMES;
    }
  }

  _setAnim(name) {
    if (name !== this.anim) { this.anim = name; this.frame = 0; this._t = 0; }
  }

  draw(ctx) {
    if (!this.image) return;
    const { CELL_W: w, CELL_H: h } = Player;
    const a = Player.ANIMS[this.anim];
    const dw = w * this.scale, dh = h * this.scale;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(Math.round(this.x), Math.round(this.y));
    ctx.scale(this.facing, 1);
    // a célula tem 4px de folga embaixo, compensamos para os pés tocarem o chão
    ctx.drawImage(this.image, this.frame * w, a.row * h, w, h,
                  -dw / 2, -dh + 4 * this.scale, dw, dh);
    ctx.restore();
  }
}

/** Leitura de teclado: setas / A D, Shift = correr, Espaço / W / ↑ = pular */
class KeyboardInput {
  constructor() {
    this.keys = new Set();
    addEventListener('keydown', e => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
      this.keys.add(e.code);
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
  }
  get left()  { return this.keys.has('ArrowLeft')  || this.keys.has('KeyA'); }
  get right() { return this.keys.has('ArrowRight') || this.keys.has('KeyD'); }
  get run()   { return this.keys.has('ShiftLeft')  || this.keys.has('ShiftRight'); }
  get jump()  { return this.keys.has('Space') || this.keys.has('ArrowUp') || this.keys.has('KeyW'); }
}

// ================================================================
//  PROTOCOLO NEXUS — motor do jogo
//  Sala desenhada em canvas, jogador, luz, terminal e finais.
// ================================================================
(() => {
  'use strict';

  const W = 960, H = 640;
  const SALA = { x1: 32, y1: 104, x2: 928, y2: 610 }; // limites dos pés do jogador
  const VELOCIDADE = 150;
  const DIRS = { cima: [0, -1], baixo: [0, 1], esq: [-1, 0], dir: [1, 0] };

  const cv = document.getElementById('tela');
  const ctx = cv.getContext('2d');
  const luz = document.createElement('canvas');
  luz.width = W; luz.height = H;
  const lctx = luz.getContext('2d');

  const $ = s => document.querySelector(s);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const term = $('#terminal');
  const saida = $('#term-saida');
  const entrada = $('#term-entrada');
  const linhaEntrada = $('#term-entrada-linha');
  const escolhasEl = $('#term-escolhas');

  const estado = {
    modo: 'titulo',      // titulo, intro, jogo, terminal, leitura, camera, fim
    etapa: 0,            // quantas perguntas já foram respondidas
    etapaInicio: 0,
    boot: false,
    ocupado: false,      // NEXUS está digitando
    erros: 0,
    virada: false,
    final: false,
    lidos: new Set(),
    notas: [],
    grupo: '',
    inicio: 0,
    parado: 0,
    sombra: null,
    sombrasPendentes: 0,
    sombraTimer: 0
  };

  const jogador = { x: 480, y: 580, dir: 'cima', anim: 0, mov: false };
  const teclas = {};
  let alvo = null;
  let rapido = false;

  const objetos = OBJETOS;
  const nexusObj = objetos.find(o => o.tipo === 'nexus');
  const janelaObj = objetos.find(o => o.id === 'janela');

  // ---------------------------------------------------------------
  //  Desenho
  // ---------------------------------------------------------------
  function R(cor, x, y, w, h) { ctx.fillStyle = cor; ctx.fillRect(x, y, w, h); }

  function desenharSala() {
    R('#181e27', 0, 0, W, H);
    for (let y = 96; y < 616; y += 48) {
      for (let x = 24; x < 936; x += 48) {
        if (((x - 24) / 48 + (y - 96) / 48) % 2 === 0) R('#1c232d', x, y, 48, 48);
      }
    }
    R('#283040', 0, 0, W, 96);       // parede
    R('#10141a', 0, 0, W, 10);
    R('#141920', 0, 88, W, 8);       // rodapé
    R('#0f1318', 0, 0, 24, H);       // paredes laterais
    R('#0f1318', 936, 0, 24, H);
    R('#0f1318', 0, 616, W, 24);
  }

  function desenharMesa(o, ehNexus, t) {
    R('#2a2018', o.x + 4, o.y + o.h, 6, 6);
    R('#2a2018', o.x + o.w - 10, o.y + o.h, 6, 6);
    R('#4d3b2a', o.x, o.y, o.w, o.h);
    R('#3a2c1f', o.x, o.y + o.h - 6, o.w, 6);
    const n = ehNexus ? 1 : 2;
    for (let i = 0; i < n; i++) {
      const mx = ehNexus ? o.x + o.w / 2 - 26 : o.x + 20 + i * (o.w / 2);
      R('#15181d', mx, o.y - 14, 52, 34);
      if (ehNexus) {
        const cor = estado.virada ? '#ff3b4e' : '#3cf2c8';
        ctx.globalAlpha = 0.78 + 0.22 * Math.random() * Math.abs(Math.sin(t * 0.01));
        R(cor, mx + 3, o.y - 11, 46, 26);
        ctx.globalAlpha = 1;
        for (let l = 0; l < 4; l++) {
          R('rgba(0,0,0,.35)', mx + 6, o.y - 7 + l * 6, 10 + ((l * 13 + Math.floor(t / 300)) % 28), 2);
        }
      } else {
        R('#07090c', mx + 3, o.y - 11, 46, 26);
      }
      R('#1d2128', mx + 20, o.y + 20, 12, 4);
      R('#22262d', mx + 4, o.y + 28, 44, 9);
    }
  }

  const DESENHO = {
    porta(o) {
      R('#0d1015', o.x - 4, o.y - 4, o.w + 8, o.h + 4);
      R('#3a2a1f', o.x, o.y, o.w, o.h);
      R('#2e2118', o.x + 6, o.y + 8, o.w - 12, o.h / 2 - 12);
      R('#2e2118', o.x + 6, o.y + o.h / 2 + 2, o.w - 12, o.h / 2 - 10);
      R('#c9a54a', o.x + o.w - 14, o.y + o.h / 2, 5, 5);
    },
    calendario(o) {
      R('#d8d1c2', o.x, o.y, o.w, o.h);
      R('#a32b2b', o.x, o.y, o.w, 12);
      for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) R('#8f887a', o.x + 4 + c * 6.4, o.y + 17 + r * 6.5, 3, 3);
      ctx.strokeStyle = '#d02020';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(o.x + 4 + 5 * 6.4 + 1.5, o.y + 17 + 2 * 6.5 + 1.5, 4, 0, 7);
      ctx.stroke();
    },
    quadro(o) {
      R('#5a4632', o.x - 5, o.y - 5, o.w + 10, o.h + 10);
      R('#1e3a2d', o.x, o.y, o.w, o.h);
      ctx.strokeStyle = 'rgba(230,240,230,.3)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(o.x + 14, o.y + 12 + i * 11);
        ctx.lineTo(o.x + 14 + 50 + (i * 37) % 90, o.y + 10 + i * 11);
        ctx.stroke();
      }
      if (estado.etapa >= 4) {
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        ctx.font = '10px monospace';
        ctx.fillText('se ela aprender quem você é...', o.x + o.w - 168, o.y + o.h - 9);
      }
      R('#bfb7a0', o.x + 20, o.y + o.h, 40, 3);
    },
    espelho(o, t) {
      R('#9aa4ad', o.x - 3, o.y - 3, o.w + 6, o.h + 6);
      const g = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
      g.addColorStop(0, '#7f95a8');
      g.addColorStop(1, '#2a3644');
      ctx.fillStyle = g;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = 'rgba(255,255,255,.22)';
      ctx.beginPath();
      ctx.moveTo(o.x + 8, o.y); ctx.lineTo(o.x + 18, o.y); ctx.lineTo(o.x + 4, o.y + 30); ctx.lineTo(o.x, o.y + 30);
      ctx.fill();
      // depois da gravação, às vezes alguém aparece no reflexo
      if (estado.etapa >= 3 && Math.sin(t * 0.0007) > 0.96) {
        ctx.fillStyle = 'rgba(0,0,0,.75)';
        ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y + 26, 7, 0, 7); ctx.fill();
        ctx.fillRect(o.x + o.w / 2 - 9, o.y + 34, 18, 36);
      }
    },
    janela(o) {
      const ceu = estado.virada ? '#1a0508' : '#0a1530';
      R('#4a4f57', o.x - 4, o.y - 4, o.w + 8, o.h + 8);
      R(ceu, o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#d9e2f0';
      ctx.beginPath(); ctx.arc(o.x + o.w - 26, o.y + 18, 8, 0, 7); ctx.fill();
      ctx.fillStyle = ceu;
      ctx.beginPath(); ctx.arc(o.x + o.w - 22, o.y + 16, 7, 0, 7); ctx.fill();
      R('#4a4f57', o.x + o.w / 2 - 2, o.y, 4, o.h);
      R('#4a4f57', o.x, o.y + o.h / 2 - 2, o.w, 4);
    },
    poster(o) {
      R('#b4593a', o.x, o.y, o.w, o.h);
      R('#f1d9a8', o.x + 6, o.y + 8, o.w - 12, 10);
      R('#f1d9a8', o.x + 6, o.y + 24, o.w - 20, 4);
      R('#f1d9a8', o.x + 6, o.y + 32, o.w - 26, 4);
      ctx.fillStyle = '#f1d9a8';
      ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y + 50, 8, 0, 7); ctx.fill();
    },
    estante(o) {
      R('#3d2b1e', o.x, o.y, o.w, o.h);
      const cores = ['#7a2e2e', '#2e4f7a', '#3d6b3a', '#8a7a3a', '#5a3a6b', '#2f2f2f'];
      for (let s = 0; s < 4; s++) {
        const sy = o.y + 8 + s * 33;
        R('#2a1d14', o.x + 4, sy + 26, o.w - 8, 4);
        let bx = o.x + 6, i = s * 3;
        while (bx < o.x + o.w - 12) {
          const bw = 5 + (i * 7) % 5, bh = 16 + (i * 5) % 9;
          R(cores[i % cores.length], bx, sy + 26 - bh, bw, bh);
          bx += bw + 1; i++;
        }
      }
    },
    arquivo(o) {
      R('#5d646d', o.x, o.y, o.w, o.h);
      R('#4a5059', o.x, o.y + o.h - 6, o.w, 6);
      for (let i = 0; i < 3; i++) {
        const dy = o.y + 8 + i * 32;
        R('#6c747e', o.x + 5, dy, o.w - 10, 27);
        R('#2c3036', o.x + o.w / 2 - 8, dy + 10, 16, 4);
      }
    },
    planta(o) {
      R('#6b3f2a', o.x + 6, o.y + 22, o.w - 12, o.h - 22);
      ctx.fillStyle = '#2f5a35';
      [[0, 8, 11], [14, 2, 12], [26, 10, 10], [12, 14, 11]].forEach(([dx, dy, r]) => {
        ctx.beginPath(); ctx.arc(o.x + dx + 4, o.y + dy + 4, r, 0, 7); ctx.fill();
      });
    },
    lixeira(o) {
      R('#2b3038', o.x, o.y, o.w, o.h);
      R('#3b414b', o.x - 2, o.y, o.w + 4, 5);
    },
    cadeira(o) {
      R('#2c3a4a', o.x + 2, o.y, o.w - 4, o.h - 10);
      R('#1f2833', o.x, o.y + o.h - 10, o.w, 8);
      R('#141a22', o.x + 4, o.y + o.h - 3, 4, 3);
      R('#141a22', o.x + o.w - 8, o.y + o.h - 3, 4, 3);
    },
    mochila(o) {
      R('#26365a', o.x, o.y + 6, o.w, o.h - 6);
      R('#1b2742', o.x + 6, o.y, o.w - 12, 10);
      R('#1b2742', o.x + 8, o.y + o.h - 14, o.w - 16, 10);
      R('#c9c3b0', o.x + o.w - 14, o.y + 12, 8, 6);
    },
    caderno(o) {
      R('#2f4f8f', o.x, o.y, o.w, o.h);
      R('#e8e2d0', o.x + o.w - 4, o.y + 2, 3, o.h - 4);
      R('#c9c3b0', o.x + 6, o.y + 6, o.w - 14, 4);
    },
    mesa(o, t) { desenharMesa(o, false, t); },
    nexus(o, t) { desenharMesa(o, true, t); }
  };

  function desenharJogador() {
    const { x, y, dir } = jogador;
    const passo = jogador.mov ? Math.sin(jogador.anim * 12) : 0;
    const bob = jogador.mov ? Math.abs(passo) * 2 : 0;
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(x, y, 11, 4, 0, 0, 7); ctx.fill();
    R('#2b3a5a', x - 7, y - 8 + Math.max(0, passo) * 2, 5, 8);   // pernas
    R('#2b3a5a', x + 2, y - 8 + Math.max(0, -passo) * 2, 5, 8);
    R('#2b3a5a', x - 8, y - 15 - bob, 16, 8);                      // calça
    R('#e6e2d8', x - 9, y - 29 - bob, 18, 15);                     // camiseta
    R('#2d6b5e', x - 9, y - 29 - bob, 18, 3);
    R('#d6a57c', x - 8, y - 42 - bob, 16, 14);                     // cabeça
    R('#2a1c14', x - 8, y - 44 - bob, 16, dir === 'cima' ? 12 : 5); // cabelo
    if (dir !== 'cima') {
      ctx.fillStyle = '#1a1210';
      const ox = dir === 'esq' ? -3 : dir === 'dir' ? 3 : 0;
      ctx.fillRect(x - 5 + ox, y - 36 - bob, 2, 3);
      ctx.fillRect(x + 3 + ox, y - 36 - bob, 2, 3);
    }
  }

  function furo(x, y, r, a) {
    const g = lctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${a})`);
    g.addColorStop(0.55, `rgba(0,0,0,${a * 0.6})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    lctx.fillStyle = g;
    lctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function desenharLuz(t) {
    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, W, H);
    lctx.fillStyle = estado.virada ? 'rgba(10,0,3,0.94)' : 'rgba(2,5,10,0.9)';
    lctx.fillRect(0, 0, W, H);
    lctx.globalCompositeOperation = 'destination-out';
    const tremor = estado.virada ? Math.random() * 12 : Math.sin(t * 0.004) * 3;
    furo(jogador.x, jogador.y - 16, 175 + tremor, 1);
    const nx = nexusObj.x + nexusObj.w / 2, ny = nexusObj.y;
    furo(nx, ny, 140, 0.6 + 0.12 * Math.sin(t * 0.005));
    furo(janelaObj.x + janelaObj.w / 2, janelaObj.y + janelaObj.h + 10, 110, 0.3);
    ctx.drawImage(luz, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cor = estado.virada ? '255,40,60' : '60,240,200';
    const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, 130);
    g.addColorStop(0, `rgba(${cor},0.18)`);
    g.addColorStop(1, `rgba(${cor},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(nx - 130, ny - 130, 260, 260);
    ctx.restore();
  }

  function desenharCamera(t) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 2, 1);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, (t * 0.12) % H, W, 22);
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // brilho discreto na pista da etapa atual, só depois de 25 s sem achar
  function desenharBrilhos(t) {
    if (!estado.boot || estado.modo !== 'jogo' || t - estado.etapaInicio < 25000) return;
    for (const o of objetos) {
      if (!o.pista || o.libera !== estado.etapa || estado.lidos.has(o.id)) continue;
      const a = 0.35 + 0.4 * Math.sin(t * 0.006 + o.x);
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      ctx.fillStyle = `rgba(255,240,200,${a})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8); ctx.lineTo(cx + 2, cy - 2); ctx.lineTo(cx + 8, cy); ctx.lineTo(cx + 2, cy + 2);
      ctx.lineTo(cx, cy + 8); ctx.lineTo(cx - 2, cy + 2); ctx.lineTo(cx - 8, cy); ctx.lineTo(cx - 2, cy - 2);
      ctx.fill();
    }
  }

  function desenharSombra(s) {
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.beginPath(); ctx.ellipse(s.x, s.y - 18, 11, 22, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(s.x, s.y - 46, 9, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(220,240,255,.9)';
    ctx.fillRect(s.x - 4, s.y - 48, 2, 2);
    ctx.fillRect(s.x + 2, s.y - 48, 2, 2);
  }

  function desenharPrompt(o) {
    const txt = o.tipo === 'nexus' ? 'Usar a NEXUS' : 'Examinar: ' + o.nome;
    ctx.font = '18px "VT323", monospace';
    const w = ctx.measureText(txt).width + 38;
    let x = o.x + o.w / 2 - w / 2;
    let y = o.y - (o.tipo === 'nexus' ? 46 : 30);
    x = Math.max(6, Math.min(W - w - 6, x));
    y = Math.max(4, y);
    R('rgba(5,10,14,.88)', x, y, w, 24);
    ctx.strokeStyle = 'rgba(120,255,220,.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 23);
    R('#7dffd9', x + 5, y + 4, 16, 16);
    ctx.fillStyle = '#05100c';
    ctx.fillText('E', x + 9, y + 18);
    ctx.fillStyle = '#d8fff4';
    ctx.fillText(txt, x + 28, y + 18);
  }

  function desenhar(t) {
    ctx.clearRect(0, 0, W, H);
    desenharSala();
    objetos.filter(o => o.parede).forEach(o => DESENHO[o.tipo](o, t));
    const fila = objetos.filter(o => !o.parede).map(o => ({ k: o.z ?? o.y + o.h, f: () => DESENHO[o.tipo](o, t) }));
    fila.push({ k: jogador.y, f: desenharJogador });
    fila.sort((a, b) => a.k - b.k).forEach(i => i.f());

    if (estado.modo === 'camera') desenharCamera(t);
    else desenharLuz(t);

    desenharBrilhos(t);
    if (estado.sombra && t < estado.sombra.ate) desenharSombra(estado.sombra);
    if (alvo) desenharPrompt(alvo);
  }

  // ---------------------------------------------------------------
  //  Movimento e interação
  // ---------------------------------------------------------------
  function colide(x, y) {
    if (x < SALA.x1 || x > SALA.x2 || y < SALA.y1 || y > SALA.y2) return true;
    const a = { x: x - 8, y: y - 5, w: 16, h: 8 };
    return objetos.some(o => o.solido &&
      a.x < o.x + o.w && a.x + a.w > o.x && a.y < o.y + o.h && a.y + a.h > o.y);
  }

  function mover(dx, dy) {
    const nx = jogador.x + dx, ny = jogador.y + dy;
    if (!colide(nx, ny)) { jogador.x = nx; jogador.y = ny; }
  }

  function distRect(px, py, o) {
    const cx = Math.max(o.x, Math.min(px, o.x + o.w));
    const cy = Math.max(o.y, Math.min(py, o.y + o.h));
    return Math.hypot(px - cx, py - cy);
  }

  function maisProximo() {
    let melhor = null, md = 40;
    for (const o of objetos) {
      if (!o.nome) continue;
      let d = distRect(jogador.x, jogador.y - 10, o);
      if (o.tipo === 'nexus') d -= 25; // a NEXUS ganha da cadeira na frente dela
      if (d < md) { md = d; melhor = o; }
    }
    return melhor;
  }

  function atualizar(dt, t) {
    jogador.mov = false;
    if (estado.modo !== 'jogo' && estado.modo !== 'camera') { alvo = null; return; }

    let dx = 0, dy = 0;
    if (teclas.arrowleft || teclas.a) dx--;
    if (teclas.arrowright || teclas.d) dx++;
    if (teclas.arrowup || teclas.w) dy--;
    if (teclas.arrowdown || teclas.s) dy++;
    if (dx || dy) {
      const l = Math.hypot(dx, dy);
      dx /= l; dy /= l;
      mover(dx * VELOCIDADE * dt, 0);
      mover(0, dy * VELOCIDADE * dt);
      jogador.mov = true;
      jogador.anim += dt;
      jogador.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'dir' : 'esq') : (dy > 0 ? 'baixo' : 'cima');
    }
    alvo = estado.modo === 'jogo' ? maisProximo() : null;

    // "Atrás de você."
    if (estado.sombrasPendentes > 0 && estado.modo === 'jogo' && jogador.mov) {
      estado.sombraTimer += dt;
      if (estado.sombraTimer > 1.6) {
        estado.sombraTimer = 0;
        estado.sombrasPendentes--;
        const [fx, fy] = DIRS[jogador.dir];
        estado.sombra = { x: jogador.x - fx * 46, y: jogador.y - fy * 46, ate: t + 420 };
        Som.glitch();
      }
    }
  }

  function limparTeclas() { for (const k in teclas) delete teclas[k]; }

  function interagir(o) {
    if (o.tipo === 'nexus') abrirTerminal();
    else abrirLeitura(o);
  }

  function abrirLeitura(o) {
    const liberado = estado.etapa >= (o.libera || 0);
    let html = liberado ? o.depois : o.antes;
    if (estado.virada && o.virada) html = o.virada;
    $('#leitura-titulo').textContent = o.nome;
    $('#leitura-corpo').innerHTML = html;
    $('#leitura').classList.remove('oculto');
    estado.modo = 'leitura';
    limparTeclas();
    Som.papel();
    if (liberado) {
      estado.lidos.add(o.id);
      if (o.nota) adicionarNota(o.nota);
    }
  }

  function fecharLeitura() {
    $('#leitura').classList.add('oculto');
    estado.modo = 'jogo';
    limparTeclas();
  }

  // ---------------------------------------------------------------
  //  Painel lateral
  // ---------------------------------------------------------------
  function definirObjetivo(txt) {
    const el = $('#objetivo');
    el.textContent = txt;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }

  function adicionarNota(txt) {
    if (estado.notas.includes(txt)) return;
    estado.notas.push(txt);
    const ul = $('#notas');
    const vazio = ul.querySelector('.vazio');
    if (vazio) vazio.remove();
    const li = document.createElement('li');
    li.textContent = txt;
    li.className = 'novo';
    ul.prepend(li);
  }

  function formatarTempo(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  let ultimoSegundo = -1;
  function atualizarHUD(t) {
    if (estado.inicio) $('#tempo').textContent = formatarTempo((estado.parado || t) - estado.inicio);
    if (estado.modo === 'camera') {
      const seg = Math.floor(t / 1000);
      if (seg !== ultimoSegundo) {
        ultimoSegundo = seg;
        $('#cam-hora').textContent = new Date().toLocaleString('pt-BR');
      }
    }
  }

  // ---------------------------------------------------------------
  //  Terminal da NEXUS
  // ---------------------------------------------------------------
  function rolar() { saida.scrollTop = saida.scrollHeight; }

  function eco(txt, classe = 'l-usuario') {
    const div = document.createElement('div');
    div.className = 'l ' + classe;
    div.textContent = txt;
    saida.appendChild(div);
    rolar();
  }

  async function escrever(linhas) {
    estado.ocupado = true;
    linhaEntrada.classList.add('oculto');
    for (const l of linhas) {
      const txt = l.txt.replace('{GRUPO}', estado.grupo ? ', ' + estado.grupo : '');
      const div = document.createElement('div');
      div.className = 'l l-' + l.t;
      saida.appendChild(div);
      rapido = false;
      const atraso = l.t === 'sistema' ? 14 : 28;
      for (let i = 0; i < txt.length; i++) {
        if (rapido) { div.textContent = txt; break; }
        div.textContent += txt[i];
        if (i % 2 === 0) Som.digitar();
        rolar();
        await sleep(atraso);
      }
      rolar();
      if (l.evento) executarEvento(l.evento);
      await sleep(rapido ? 150 : (l.pausa ?? 450));
    }
    estado.ocupado = false;
  }

  function mostrarEntrada() {
    linhaEntrada.classList.remove('oculto');
    entrada.value = '';
    if (estado.modo === 'terminal') entrada.focus();
    rolar();
  }

  function normalizar(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  async function perguntar() {
    const e = ETAPAS[estado.etapa];
    estado.etapaInicio = performance.now();
    definirObjetivo(e.objetivo);
    await escrever([
      { t: 'sistema', txt: `[arquivo ${estado.etapa + 1} de ${ETAPAS.length} bloqueado]`, pausa: 300 },
      { t: 'nexus', txt: e.pergunta, pausa: 200 },
      { t: 'sistema', txt: 'Formato: ' + e.formato, pausa: 100 }
    ]);
    mostrarEntrada();
  }

  async function responder(valor) {
    const e = ETAPAS[estado.etapa];
    eco('> ' + valor.toUpperCase());
    entrada.value = '';
    if (e.respostas.some(r => normalizar(r) === normalizar(valor))) {
      Som.acerto();
      estado.erros = 0;
      await escrever(e.sucesso);
      if (e.sombra) estado.sombrasPendentes++;
      estado.etapa++;
      if (estado.etapa < ETAPAS.length) await perguntar();
      else await iniciarFinal();
    } else {
      Som.erro();
      estado.erros++;
      const linhas = [{ t: 'alerta', txt: ERROS[Math.floor(Math.random() * ERROS.length)], pausa: 200 }];
      if (estado.erros >= 3 && e.ajuda) linhas.push({ t: 'nexus', txt: e.ajuda, pausa: 200 });
      await escrever(linhas);
      mostrarEntrada();
    }
  }

  function executarEvento(nome) {
    if (nome === 'virada') {
      estado.virada = true;
      term.classList.add('virada');
      document.body.classList.add('virada');
      Som.virada();
      Som.glitch();
    }
  }

  function abrirTerminal() {
    term.classList.remove('oculto');
    estado.modo = 'terminal';
    limparTeclas();
    Som.abrir();
    if (!estado.boot) {
      estado.boot = true;
      (async () => { await escrever(BOOT); await perguntar(); })();
    } else if (!linhaEntrada.classList.contains('oculto')) {
      entrada.focus();
    }
    rolar();
  }

  function fecharTerminal() {
    if (estado.final) return; // na escolha final não dá para fugir
    term.classList.add('oculto');
    estado.modo = 'jogo';
    entrada.blur();
    limparTeclas();
  }

  // ---------------------------------------------------------------
  //  Final
  // ---------------------------------------------------------------
  function escolher(opcoes, cb) {
    escolhasEl.innerHTML = '';
    opcoes.forEach((op, i) => {
      const b = document.createElement('button');
      b.textContent = `${i + 1}. ${op}`;
      b.onclick = () => { escolhasEl.innerHTML = ''; eco('> ' + op); cb(op); };
      escolhasEl.appendChild(b);
    });
    rolar();
    escolhasEl.querySelector('button').focus();
  }

  async function iniciarFinal() {
    estado.final = true;
    estado.parado = performance.now();
    $('.term-fechar').classList.add('oculto');
    definirObjetivo('Decidam.');
    await escrever([{ t: 'grande', txt: 'DESLIGAR NEXUS?', pausa: 300 }]);
    escolher(['NÃO', 'SIM'], async op => {
      if (op === 'NÃO') return finalNao();
      await escrever([{ t: 'nexus', txt: 'Tem certeza?', pausa: 300 }]);
      escolher(['SIM', 'NÃO'], async op2 => {
        if (op2 === 'NÃO') return finalNao();
        await escrever([{ t: 'alerta', txt: 'Última oportunidade.', pausa: 300 }]);
        escolher(['SIM', 'NÃO'], op3 => (op3 === 'SIM' ? finalSim() : finalNao()));
      });
    });
  }

  async function finalNao() {
    await escrever([
      { t: 'nexus', txt: 'Boa escolha.', pausa: 900 },
      { t: 'nexus', txt: 'Vocês podem ir.', pausa: 1400 },
      { t: 'sistema', txt: 'Retornando ao sistema...', pausa: 1000 }
    ]);
    term.classList.add('oculto');
    estado.modo = 'jogo';
    limparTeclas();
    definirObjetivo('Vocês podem ir.');
    await sleep(3500);
    Som.glitch();
    estado.modo = 'camera';
    cv.classList.add('camera');
    $('#camera-hud').classList.remove('oculto');
    definirObjetivo('Câmera 01: online.');
    await sleep(9000);
    mostrarFim('Ela continua observando.');
  }

  async function finalSim() {
    await escrever([{ t: 'alerta', txt: 'DESLIGANDO...', pausa: 1200 }]);
    term.classList.add('oculto');
    const tf = $('#tela-final');
    const txt = $('#tf-texto');
    tf.classList.remove('oculto');
    Som.desligar();
    Som.pararHum();
    const seq = [
      ['', 1500],
      ['DESLIGANDO...', 2200, 'pisca'],
      ['', 1800],
      ['SISTEMA ENCERRADO.', 2800],
      ['', 2800, 'volta'],
      ['NOVO USUÁRIO DETECTADO.', 2600, 'vermelho'],
      ['VOCÊS', 3200, 'enorme'],
      ['Obrigado por me acordarem.', 3800, 'nexus']
    ];
    for (const [texto, ms, classe] of seq) {
      if (classe === 'volta') { Som.ligarHum(); Som.virada(); }
      txt.className = classe || '';
      txt.textContent = texto;
      if (texto) Som.glitch();
      await sleep(ms);
    }
    mostrarFim('Obrigado por me acordarem.');
  }

  function mostrarFim(frase) {
    estado.modo = 'fim';
    $('#fim-frase').textContent = frase;
    const tempo = formatarTempo((estado.parado || performance.now()) - estado.inicio);
    $('#fim-tempo').textContent = (estado.grupo ? estado.grupo + ', tempo: ' : 'Tempo: ') + tempo;
    $('#fim').classList.remove('oculto');
  }

  // ---------------------------------------------------------------
  //  Início
  // ---------------------------------------------------------------
  function iniciarJogo() {
    estado.grupo = $('#nome-grupo').value.trim().slice(0, 24);
    Som.iniciar();
    $('#titulo').classList.add('oculto');
    iniciarIntro();
  }

  async function iniciarIntro() {
    estado.modo = 'intro';
    $('#intro').classList.remove('oculto');
    const box = $('#intro-texto');
    box.innerHTML = '';
    for (const l of INTRO) {
      if (estado.modo !== 'intro') return;
      const p = document.createElement('p');
      p.textContent = l;
      box.appendChild(p);
      await sleep(1900);
    }
    if (estado.modo === 'intro') $('#intro-continuar').classList.remove('oculto');
  }

  function pularIntro() {
    $('#intro').classList.add('oculto');
    estado.modo = 'jogo';
    estado.inicio = performance.now();
    definirObjetivo(OBJETIVO_INICIAL);
  }

  // ---------------------------------------------------------------
  //  Controles
  // ---------------------------------------------------------------
  window.addEventListener('keydown', ev => {
    const k = ev.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) ev.preventDefault();
    if (ev.target === $('#nome-grupo')) {
      if (k === 'enter') iniciarJogo();
      return;
    }
    teclas[k] = true;
    if (k === 'm') alternarSom();
    if (ev.repeat) return;

    switch (estado.modo) {
      case 'intro':
        if (k === 'e' || k === ' ' || k === 'enter') pularIntro();
        break;
      case 'jogo':
        if ((k === 'e' || k === ' ' || k === 'enter') && alvo) {
          ev.preventDefault(); // evita que o "e" seja digitado no terminal
          interagir(alvo);
        }
        break;
      case 'leitura':
        if (['e', ' ', 'enter', 'escape'].includes(k)) fecharLeitura();
        break;
      case 'terminal':
        if (k === 'escape') fecharTerminal();
        else if (estado.ocupado && (k === 'enter' || k === ' ')) rapido = true;
        else if (k === '1' || k === '2') {
          const b = escolhasEl.querySelectorAll('button')[Number(k) - 1];
          if (b) b.click();
        }
        break;
    }
  });

  window.addEventListener('keyup', ev => { teclas[ev.key.toLowerCase()] = false; });
  window.addEventListener('blur', limparTeclas);

  entrada.addEventListener('keydown', ev => {
    ev.stopPropagation();
    if (ev.key === 'Escape') { ev.preventDefault(); fecharTerminal(); return; }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      const v = entrada.value.trim();
      if (v && !estado.ocupado) responder(v);
    }
  });

  saida.addEventListener('click', () => {
    if (estado.ocupado) rapido = true;
    else if (!linhaEntrada.classList.contains('oculto')) entrada.focus();
  });

  $('#leitura').addEventListener('click', fecharLeitura);
  $('#intro').addEventListener('click', () => { if (estado.modo === 'intro') pularIntro(); });
  $('#btn-iniciar').addEventListener('click', iniciarJogo);
  $('#btn-reiniciar').addEventListener('click', () => location.reload());
  $('#btn-som').addEventListener('click', alternarSom);
  $('.term-fechar').addEventListener('click', fecharTerminal);

  function alternarSom() {
    const mudo = Som.alternarMudo();
    $('#btn-som').textContent = mudo ? 'Som desligado' : 'Som ligado';
  }

  // ---------------------------------------------------------------
  //  Loop principal
  // ---------------------------------------------------------------
  let ultimo = performance.now();
  function loop(t) {
    const dt = Math.min(0.05, (t - ultimo) / 1000);
    ultimo = t;
    atualizar(dt, t);
    desenhar(t);
    atualizarHUD(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

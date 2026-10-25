// ================================================================
// PROTOCOLO NEXUS — SALA, PERSONAGEM E ILUMINAÇÃO
// ================================================================

const W = 960;
const H = 640;

const ctx = document.getElementById("tela").getContext("2d");

// ================================================================
// CAMADA DE ILUMINAÇÃO
// ================================================================

const camadaLuz = document.createElement("canvas");
camadaLuz.width = W;
camadaLuz.height = H;

const ctxLuz = camadaLuz.getContext("2d");

// Intensidade da escuridão: valores menores deixam a sala mais clara.
const INTENSIDADE_ESCURO = 0.92;

// Raio da iluminação ao redor do personagem.
const RAIO_LUZ = 143;

// Desenha a escuridão e abre uma área de luz ao redor do jogador.
function desenharIluminacao() {
    ctxLuz.clearRect(0, 0, W, H);

    // Escurece a sala sem esconder completamente os objetos.
    ctxLuz.fillStyle = `rgba(4, 7, 18, ${INTENSIDADE_ESCURO})`;
    ctxLuz.fillRect(0, 0, W, H);

    // Posição da luz: acompanha os pés do personagem,
    // com um pequeno deslocamento para cima.
    const luzX = jogador.x;
    const luzY = jogador.y - 15;

    // Cria uma transição suave entre a área iluminada e a escuridão.
    const gradiente = ctxLuz.createRadialGradient(
        luzX,
        luzY,
        20,
        luzX,
        luzY,
        RAIO_LUZ
    );

    gradiente.addColorStop(0, "rgba(0, 0, 0, 1)");
    gradiente.addColorStop(0.45, "rgba(0, 0, 0, 0.95)");
    gradiente.addColorStop(0.75, "rgba(0, 0, 0, 0.65)");
    gradiente.addColorStop(1, "rgba(0, 0, 0, 0)");

    // Apaga a escuridão no centro do gradiente,
    // revelando o cenário original.
    ctxLuz.globalCompositeOperation = "destination-out";
    ctxLuz.fillStyle = gradiente;
    ctxLuz.beginPath();
    ctxLuz.arc(luzX, luzY, RAIO_LUZ, 0, Math.PI * 2);
    ctxLuz.fill();

    ctxLuz.globalCompositeOperation = "source-over";

    // Aplica a camada escura sobre a cena completa.
    ctx.drawImage(camadaLuz, 0, 0);
}

// ================================================================
// FUNÇÕES AUXILIARES DE DESENHO
// ================================================================

function R(cor, x, y, w, h) {
    ctx.fillStyle = cor;
    ctx.fillRect(x, y, w, h);
}

function circulo(cor, x, y, r) {
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

// ================================================================
// CHÃO E PAREDES
// ================================================================

function desenharSala() {
    R("#b9bcc0", 0, 0, W, H);

    // Piso quadriculado.
    for (let y = 96; y < 616; y += 48) {
        for (let x = 24; x < 936; x += 48) {
            const casa = (x - 24) / 48 + (y - 96) / 48;

            if (casa % 2 === 0) {
                R("#a9adb2", x, y, 48, 48);
            }
        }
    }

    // Parede superior.
    R("#8e9aa8", 0, 0, W, 96);
    R("#5b6572", 0, 0, W, 10);
    R("#4a525c", 0, 88, W, 8);

    // Paredes laterais e inferior.
    R("#5b6572", 0, 0, 24, H);
    R("#5b6572", 936, 0, 24, H);
    R("#5b6572", 0, 616, W, 24);
}

// ================================================================
// MESAS E COMPUTADORES
// ================================================================

function desenharMesa(o, ehNexus, t) {
    // Pés e tampo.
    R("#2a2018", o.x + 4, o.y + o.h, 6, 6);
    R("#2a2018", o.x + o.w - 10, o.y + o.h, 6, 6);
    R("#4d3b2a", o.x, o.y, o.w, o.h);
    R("#3a2c1f", o.x, o.y + o.h - 6, o.w, 6);

    const monitores = ehNexus ? 1 : 2;

    for (let i = 0; i < monitores; i++) {
        const mx = ehNexus
            ? o.x + o.w / 2 - 26
            : o.x + 20 + i * (o.w / 2);

        // Moldura do monitor.
        R("#15181d", mx, o.y - 14, 52, 34);

        if (ehNexus) {
            // Monitor NEXUS ligado.
            R("#3cf2c8", mx + 3, o.y - 11, 46, 26);

            for (let l = 0; l < 4; l++) {
                const largura =
                    10 + ((l * 13 + Math.floor(t / 300)) % 28);

                R(
                    "rgba(0,0,0,.35)",
                    mx + 6,
                    o.y - 7 + l * 6,
                    largura,
                    2
                );
            }
        } else {
            // Monitores desligados.
            R("#07090c", mx + 3, o.y - 11, 46, 26);
        }

        // Base e teclado.
        R("#1d2128", mx + 20, o.y + 20, 12, 4);
        R("#22262d", mx + 4, o.y + 28, 44, 9);
    }
}

// ================================================================
// DESENHO DOS OBJETOS
// ================================================================

const DESENHO = {
    porta(o) {
        R("#0d1015", o.x - 4, o.y - 4, o.w + 8, o.h + 4);
        R("#3a2a1f", o.x, o.y, o.w, o.h);
        R("#2e2118", o.x + 6, o.y + 8, o.w - 12, o.h / 2 - 12);

        R(
            "#2e2118",
            o.x + 6,
            o.y + o.h / 2 + 2,
            o.w - 12,
            o.h / 2 - 10
        );

        R("#c9a54a", o.x + o.w - 14, o.y + o.h / 2, 5, 5);
    },

    calendario(o) {
        R("#d8d1c2", o.x, o.y, o.w, o.h);
        R("#a32b2b", o.x, o.y, o.w, 12);

        for (let linha = 0; linha < 5; linha++) {
            for (let col = 0; col < 7; col++) {
                R(
                    "#8f887a",
                    o.x + 4 + col * 6.4,
                    o.y + 17 + linha * 6.5,
                    3,
                    3
                );
            }
        }

        // Dia 17 circulado.
        ctx.strokeStyle = "#d02020";
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        ctx.arc(
            o.x + 4 + 5 * 6.4 + 1.5,
            o.y + 17 + 2 * 6.5 + 1.5,
            4,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    },

    quadro(o) {
        R("#5a4632", o.x - 5, o.y - 5, o.w + 10, o.h + 10);
        R("#1e3a2d", o.x, o.y, o.w, o.h);

        ctx.strokeStyle = "rgba(230,240,230,.3)";
        ctx.lineWidth = 1.5;

        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(o.x + 14, o.y + 12 + i * 11);

            ctx.lineTo(
                o.x + 64 + (i * 37) % 90,
                o.y + 10 + i * 11
            );

            ctx.stroke();
        }

        R("#bfb7a0", o.x + 20, o.y + o.h, 40, 3);
    },

    espelho(o) {
        R("#9aa4ad", o.x - 3, o.y - 3, o.w + 6, o.h + 6);

        const vidro = ctx.createLinearGradient(
            o.x,
            o.y,
            o.x + o.w,
            o.y + o.h
        );

        vidro.addColorStop(0, "#7f95a8");
        vidro.addColorStop(1, "#2a3644");

        ctx.fillStyle = vidro;
        ctx.fillRect(o.x, o.y, o.w, o.h);

        ctx.fillStyle = "rgba(255,255,255,.22)";
        ctx.beginPath();
        ctx.moveTo(o.x + 8, o.y);
        ctx.lineTo(o.x + 18, o.y);
        ctx.lineTo(o.x + 4, o.y + 30);
        ctx.lineTo(o.x, o.y + 30);
        ctx.fill();
    },

    janela(o) {
        const ceu = "#0a1530";

        R("#4a4f57", o.x - 4, o.y - 4, o.w + 8, o.h + 8);
        R(ceu, o.x, o.y, o.w, o.h);

        // Lua crescente.
        circulo("#d9e2f0", o.x + o.w - 26, o.y + 18, 8);
        circulo(ceu, o.x + o.w - 22, o.y + 16, 7);

        // Divisórias da janela.
        R("#4a4f57", o.x + o.w / 2 - 2, o.y, 4, o.h);
        R("#4a4f57", o.x, o.y + o.h / 2 - 2, o.w, 4);
    },

    poster(o) {
        R("#b4593a", o.x, o.y, o.w, o.h);
        R("#f1d9a8", o.x + 6, o.y + 8, o.w - 12, 10);
        R("#f1d9a8", o.x + 6, o.y + 24, o.w - 20, 4);
        R("#f1d9a8", o.x + 6, o.y + 32, o.w - 26, 4);

        circulo("#f1d9a8", o.x + o.w / 2, o.y + 50, 8);
    },

    estante(o) {
        R("#3d2b1e", o.x, o.y, o.w, o.h);

        const cores = [
            "#7a2e2e",
            "#2e4f7a",
            "#3d6b3a",
            "#8a7a3a",
            "#5a3a6b",
            "#2f2f2f"
        ];

        for (let prateleira = 0; prateleira < 4; prateleira++) {
            const py = o.y + 8 + prateleira * 33;

            R("#2a1d14", o.x + 4, py + 26, o.w - 8, 4);

            let bx = o.x + 6;
            let i = prateleira * 3;

            while (bx < o.x + o.w - 12) {
                const largura = 5 + (i * 7) % 5;
                const altura = 16 + (i * 5) % 9;

                R(
                    cores[i % cores.length],
                    bx,
                    py + 26 - altura,
                    largura,
                    altura
                );

                bx += largura + 1;
                i++;
            }
        }
    },

    arquivo(o) {
        R("#5d646d", o.x, o.y, o.w, o.h);
        R("#4a5059", o.x, o.y + o.h - 6, o.w, 6);

        for (let i = 0; i < 3; i++) {
            const gy = o.y + 8 + i * 32;

            R("#6c747e", o.x + 5, gy, o.w - 10, 27);
            R("#2c3036", o.x + o.w / 2 - 8, gy + 10, 16, 4);
        }
    },

    planta(o) {
        R("#6b3f2a", o.x + 6, o.y + 22, o.w - 12, o.h - 22);

        const folhas = [
            [0, 8, 11],
            [14, 2, 12],
            [26, 10, 10],
            [12, 14, 11]
        ];

        folhas.forEach(([dx, dy, r]) => {
            circulo("#2f5a35", o.x + dx + 4, o.y + dy + 4, r);
        });
    },

    lixeira(o) {
        R("#2b3038", o.x, o.y, o.w, o.h);
        R("#3b414b", o.x - 2, o.y, o.w + 4, 5);
    },

    cadeira(o) {
        R("#2c3a4a", o.x + 2, o.y, o.w - 4, o.h - 10);
        R("#1f2833", o.x, o.y + o.h - 10, o.w, 8);
        R("#141a22", o.x + 4, o.y + o.h - 3, 4, 3);
        R("#141a22", o.x + o.w - 8, o.y + o.h - 3, 4, 3);
    },

    mochila(o) {
        R("#26365a", o.x, o.y + 6, o.w, o.h - 6);
        R("#1b2742", o.x + 6, o.y, o.w - 12, 10);
        R("#1b2742", o.x + 8, o.y + o.h - 14, o.w - 16, 10);
        R("#c9c3b0", o.x + o.w - 14, o.y + 12, 8, 6);
    },

    caderno(o) {
        R("#2f4f8f", o.x, o.y, o.w, o.h);
        R("#e8e2d0", o.x + o.w - 4, o.y + 2, 3, o.h - 4);
        R("#c9c3b0", o.x + 6, o.y + 6, o.w - 14, 4);
    },

    mesa(o, t) {
        desenharMesa(o, false, t);
    },

    nexus(o, t) {
        desenharMesa(o, true, t);
    },

    jogador(o) {
        desenharJogador(o);
    }
};

// ================================================================
// ORDEM DE DESENHO
// ================================================================

function ordem(o) {
    return o.z ?? o.y + o.h;
}

// ================================================================
// LOOP PRINCIPAL
// ================================================================

function desenhar(t) {
    // Atualiza o movimento do personagem.
    atualizarJogador(t);

    // Limpa o quadro anterior.
    ctx.clearRect(0, 0, W, H);

    // Desenha o cenário.
    desenharSala();

    // Desenha os objetos fixados nas paredes.
    OBJETOS
        .filter(o => o.parede)
        .forEach(o => DESENHO[o.tipo](o, t));

    // Desenha os demais objetos e o personagem
    // conforme a posição vertical.
    [...OBJETOS.filter(o => !o.parede), jogador]
        .sort((a, b) => ordem(a) - ordem(b))
        .forEach(o => DESENHO[o.tipo](o, t));

    // A iluminação fica por cima de toda a cena.
    desenharIluminacao();

    // Agenda o próximo quadro.
    requestAnimationFrame(desenhar);
}

// ================================================================
// INICIA O JOGO
// ================================================================

requestAnimationFrame(desenhar);
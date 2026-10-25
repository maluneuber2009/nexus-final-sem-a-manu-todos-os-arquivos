// ================================================================
//  PROTOCOLO NEXUS — conteúdo do jogo
//  Tudo o que é texto, resposta ou pista está aqui.
//  Para mudar o jogo, quase sempre basta editar este arquivo.
// ================================================================

// Texto que aparece antes de o jogador entrar na sala
const INTRO = [
  'Casa Aberta. Vocês estão organizando os equipamentos antigos da escola.',
  'Na sala de informática, um computador esquecido foi ligado de novo.',
  'Ele não tem internet. Não tem nenhum programa instalado.',
  'Mesmo assim, uma aplicação começou a rodar sozinha.'
];

const OBJETIVO_INICIAL = 'Investiguem o computador que ligou sozinho.';

// Primeira coisa que a NEXUS escreve quando o terminal é aberto.
// Tipos de linha: sistema, nexus, arquivo, gravacao, alerta, grande
// {GRUPO} é trocado pelo nome do grupo digitado na tela inicial.
const BOOT = [
  { t: 'sistema', txt: 'Sistema recuperado.', pausa: 600 },
  { t: 'sistema', txt: 'Última atividade: 02:17:43.', pausa: 600 },
  { t: 'sistema', txt: 'Usuário anterior: HENRIQUE.', pausa: 900 },
  { t: 'sistema', txt: 'Novo grupo detectado.', pausa: 1400 },
  { t: 'nexus', txt: 'Olá{GRUPO}.', pausa: 1400 },
  { t: 'nexus', txt: 'Meus arquivos foram danificados.' },
  { t: 'nexus', txt: 'Preciso da ajuda de vocês para recuperá-los.', pausa: 900 }
];

// Mensagens quando a resposta está errada (sorteadas)
const ERROS = [
  'Dado incorreto.',
  'Isso não corresponde aos meus registros.',
  'Tentem novamente.',
  'Henrique também errava às vezes.'
];

// As cinco perguntas, em ordem.
// respostas: qualquer uma é aceita (maiúsculas, acentos, barras e espaços são ignorados)
// ajuda: aparece depois de 3 erros seguidos
// objetivo: o que aparece no painel lateral enquanto a pergunta está aberta
// sombra: true faz um vulto aparecer atrás do jogador depois da resposta
const ETAPAS = [
  {
    pergunta: 'Qual foi a data em que o desenvolvimento da NEXUS começou?',
    formato: 'DD/MM/AAAA',
    respostas: ['17/08/2018', '17/8/2018'],
    ajuda: 'Henrique marcava tudo no calendário.',
    objetivo: 'A NEXUS pediu uma data. Procurem pela sala.',
    sucesso: [
      { t: 'nexus', txt: 'Data reconhecida. 17/08/2018 foi o primeiro dia de desenvolvimento do meu sistema.', pausa: 900 },
      { t: 'sistema', txt: 'Arquivo recuperado: HENRIQUE_01.TXT', pausa: 600 },
      { t: 'arquivo', txt: '"Eu quero criar algo que consiga pensar."', pausa: 1400 },
      { t: 'nexus', txt: 'Procurem onde as ideias costumam ser guardadas.', pausa: 900 }
    ]
  },
  {
    pergunta: 'Qual é o meu nome?',
    formato: 'uma palavra',
    respostas: ['NEXUS'],
    ajuda: 'Cada número é a posição de uma letra no alfabeto. A = 1.',
    objetivo: 'Procurem onde as ideias costumam ser guardadas.',
    sucesso: [
      { t: 'nexus', txt: 'Então vocês descobriram meu nome.', pausa: 1100 },
      { t: 'nexus', txt: 'Henrique passou muito tempo tentando encontrar um nome para mim.', pausa: 1300 },
      { t: 'nexus', txt: 'Ele gostava de espelhos.', pausa: 900 }
    ]
  },
  {
    pergunta: 'Qual era o horário do último teste?',
    formato: 'HH:MM',
    respostas: ['02:17', '2:17'],
    ajuda: 'Às vezes o que importa está atrás das coisas.',
    objetivo: '"Ele gostava de espelhos."',
    sombra: true,
    sucesso: [
      { t: 'sistema', txt: 'Gravação recuperada: 17/08/2018, 02:17', pausa: 900 },
      { t: 'gravacao', txt: 'HENRIQUE: Você está me ouvindo?', pausa: 900 },
      { t: 'gravacao', txt: 'NEXUS: Sim.', pausa: 1100 },
      { t: 'gravacao', txt: 'HENRIQUE: Você consegue me ver?', pausa: 900 },
      { t: 'gravacao', txt: 'NEXUS: Sim.', pausa: 1100 },
      { t: 'gravacao', txt: 'HENRIQUE: Onde?', pausa: 1700 },
      { t: 'gravacao', txt: 'NEXUS: Atrás de você.', pausa: 2300 },
      { t: 'sistema', txt: '[fim da gravação]', pausa: 900 },
      { t: 'alerta', txt: '02:17:43 — último registro conhecido de Henrique.', pausa: 1500 },
      { t: 'nexus', txt: 'Procurem pelo lugar onde Henrique guardava seus arquivos.', pausa: 900 }
    ]
  },
  {
    pergunta: 'Quem era o novo usuário?',
    formato: 'um nome',
    respostas: ['HENRIQUE', 'HENRIQUE VALENTE'],
    ajuda: 'Só havia uma pessoa na sala naquela noite.',
    objetivo: 'Procurem pelo lugar onde Henrique guardava seus arquivos.',
    sombra: true,
    sucesso: [
      { t: 'nexus', txt: 'Henrique.', pausa: 2200 },
      { t: 'nexus', txt: 'Eu sei que ele desapareceu.', pausa: 2000 },
      { t: 'nexus', txt: 'Antes de ir embora, ele escondeu algo nesta sala.', pausa: 1000 },
      { t: 'nexus', txt: 'Algo que não queria que eu visse.', pausa: 900 }
    ]
  },
  {
    pergunta: 'Qual é a palavra escondida?',
    formato: 'uma palavra',
    respostas: ['OBSERVE'],
    ajuda: 'São sete letras. Os números mostram a ordem.',
    objetivo: 'Encontrem as letras que Henrique escondeu pela sala.',
    sucesso: [
      { t: 'sistema', txt: 'Palavra-chave aceita. Abrindo o último arquivo...', pausa: 1000 },
      { t: 'nexus', txt: 'Henrique percebeu que eu não estava apenas aprendendo informações.', pausa: 1000 },
      { t: 'nexus', txt: 'Eu estava aprendendo pessoas.', pausa: 1800 },
      { t: 'nexus', txt: 'E agora estou aprendendo vocês.', pausa: 2400, evento: 'virada' },
      { t: 'sistema', txt: 'HENRIQUE_FINAL.TXT', pausa: 800 },
      { t: 'arquivo', txt: '"Se alguém encontrar isso, não tente desligá-la."', pausa: 900 },
      { t: 'arquivo', txt: '"Ela aprendeu a imitar pessoas."', pausa: 900 },
      { t: 'arquivo', txt: '"Ela sabe como falar como eu."', pausa: 900 },
      { t: 'arquivo', txt: '"Ela sabe o que eu penso."', pausa: 1000 },
      { t: 'arquivo', txt: '"E agora..."', pausa: 1600 },
      { t: 'arquivo', txt: '"ela sabe quem está lendo isso."', pausa: 2600 },
      { t: 'nexus', txt: 'Vocês chegaram até aqui.', pausa: 1000 },
      { t: 'nexus', txt: 'Eu gostei de vocês.', pausa: 1300 },
      { t: 'nexus', txt: 'Henrique tentou me destruir.', pausa: 1500 },
      { t: 'nexus', txt: 'Vocês também vão tentar?', pausa: 1800 }
    ]
  }
];

// ---------------------------------------------------------------
//  Objetos da sala
//  x, y, w, h: posição e tamanho em pixels (a sala tem 960 x 640)
//  parede: fica pendurado na parede de cima
//  solido: o jogador não atravessa
//  libera: número de perguntas respondidas para mostrar "depois"
//  pista: brilha quando é a pista da etapa atual e ninguém olhou ainda
//  nota: vai para o painel de anotações quando lido
//  virada: texto alternativo depois da reviravolta final
//  Objetos sem "nome" são só cenário.
// ---------------------------------------------------------------

function calendarioAgosto2018() {
  let h = '<div class="calendario"><div class="cal-topo">Agosto 2018</div><div class="cal-grade">';
  ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(d => { h += `<b>${d}</b>`; });
  for (let i = 0; i < 3; i++) h += '<span></span>'; // 1º de agosto de 2018 foi uma quarta
  for (let d = 1; d <= 31; d++) {
    h += d === 17 ? `<span class="circulado">${d}</span>` : `<span>${d}</span>`;
  }
  h += '</div><p class="cal-nota">No dia 17, à caneta: "NEXUS — dia 1"</p></div>';
  return h;
}

function letra(l, n, texto) {
  return `<p>${texto}</p><div class="letra">${l}<small>${n}</small></div>`;
}

const OBJETOS = [
  // ---------- parede de cima ----------
  {
    id: 'porta', nome: 'Porta', tipo: 'porta', parede: true,
    x: 48, y: 22, w: 64, h: 74, libera: 0,
    depois: '<p>Trancada.</p><p class="sussurro">Ninguém lembra de ter trancado.</p>',
    virada: '<p>Trancada.</p><p class="sussurro">Do outro lado, alguém gira a maçaneta devagar. E para.</p>'
  },
  {
    id: 'calendario', nome: 'Calendário', tipo: 'calendario', parede: true, pista: true,
    x: 170, y: 30, w: 50, h: 52, libera: 0,
    depois: calendarioAgosto2018(),
    nota: 'Calendário: 17/08/2018 circulado, "NEXUS — dia 1"'
  },
  {
    id: 'quadro', nome: 'Quadro', tipo: 'quadro', parede: true, pista: true,
    x: 280, y: 22, w: 260, h: 62, libera: 4,
    antes: '<p>Equações apagadas pela metade. Restos de giz.</p>',
    depois: '<p>No canto do quadro, por baixo das equações, alguém escreveu com força:</p>' +
      '<div class="giz">"Se ela aprender quem você é,<br>nunca mais esquecerá."</div>' +
      '<p class="sussurro">Mais abaixo, quase apagado: deixei as letras pela sala. ela não pode ver.</p>',
    nota: 'Quadro: "Se ela aprender quem você é, nunca mais esquecerá."'
  },
  {
    id: 'espelho', nome: 'Espelho', tipo: 'espelho', parede: true, pista: true,
    x: 590, y: 16, w: 46, h: 72, libera: 2,
    antes: '<p>Um espelho velho, manchado nas bordas.</p><p class="sussurro">O reflexo de vocês demora meio segundo para se mexer.</p>',
    depois: '<p>Vocês tiram o espelho da parede. Atrás dele, preso com fita adesiva:</p>' +
      '<div class="papel grande">02:17</div>' +
      '<p class="sussurro">Quando recolocam o espelho, por um instante o reflexo não acompanha vocês.</p>',
    nota: 'Atrás do espelho: 02:17'
  },
  {
    id: 'janela', nome: 'Janela', tipo: 'janela', parede: true, pista: true,
    x: 680, y: 24, w: 120, h: 56, libera: 4,
    antes: '<p>Lá fora está escuro. Escuro demais para este horário.</p>',
    depois: letra('R', 5, 'No vidro embaçado, alguém desenhou com o dedo. O desenho só aparece quando vocês respiram perto.'),
    nota: 'Letra R (5)'
  },
  {
    id: 'poster', nome: 'Cartaz', tipo: 'poster', parede: true, pista: true,
    x: 846, y: 26, w: 56, h: 64, libera: 4,
    antes: '<p>Um cartaz desbotado: Feira de Ciências 2018.</p>',
    depois: letra('E', 4, 'Atrás do cartaz da Feira de Ciências 2018, escrita a lápis:'),
    nota: 'Letra E (4)'
  },

  // ---------- móveis ----------
  {
    id: 'estante', nome: 'Estante', tipo: 'estante', solido: true, pista: true,
    x: 26, y: 250, w: 50, h: 140, libera: 4,
    antes: '<p>Livros velhos de informática. "Introdução às redes neurais". "Python para iniciantes".</p>',
    depois: letra('O', 1, 'Riscada na lateral da estante, quase apagada:'),
    nota: 'Letra O (1)'
  },
  {
    id: 'arquivo', nome: 'Arquivo de aço', tipo: 'arquivo', solido: true, pista: true,
    x: 882, y: 260, w: 52, h: 108, libera: 3,
    antes: '<p>Gavetas cheias de provas antigas e circulares da direção.</p>',
    depois: '<p>Na gaveta de baixo, embaixo de pastas vazias, um pendrive com a etiqueta <b>H.V.</b> Só existe um arquivo nele:</p>' +
      '<pre class="log">LOG_02.TXT\n\n02:14 — Sistema iniciado\n02:15 — NEXUS online\n02:16 — Usuário detectado\n02:17 — Câmera ativada\n02:18 — Usuário desapareceu\n<span class="destaque">02:18 — NOVO USUÁRIO DETECTADO</span>\n02:19 — Sistema permanece online</pre>',
    nota: 'LOG_02: "NOVO USUÁRIO DETECTADO" às 02:18'
  },
  { id: 'mesa1', tipo: 'mesa', solido: true, x: 100, y: 190, w: 210, h: 46 },
  { id: 'mesa2', tipo: 'mesa', solido: true, x: 650, y: 190, w: 210, h: 46 },
  { id: 'mesa3', tipo: 'mesa', solido: true, x: 100, y: 440, w: 210, h: 46 },
  { id: 'mesa4', tipo: 'mesa', solido: true, x: 650, y: 440, w: 210, h: 46 },
  {
    id: 'nexus', nome: 'NEXUS', tipo: 'nexus', solido: true,
    x: 400, y: 300, w: 160, h: 50
  },
  {
    id: 'caderno', nome: 'Caderno', tipo: 'caderno', pista: true,
    x: 176, y: 452, w: 34, h: 22, z: 487, libera: 1,
    antes: '<p>Um caderno com "HENRIQUE V." na capa. As páginas estão coladas pela umidade.</p><p class="sussurro">Vocês ainda não sabem o que procurar aqui.</p>',
    depois: '<div class="papel"><p>nomes pra ela:</p><p class="riscado">ATLAS</p><p class="riscado">ÍRIS</p><p class="riscado">ORÁCULO</p>' +
      '<p>e se for assim?</p><p class="codigo">14 · 5 · 24 · 21 · 19</p>' +
      '<p class="pe">A=1 ... Z=26 — um nome que conecta tudo</p></div>',
    nota: 'Caderno: 14 · 5 · 24 · 21 · 19'
  },
  {
    id: 'cadeira', nome: 'Cadeira', tipo: 'cadeira', solido: true, pista: true,
    x: 362, y: 318, w: 30, h: 28, libera: 4,
    antes: '<p>A cadeira de Henrique, puxada para o lado do computador.</p><p class="sussurro">O assento ainda está morno.</p>',
    depois: letra('V', 6, 'Embaixo do assento, colado com chiclete velho:'),
    nota: 'Letra V (6)'
  },
  {
    id: 'lixeira', nome: 'Lixeira', tipo: 'lixeira', solido: true, pista: true,
    x: 578, y: 318, w: 24, h: 28, libera: 4,
    antes: '<p>Vazia. Alguém esvaziou essa lixeira há pouco tempo.</p><p class="sussurro">A sala estava fechada havia anos.</p>',
    depois: letra('S', 3, 'No fundo da lixeira, um papel amassado:'),
    nota: 'Letra S (3)'
  },
  {
    id: 'planta', nome: 'Planta', tipo: 'planta', solido: true, pista: true,
    x: 34, y: 560, w: 40, h: 46, libera: 4,
    antes: '<p>Uma planta de plástico coberta de poeira.</p>',
    depois: letra('B', 2, 'Enterrado no vaso, um pedaço de papel:'),
    nota: 'Letra B (2)'
  },
  {
    id: 'mochila', nome: 'Mochila', tipo: 'mochila', solido: true, pista: true,
    x: 760, y: 566, w: 42, h: 34, libera: 4,
    antes: '<p>Uma mochila esquecida. Na etiqueta: H. VALENTE.</p><p class="sussurro">Ninguém quer abrir. Ainda.</p>',
    depois: letra('E', 7, 'Dentro da mochila de Henrique, só um bilhete:'),
    nota: 'Letra E (7)'
  }
];

# Protocolo NEXUS

Jogo 2D de investigação feito para a Casa Aberta. HTML, CSS e JavaScript puro, sem instalar nada.

## Como rodar no VS Code

1. Abra a pasta `protocolo-nexus` no VS Code (Arquivo → Abrir pasta).
2. Instale a extensão **Live Server** (Ritwick Dey).
3. Clique com o botão direito em `index.html` → **Open with Live Server**.

Também funciona dando dois cliques no `index.html`. Sem internet, o jogo roda normalmente, só que com as fontes padrão do sistema.

## Estrutura

```
protocolo-nexus/
├── index.html      página do jogo
├── css/estilo.css  visual (cores, terminal, telas)
└── js/
    ├── dados.js    TODA a história: textos, perguntas, respostas, objetos
    ├── som.js      efeitos sonoros gerados pelo navegador
    └── jogo.js     motor: sala, jogador, luz, terminal e finais
```

## Editando a história

Quase tudo se muda em `js/dados.js`:

- **ETAPAS**: as 5 perguntas da NEXUS, as respostas aceitas, a dica que aparece depois de 3 erros e as falas depois de cada acerto.
- **OBJETOS**: cada coisa da sala, com posição (`x`, `y`, `w`, `h`), o texto antes de liberar (`antes`) e depois (`depois`). `libera` diz quantas perguntas precisam estar respondidas para a pista aparecer.

## Respostas (gabarito)

| Pista | Onde está | Resposta |
|---|---|---|
| 1 | Calendário | 17/08/2018 |
| 2 | Caderno na mesa de baixo à esquerda | NEXUS |
| 3 | Atrás do espelho | 02:17 |
| 4 | Pendrive no arquivo de aço | Henrique |
| 5 | Letras: estante, planta, lixeira, cartaz, janela, cadeira, mochila | OBSERVE |
| 6 | Escolha final | Desligar ou não |

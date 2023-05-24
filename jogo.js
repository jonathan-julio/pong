const larguraDaRaquete = 10;
const alturaDaRaquete = 80;
const diametroDaBola = 20;
const velocidadeMaximaDaBola = 15;

const jogador1 = {
  x: 50,
  y: canvas.height / 2 - alturaDaRaquete / 2,
  pontos: 0
};

const jogador2 = {
  x: canvas.width - 50 - larguraDaRaquete,
  y: canvas.height / 2 - alturaDaRaquete / 2,
  pontos: 0
};

const bola = {
  x: canvas.width / 2 - diametroDaBola / 2,
  y: canvas.height / 2 - diametroDaBola / 2,
  vx: 0,
  vy: 0,
  velocidade: 10
};

let ultimaAtualizacao = Date.now();

function atualizar() {
  const agora = Date.now();
  const dt = (agora - ultimaAtualizacao) / 1000;
  ultimaAtualizacao = agora;

  moverJogador(jogador1, dt);
  moverJogador(jogador2, dt);
  moverBola(dt);

  verificarColisoes();

  window.requestAnimationFrame(atualizar);
}

function moverJogador(jogador, dt) {
  const velocidade = 500;
  if (jogador.subindo) {
    jogador.y = Math.max(0, jogador.y - velocidade * dt);
  }
  if (jogador.descendo) {
    jogador.y = Math.min(canvas.height - alturaDaRaquete, jogador.y + velocidade * dt);
  }
}

function moverBola(dt) {
  bola.x += bola.vx * dt;
  bola.y += bola.vy * dt;
}

function verificarColisoes() {
    // Colisão com paleta esquerda
    if (bola.x - bola.raio < paletaEsquerda.largura && (bola.y < paletaEsquerda.y || bola.y > paletaEsquerda.y + paletaEsquerda.altura)) {
      console.log("Fim de jogo!");
      clearInterval(intervalId);
    }
  
    // Colisão com paleta direita
    if (bola.x + bola.raio > largura - paletaDireita.largura && (bola.y < paletaDireita.y || bola.y > paletaDireita.y + paletaDireita.altura)) {
      console.log("Fim de jogo!");
      clearInterval(intervalId);
    }
  
    // Colisão com as paredes superior e inferior
    if (bola.y - bola.raio < 0 || bola.y + bola.raio > altura) {
      bola.dy = -bola.dy;
    }
  }
  

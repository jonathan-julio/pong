// constantes da bola
const bola = {
    raio: 10,
    cor: "#FFFFFF",
    x: 400,
    y: 300,
    velX: 5,
    velY: 5,
  };
  
  // constantes das paletas
  const paletaEsquerda = {
    altura: 70,
    largura: 10,
    cor: "#FFFFFF",
    x: 10,
    y: 250,
    movimento: 0,
  };
  
  const paletaDireita = {
    altura: 70,
    largura: 10,
    cor: "#FFFFFF",
    x: 780,
    y: 250,
    movimento: 0,
  };
  
  // constantes do placar
  const placar = {
    esquerda: 0,
    direita: 0,
  };
  
  // constantes do canvas
  const canvas = {
    altura: 600,
    largura: 800,
    cor: "#000000",
  };
  
  // constantes de rede
  const rede = {
    IP: "localhost",
    PORTA: 3000,
  };
  
  // constantes do jogo
  const jogo = {
    velocidade: 50, // tempo de atualização do jogo (em milissegundos)
    intervalId: null, // id do intervalo do jogo
    jogoRodando: false, // variável para controle do jogo
    socket: null, // objeto socket.io
    jogadorId: null, // id do jogador atual
    jogadorPosicao: null, // posição do jogador atual (esquerda/direita)
    oponenteId: null, // id do oponente
    oponentePosicao: null, // posição do oponente (esquerda/direita)
    fila: [], // fila de espera para jogadores
  };
  
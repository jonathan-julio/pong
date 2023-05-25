
var initGame = false;
const socket = io();
const canvas = document.getElementById('canvas-jogo');
const context = canvas.getContext('2d');

const larguraRaquete = 2; 
const alturaRaquete = 40; 
let playerY = canvas.height / 2 - alturaRaquete / 2; 
var opponentY = canvas.height / 2 - alturaRaquete / 2; 

let playerMoveUp = false;
let playerMoveDown = false;
var myPlayerString;
var myPlayer;
var oponentePlayer;
var pontoPlay1 = 0;
var pontoPlay2 = 0;

var meuLado;
var ladoOponente;
const ballRadius = 5; 
let bolaX = canvas.width / 5; // Posição horizontal da bola
let bolaY = canvas.height / 5; // Posição vertical da bola
let velocidadeBolaX = 1; // Velocidade horizontal da bola velocidadeBolaY
let velocidadeBolaY = 1; // Velocidade vertical da bola


const canvasPlacar = document.getElementById('canvas-placar');
const contextPlacar = canvasPlacar.getContext('2d');
const pontuacaoElement = document.getElementById('pontuacao');



socket.on('connect', function() {
    console.log('Conectado ao servidor');
});

socket.on('disconnect', function() {
    console.log('Desconectado do servidor');
    document.getElementById('game').style.display = 'none';
    document.getElementById('load').style.display = 'block';
});

socket.on('ballPosition', function(data) {
    bolaX = data.x;
    bolaY = data.y;
  });
  
socket.on('startGame', function(msg) {
    var mensagem = "";
    console.log("if : " +msg['message'] === "Jogo iniciou" && document.getElementById('load').style.display !== 'none');
    if (msg['message'] === "Jogo iniciou" && document.getElementById('load').style.display !== 'none') {
        mensagem = "Jogo iniciou s";
    }else{
        mensagem = "O jogo reiniciou";
    }
    showDialog(mensagem).then((confirmed) => {
        if (confirmed) {
          socket.emit('initGame', {status : true});
        } else {
          socket.emit('initGame', {status : false});
        }
      });
    myPlayerString = msg['role'];
    if (msg['role'] == "player2") {
        ladoOponente = (bolaX - ballRadius < 0 );
        meuLado= (bolaX + ballRadius > canvas.width);
        myPlayer = canvas.width - larguraRaquete - 2;
        oponentePlayer = 5;
    } else {
        meuLado = (bolaX - ballRadius < 0 );
        ladoOponente = (bolaX + ballRadius > canvas.width);
        oponentePlayer = canvas.width - larguraRaquete - 2;
        myPlayer = 5;
    }
    playerY = 50;
    opponentY = 50;
    document.getElementById('load').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    //alert(msg);
});

socket.on('waiting', function(msg) {
    document.getElementById('game').style.display = 'none';
    document.getElementById('load').style.display = 'block';
    alert(msg);
});

socket.on('update', function(msg) {
    opponentY = msg['oponent']
});

socket.on('init', function(data) {
    initGame = data;
});

socket.on('pontos', function(data) {
    console.log("ponto : " + data.pontoPlay1);
    console.log("ponto2 : " + data.pontoPlay2);
    pontoPlay1 = data["pontoPlay1"];
    pontoPlay2 = data["pontoPlay2"];
    atualizarPlacar();
});

function showDialog(message) {
    return new Promise((resolve) => {
      const result = confirm(message);
      resolve(result);
    });
}
  

function atualizarPlacar() {
    contextPlacar.clearRect(0, 0, canvasPlacar.width, canvasPlacar.height);
    contextPlacar.font = '20px Arial';
    contextPlacar.fillText(`Pontuação: ${pontoPlay1} x ${pontoPlay2} `, 10, 30);
    pontuacaoElement.textContent = `Pontuação: ${pontoPlay1} x ${pontoPlay2}`;
}
  

  function desenharRaquetes() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'red';
      context.fillRect(myPlayer, playerY, larguraRaquete, alturaRaquete);
      context.fillStyle = 'black';
      context.fillRect(oponentePlayer, opponentY, larguraRaquete, alturaRaquete);
      if (initGame) {
        updateBall ();
        sendBallPosition();
      }
  }
  
  function updateBall() {
      bolaX += velocidadeBolaX;
      bolaY += velocidadeBolaY;
    
      // Lógica de colisão com as paredes verticais
      if (bolaY + ballRadius > canvas.height || bolaY - ballRadius < 0) {
        velocidadeBolaY = -velocidadeBolaY;
      }
    
      // Lógica de colisão com as raquetes
      if (
        (bolaX - ballRadius < larguraRaquete && bolaY + ballRadius > playerY && bolaY - ballRadius < playerY + alturaRaquete) ||
        (bolaX + ballRadius > canvas.width - larguraRaquete && bolaY + ballRadius > opponentY && bolaY - ballRadius < opponentY + alturaRaquete)
      ) {
        velocidadeBolaX = -velocidadeBolaX;
      }
    
      // Lógica de pontuação quando a bola ultrapassa as raquetes
      if (bolaX - ballRadius < 0 ) {
        pontoPlay2 += 1;
        socket.emit('initGame', {status : false});
        showDialog("Ponto para o Player 2. Deseja continuar?").then((confirmed) => {
            if (confirmed) {
              socket.emit('initGame', {status : true});
            } else {
              socket.emit('initGame', {status : false});
            }
        });
        bolaX = canvas.width / 2; 
        bolaY = canvas.height / 2; 
        sendBallPosition();
        
      } else if (bolaX + ballRadius > canvas.width) {
        pontoPlay1 += 1;
        socket.emit('initGame', {status : false});
        showDialog("Ponto para o Player 1. Deseja continuar?").then((confirmed) => {
            if (confirmed) {
              socket.emit('initGame', {status : true});
            } else {
              socket.emit('initGame', {status : false});
            }
        });
        bolaX = canvas.width / 2; 
        bolaY = canvas.height / 2;

        sendBallPosition();
      }
      if (myPlayerString == "player1") {
        socket.emit("marcarPonto" , {"pontoPlay1": pontoPlay1, "pontoPlay2" : pontoPlay2});
      }
    
      // Verificar limites horizontais
      if (bolaX - ballRadius < 0) {
        bolaX = ballRadius;
      } else if (bolaX + ballRadius > canvas.width) {
        bolaX = canvas.width - ballRadius;
      }
    
      // Verificar limites verticais
      if (bolaY - ballRadius < 0) {
        bolaY = ballRadius;
      } else if (bolaY + ballRadius > canvas.height) {
        bolaY = canvas.height - ballRadius;
      }
    
      // Desenhar a bola
      context.beginPath();
      context.arc(bolaX, bolaY, ballRadius, 0, Math.PI * 2, false);
      context.fillStyle = 'green'; 
      context.fill();
      context.closePath();
    }
    
  
  // Função para atualizar a tela
  function updateScreen() {
      // Movimento do jogador
      if (playerMoveUp && playerY > 0) {
          playerY -= 5;
      } else if (playerMoveDown && playerY + alturaRaquete < canvas.height) {
          playerY += 5;
      }
  
      // Desenhar as raquetes
      desenharRaquetes();
  
      // Chamar a próxima atualização da tela
      requestAnimationFrame(updateScreen);
  }
  
  function sendPaddlePosition() {
      const data = {playerY: playerY};
      socket.emit('paddlePosition', data);
  }
  
   // Função para enviar a posição da bola para o servidor
   function sendBallPosition() {
      const data = { x: bolaX, y: bolaY };
      socket.emit('ballPosition', data);
  }
  
  
  // Evento de pressionar a tecla
  document.addEventListener('keydown', function(event) {
      if (event.key === 'ArrowUp') {
          playerMoveUp = true;
          sendPaddlePosition();
      } else if (event.key === 'ArrowDown') {
          playerMoveDown = true;
          sendPaddlePosition();
      }
  });
  
  // Evento de soltar a tecla
  document.addEventListener('keyup', function(event) {
      if (event.key === 'ArrowUp') {
          playerMoveUp = false;
          sendPaddlePosition();
      } else if (event.key === 'ArrowDown') {
          playerMoveDown = false;
          sendPaddlePosition();
      }
  });
  
  
  // Chamar a função inicial de atualização da tela
  updateScreen();
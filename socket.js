const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "https://jonathan-julio.github.io",
    methods: ["GET", "POST"]
  }
});


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://jonathan-julio.github.io');
  next();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname +'/public/index.html');
});

let jogadoresEspera = [];
let jogos = [];
let jogadores = [];

class canvas {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}



io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id); 
  jogadores.push(socket);
  jogadoresEspera.push(socket.id);
  checkListEspera();

  socket.on('disconnect', () => {
    for (var i = 0; i < jogos.length; i++) {
      var objeto = jogos[i];
      if (objeto.socketId1 === socket.id || objeto.socketId2 === socket.id) {
        var socketID;
        if (objeto.socketId1 === socket.id) {
          socketID = objeto.socketId2;
          jogadoresEspera.push(objeto.socketId2);
        } else {
          socketID = objeto.socketId1;
          jogadoresEspera.push(objeto.socketId1);
        } 
        jogos.splice(i, 1);
      } 
    }
    for (var i = 0; i < jogadoresEspera.length; i++) {
      var sockeyID = jogadoresEspera[i];
      if (sockeyID === socket.id) {
        jogadoresEspera.splice(i, 1);
      }
    }
    checkListEspera();
    console.log('Usuário desconectado:', socket.id);
  });

  socket.on('ballPosition', function(data) {
    const playerSocketId = socket.id;
    ballX = data.x;
    ballY = data.y;
    const game = jogos.find(objeto => objeto.socketId1 === playerSocketId || objeto.socketId2 === playerSocketId);
    if (game) {
      const socketPlay1 = jogadores.find(jogador => jogador.id === game.socketId1);
      const socketPlay2 = jogadores.find(jogador => jogador.id === game.socketId2);
      socketPlay1.emit('ballPosition', { x: ballX, y: ballY });
      socketPlay2.emit('ballPosition', { x: ballX, y: ballY });
    }
  });

  socket.on('initGame', function(data) {
    const playerSocketId = socket.id;
    const _player1 = jogos.find(objeto => objeto.socketId1 === playerSocketId );
    canvas.width = data.canvasWidth;
    canvas.height = data.canvasHeight;
    if (_player1) {
      _player1.statusPlay1 = data.status;
      console.log("aqui : 1 ",_player1.statusPlay1)
    }
    const _player2 = jogos.find(objeto => objeto.socketId2 === playerSocketId);
    if (_player2) {
      _player2.statusPlay2 = data.status;
      console.log("aqui : 2 ",_player2.statusPlay1)
    }
    
  });

  socket.on('marcarPonto', function(data) {
    const playerSocketId = socket.id;
    const game = jogos.find(objeto => objeto.socketId1 === playerSocketId || objeto.socketId2 === playerSocketId);

    if (game) {
      game.pontoPlay1 = data.pontoPlay1;
      game.pontoPlay2 = data.pontoPlay2;
      
      const socketPlay1 = jogadores.find(jogador => jogador.id === game.socketId1);
      const socketPlay2 = jogadores.find(jogador => jogador.id === game.socketId2);
      socketPlay1.emit("pontos", { "pontoPlay1" : game.pontoPlay1, "pontoPlay2" : game.pontoPlay2 });
      socketPlay2.emit("pontos", { "pontoPlay1" : game.pontoPlay1, "pontoPlay2" : game.pontoPlay2 });
    }
  });

  socket.on('paddlePosition', function(data) {
    const playerSocketId = socket.id;
    var _player1;
    var _player2;
  
    const game = jogos.find(objeto => objeto.socketId1 === playerSocketId || objeto.socketId2 === playerSocketId);
    if (game) {
      _player1 = game.socketId1;
      _player2 = game.socketId2;

      if (game.socketId1 === playerSocketId) {
        game.raquetePlay1 = data.playerY;
      } else {
        game.raquetePlay2 = data.playerY;
      }
    }
  
    const socketPlay1 = jogadores.find(jogador => jogador.id === _player1);
    const socketPlay2 = jogadores.find(jogador => jogador.id === _player2);
    try {
      if (_player1 == playerSocketId) {
        socketPlay2.emit("update", { "oponent" : game.raquetePlay1 });
      } else {
        socketPlay1.emit("update", { "oponent" : game.raquetePlay2 });
      } 
    } catch (error) {
      console.log(error);
    }
       
  });

  socket.on('playerPosition', function(data) {
    const playerSocketId = socket.id;
    var _player1;
    var _player2;
  
    // Encontrar o jogo correspondente ao socket do jogador
    const game = jogos.find(objeto => objeto.socketId1 === playerSocketId || objeto.socketId2 === playerSocketId);
    if (game) {
      _player1 = game.socketId1;
      _player2 = game.socketId2;
      // Atualizar a posição da raquete do jogador
      if (game.socketId1 === playerSocketId) {
        game.raquetePlay1 = data.playerY;
      } else {
        game.raquetePlay2 = data.playerY;
      }
    }
  
    const socketPlay1 = jogadores.find(jogador => jogador.id === _player1 );
    const socketPlay2 = jogadores.find(jogador => jogador.id === _player2 );
    try {
      if (_player1 == playerSocketId) {
        socketPlay2.emit("update", 
        { "oponent" : game.raquetePlay1}
      );
      } else {
        socketPlay1.emit("update", 
        { "oponent" : game.raquetePlay2}
      );
      }
    } catch (error) {
      console.log(error);
    }
  });
});

http.listen(3000, function() {
  console.log('Servidor ouvindo na porta 3000');
});

const ballRadius = 5;
const larguraRaquete = 2; 
const alturaRaquete = 40; 

class ObjetoComDoisSockets {
  constructor(socketId1, socketId2, raquetePlay1, raquetePlay2, statusPlay1, statusPlay2, pontoPlay1, pontoPlay2, ballPositionX, ballPositionY,ballSpeedX,ballSpeedY) {
    this.socketId1 = socketId1;
    this.socketId2 = socketId2;
    this.raquetePlay1 = raquetePlay1;
    this.raquetePlay2 = raquetePlay2;
    this.statusPlay1 = statusPlay1;
    this.statusPlay2 = statusPlay2;
    this.pontoPlay1 = pontoPlay1;
    this.pontoPlay2 = pontoPlay2;
    this.ballPositionX = ballPositionX;
    this.ballPositionY = ballPositionY;
   this.ballSpeedX =  ballSpeedX;
   this.ballSpeedY =  ballSpeedY;
  }
}

function checkListEspera() {
  if (jogadoresEspera.length >= 2) {
    var _player1 = jogadoresEspera[0];
    var _player2 = jogadoresEspera[1];
    var obj = new ObjetoComDoisSockets(_player1, _player2, 50, 50, false, false, 0, 0, canvas.width / 2, canvas.height / 2, 1.2, 1.4);
    jogos.push(obj);
    jogadoresEspera.splice(1, 1);
    jogadoresEspera.splice(0, 1);
    console.log('jogo iniciado');
    const socket1 = jogadores.find(socket => socket.id === _player1);
    const socket2 = jogadores.find(socket => socket.id === _player2);
    if (socket1 && socket2) {
      socket1.emit('startGame', { message: 'Jogo iniciou', role: 'player1' });
      socket2.emit('startGame', { message: 'Jogo iniciou', role: 'player2' });
    }
  } else {
    var _player1 = jogadoresEspera[0];
    const socket = jogadores.find(socket => socket.id === _player1);
    if (socket) {
      socket.emit('waiting', 'Jogador foi para a fila de espera.');
    }
  }
  console.log('lista espera: ', jogadoresEspera.length);
}

function moveBall() {
  if(canvas.width == undefined || canvas.height == undefined){
    canvas.height = 150;
    canvas.width = 300
  }
  for (var i = 0; i < jogos.length; i++) {  
    var game = jogos[i];
    const socketPlay1 = jogadores.find(jogador => jogador.id === game.socketId1);
    const socketPlay2 = jogadores.find(jogador => jogador.id === game.socketId2);
    //console.log(socketPlay1.statusPlay1 && socketPlay2.statusPlay2)

    if (game.statusPlay1 && game.statusPlay2 ) {
      game.ballPositionX = game.ballPositionX + game.ballSpeedX;
      game.ballPositionY = game.ballPositionY + game.ballSpeedY;
      if (game.ballPositionX === undefined || game.ballPositionY === undefined) {
        game.ballPositionX = canvas.width / 2;
        game.ballPositionY = canvas.height / 2;
        console.log("speedX a : " + game.ballPositionX);
        console.log("speedY  a: " + game.ballPositionY);
      }
      // Lógica de colisão com as paredes verticais
      if (game.ballPositionY + ballRadius > canvas.height || game.ballPositionY - ballRadius < 0) {
        game.ballSpeedY = -game.ballSpeedY;
      }
      // Lógica de colisão com as raquetes
      if (
        (game.ballPositionX - ballRadius < larguraRaquete && game.ballPositionY + ballRadius > game.raquetePlay1 && game.ballPositionY - ballRadius < game.raquetePlay1 + alturaRaquete) ||
        (game.ballPositionX + ballRadius > canvas.width - larguraRaquete && game.ballPositionY + ballRadius > game.raquetePlay2 && game.ballPositionY - ballRadius < game.raquetePlay2 + alturaRaquete)
      ) {
        game.ballSpeedX = -game.ballSpeedX;
        if ((game.ballSpeedX < 2.5 && game.ballSpeedX > 0) || (game.ballSpeedX > -2.5 && game.ballSpeedX < 0) ) {
          game.ballSpeedX = game.ballSpeedX * 1.15;
          game.ballSpeedY = game.ballSpeedY * 1.15;
          console.log("ponto para o player 2 : ", game.ballSpeedY)
        }
      }
      // Lógica de pontuação quando a bola ultrapassa as raquetes
      if (game.ballPositionX - ballRadius < 0 ) {
        game.pontoPlay2 += 1;
        console.log("ponto para o player 2");
        game.ballPositionX = canvas.width / 2; 
        game.ballPositionY = canvas.height / 2; 
        
      } else if (game.ballPositionX + ballRadius > canvas.width) {
        game.pontoPlay1 += 1;
        console.log("ponto para o player 1")
        game.ballPositionX = canvas.width / 2; 
        game.ballPositionY = canvas.height / 2;
      }
      if (game.ballPositionX - ballRadius < 0) {
        game.ballPositionX = ballRadius;
      } else if (game.ballPositionX + ballRadius > canvas.width) {
        game.ballPositionX = canvas.width - ballRadius;
      }
      // Verificar limites verticais
      if (game.ballPositionY - ballRadius < 0) {
        game.ballPositionY = ballRadius;
      } else if (game.ballPositionY + ballRadius > canvas.height) {
        game.ballPositionY = canvas.height - ballRadius;
      }
      socketPlay1.emit('ballPosition', { x: game.ballPositionX, y: game.ballPositionY });
      socketPlay2.emit('ballPosition', { x: game.ballPositionX, y: game.ballPositionY });
      socketPlay1.emit('pontos', { pontoPlay1: game.pontoPlay1, pontoPlay2: game.pontoPlay2 });
      socketPlay2.emit('pontos', { pontoPlay1: game.pontoPlay1, pontoPlay2: game.pontoPlay2 });
      }
  }
}

function notifyPoint(game, player) {
  const socketPlay1 = jogadores.find(jogador => jogador.id === game.socketId1);
  const socketPlay2 = jogadores.find(jogador => jogador.id === game.socketId2);

  if (player === 1) {
    socketPlay1.emit('ponto', { jogador: 1 });
    socketPlay2.emit('ponto', { jogador: 1 });
  } else if (player === 2) {
    socketPlay1.emit('ponto', { jogador: 2 });
    socketPlay2.emit('ponto', { jogador: 2 });
  }
}




setInterval(moveBall, 1000 / 60); // Move a bola a cada 1/60 segundos (60 FPS)

const app = require('express')()
const http = require('http').createServer(app);
const io = require('socket.io')(http);


app.get('/style.css', (req, res) => {
  res.sendFile(__dirname +'/public/style.css');
})
app.get('/socket.js', (req, res) => {
  res.sendFile(__dirname +'/public/socket.js');
})

app.get('/', (req, res) => {
    res.sendFile(__dirname +'/public/index.html');
})





// armazena as informações dos jogadores em espera e em jogo
let jogadoresEspera = [];
let jogos = [];
let jogadores = [];


io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id); 
  jogadores.push(socket);
  jogadoresEspera.push(socket.id);
  checkListEspera();

  socket.on('disconnect', () => {
    for (var i = 0; i < jogos.length; i++) {
      var objeto = jogos[i] ;
      if (objeto.socketId1 === socket.id  || objeto.socketId2 === socket.id) {
        var socketID;
        if (objeto.socketId1 === socket.id){
          socketID = objeto.socketId2;
          jogadoresEspera.push(objeto.socketId2);
        } else{
          socketID = objeto.socketId1;
          jogadoresEspera.push(objeto.socketId1);
        } 
        jogos.splice(i, 1);
      } 
    }
    for (var i = 0; i < jogadoresEspera.length; i++) {
      var sockeyID = jogadoresEspera[i];
      if (sockeyID === socket.id ) {
        jogadoresEspera.splice(i, 1);
      }
    }
    checkListEspera();
    console.log('Usuário desconectado:', socket.id);
  });

  // Quando um cliente envia a posição da bola para o servidor
  // Atualiza a posição da bola e emite o evento para todos os clientes
  socket.on('ballPosition', function(data) {
    const playerSocketId = socket.id;
    ballX = data.x;
    ballY = data.y;
    const game = jogos.find(objeto => objeto.socketId1 === playerSocketId || objeto.socketId2 === playerSocketId);
    if (game) {
      const socketPlay1 = jogadores.find(jogador => jogador.id === game.socketId1 );
    const socketPlay2 = jogadores.find(jogador => jogador.id === game.socketId2 );
    socketPlay1.emit('ballPosition', { x: ballX, y: ballY });
    socketPlay2.emit('ballPosition', { x: ballX, y: ballY });
    }
  });

  socket.on('initGame', function(data) {
    const playerSocketId = socket.id;
    const game = jogos.find(objeto => objeto.socketId1 === playerSocketId || objeto.socketId2 === playerSocketId);

    if (game) {
      if(game.socketId1 === playerSocketId ){
        game.statusPlay1 = data["status"];
      }
      if(game.socketId2 === playerSocketId){
        game.statusPlay2 = data["status"];
      }

      const socketPlay1 = jogadores.find(jogador => jogador.id === game.socketId1 );
      const socketPlay2 = jogadores.find(jogador => jogador.id === game.socketId2 );
      socketPlay1.emit("init", (game.statusPlay1 && game.statusPlay2));
      socketPlay2.emit("init", (game.statusPlay1 && game.statusPlay2));
    }

  });

  socket.on('marcarPonto', function(data) {
    const playerSocketId = socket.id;
    const game = jogos.find(objeto => objeto.socketId1 === playerSocketId || objeto.socketId2 === playerSocketId);

    if (game) {
        game.pontoPlay1 = data.pontoPlay1;
        game.pontoPlay2 = data.pontoPlay2;
      
      const socketPlay1 = jogadores.find(jogador => jogador.id === game.socketId1 );
      const socketPlay2 = jogadores.find(jogador => jogador.id === game.socketId2 );
      socketPlay1.emit("pontos", {"pontoPlay1" : game.pontoPlay1, "pontoPlay2" : game.pontoPlay2});
      socketPlay2.emit("pontos", {"pontoPlay1" : game.pontoPlay1, "pontoPlay2" : game.pontoPlay2});
    }

  });

  socket.on('paddlePosition', function(data) {
    const playerSocketId = socket.id;
    var player1;
    var player2;
  
    // Encontrar o jogo correspondente ao socket do jogador
    const game = jogos.find(objeto => objeto.socketId1 === playerSocketId || objeto.socketId2 === playerSocketId);
    if (game) {
      player1 = game.socketId1;
      player2 = game.socketId2;
      // Atualizar a posição da raquete do jogador
      if (game.socketId1 === playerSocketId) {
        game.raquetePlay1 = data.playerY;
      } else {
        game.raquetePlay2 = data.playerY;
      }
    }
  
    const socketPlay1 = jogadores.find(jogador => jogador.id === player1 );
    const socketPlay2 = jogadores.find(jogador => jogador.id === player2 );
    if (player1 == playerSocketId) {
      socketPlay2.emit("update", 
      { "oponent" : game.raquetePlay1}
    );
    } else {
      socketPlay1.emit("update", 
      { "oponent" : game.raquetePlay2}
    );
      
    }    
  });
})




http.listen(3000, function() {
  console.log('Servidor ouvindo na porta 3000');
})


class ObjetoComDoisSockets {
  constructor(socket1, socket2, raquetePlay1, raquetePlay2,statusPlay1,statusPlay2, pontoPlay1, pontoPlay2) {
    this.socketId1 = socket1;
    this.socketId2 = socket2;
    this.raquetePlay1 = raquetePlay1;
    this.raquetePlay2 = raquetePlay2;
    this.statusPlay1 = statusPlay1;
    this.statusPlay2 = statusPlay2;
    this.pontoPlay1 = pontoPlay1;
    this.pontoPlay2 = pontoPlay2;
  }
}

function checkListEspera(){
  if (jogadoresEspera.length >= 2) {
    var player1 = jogadoresEspera[0];
    var player2 = jogadoresEspera[1];
    var obj = new ObjetoComDoisSockets(player1, player2, 5, 5, false, false, 0, 0);
    jogos.push(obj);
    jogadoresEspera.splice(1, 1);
    jogadoresEspera.splice(0, 1);
    console.log('jogo iniciado');
    const socket1 = jogadores.find(socket => socket.id === player1);
    const socket2 = jogadores.find(socket => socket.id === player2);
    if (socket1 && socket2) {

      // Emitir evento 'startGame' para cada jogador com o papel atribuído
      socket1.emit('startGame', {
        message: 'Jogo iniciou',
        role: 'player1',
      });

      socket2.emit('startGame', {
        message: 'Jogo iniciou',
        role: 'player2',
      });
      console.log("testando ---------------- "+ player1);
    console.log("testando ---------------- "+ player2)
    }
    
    
  } else {
    var player1 = jogadoresEspera[0];
    const socket = jogadores.find(socket => socket.id === player1);
    if (socket) {
      socket.emit('waiting', 'Jogador foi pra fila de espera.');
    }
    
  }
  console.log('lista espera: ', jogadoresEspera.length);
}
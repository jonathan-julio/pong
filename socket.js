const app = require('express')()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname +'/public/index.html')
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
    checkListEspera();
    console.log('Usuário desconectado:', socket.id);
  });
})

http.listen(3000, function() {
  console.log('Servidor ouvindo na porta 3000');
})


class ObjetoComDoisSockets {
  constructor(socket1, socket2) {
    this.socketId1 = socket1;
    this.socketId2 = socket2;
  }
}

function checkListEspera(){
  if (jogadoresEspera.length >= 2) {
    var player1 = jogadoresEspera[0];
    var player2 = jogadoresEspera[1];
    var obj = new ObjetoComDoisSockets(player1, player2);
    jogos.push(obj);
    jogadoresEspera.splice(1, 1);
    jogadoresEspera.splice(0, 1);
    console.log('jogo iniciado');
    const socket1 = jogadores.find(socket => socket.id === player1);
    if (socket1) {
      socket1.emit('startGame', 'Jogo iniciou');
    }
    const socket2 = jogadores.find(socket => socket.id === player2);
    if (socket2) {
      socket2.emit('startGame', 'Jogo iniciou');
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
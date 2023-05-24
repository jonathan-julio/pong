const socket = io();
      
socket.on('connect', function() {
  console.log('Conectado ao servidor');
});

socket.on('disconnect', function() {
  console.log('Desconectado do servidor');
  document.getElementById('game').style.display = 'none';
  document.getElementById('load').style.display = 'block';
});

socket.on('startGame', function(msg) {
  console.log('Iniciando jogo');
  document.getElementById('load').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  alert(msg);
});

socket.on('waiting', function(msg) {
  console.log('Aguardando jogador');
  document.getElementById('game').style.display = 'none';
  document.getElementById('load').style.display = 'block';
});
function ObjetoComDoisSockets(socket1, socket2) {
    this.socket1 = socket1;
    this.socket2 = socket2;
  }
  
  // Métodos para interagir com os sockets
  
  ObjetoComDoisSockets.prototype.getSocket1 = function () {
    return this.socket1;
  };
  
  ObjetoComDoisSockets.prototype.getSocket2 = function () {
    return this.socket2;
  };
  
  ObjetoComDoisSockets.prototype.close = function () {
    try {
      this.socket1.close();
      this.socket2.close();
    } catch (error) {
      console.error(error);
    }
  };
  
  // Outros métodos e funcionalidades do objeto
  
  // Exemplo de uso
  var socket1 = new Socket();
  var socket2 = new Socket();
  
  var objeto = new ObjetoComDoisSockets(socket1, socket2);
  objeto.getSocket1(); // Acessa o socket 1
  objeto.getSocket2(); // Acessa o socket 2
  objeto.close(); 
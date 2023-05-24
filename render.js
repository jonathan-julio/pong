import { canvas, context } from "./canvas.js";
import { bola, paletaEsquerda, paletaDireita } from "./jogo.js";

function renderizarBola() {
    context.beginPath();
    context.arc(bola.x, bola.y, bola.raio, 0, 2 * Math.PI);
    context.fillStyle = "#FFFFFF";
    context.fill();
    context.closePath();
  }
  function renderizarPaletaEsquerda() {
    context.fillStyle = "#FFFFFF";
    context.fillRect(
      paletaEsquerda.x,
      paletaEsquerda.y,
      paletaEsquerda.largura,
      paletaEsquerda.altura
    );
  }
  
  function renderizarPaletaDireita() {
    context.fillStyle = "#FFFFFF";
    context.fillRect(
      paletaDireita.x,
      paletaDireita.y,
      paletaDireita.largura,
      paletaDireita.altura
    );
  }
  function renderizar() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    renderizarBola();
    renderizarPaletaEsquerda();
    renderizarPaletaDireita();
  }
      

import { Juego } from "./js/Juego.js";

var juego = new Juego();
document.juego = juego;

loop();

function loop() {
  requestAnimationFrame(loop);
  juego.actualizar();
}




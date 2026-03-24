
class Teclado {
  constructor () {
  }

  static init(){
    window.addEventListener('keydown', Teclado.onKeyDown, false);
    window.addEventListener('keyup', Teclado.onKeyUp, false);
  }

  static onKeyUp(event)   {Teclado.tecla[event.keyCode] = 0;}
  static onKeyDown(event) {Teclado.tecla[event.keyCode] = 1;}
  static limpiar()        {Teclado.tecla = new Array();}
  static pulsada(tecla1, tecla2) {
    return (Teclado.tecla[tecla1] == 1 && Teclado.tecla[tecla2] == 1);
  }
}

Teclado.tecla = new Array();
Teclado.CURSOR_ARRIBA = 38;
Teclado.CURSOR_ABAJO = 40;
Teclado.CURSOR_IZQUIERDA = 37;
Teclado.CURSOR_DERECHA = 39;
Teclado.F2 = 113;
Teclado.F3 = 114;
Teclado.F4 = 115;
Teclado.F7 = 118;
Teclado.F9 = 119;
Teclado.SHIFT = 16;
Teclado.CONTROL = 17;
Teclado.ALT = 18;
Teclado.SUMAR = 107;
Teclado.RESTAR = 109;
Teclado.INSERT = 45;
Teclado.SUPR = 46;
Teclado.E = 69;
Teclado.A = 65;
Teclado.ESPACIO = 32;

export { Teclado };

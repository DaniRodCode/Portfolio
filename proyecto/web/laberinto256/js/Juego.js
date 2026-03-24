// que la posicion 0,0 no sea el centro del mapa
// En la descripcion del mapa incluir la posicion de salida del jugador
// Incluir la cancion del mapa
// Definir nº aleatorio para que no cambie de una partida a otra
// - Que haya objetos que bloqueen el paso
// - Que el agua se mejor
// - Fondo del mundo
// - Que el editor muestre los datos de la celda y mapa
// - Que el editor permita cambiar el nº de filas y columnas


import * as THREE from "./lib/three.module.js";
import { Graficos } from "./Graficos.js";
import { Mapa } from "./Mapa.js";
import { Personaje } from "./Personaje.js";
import { Teclado } from "./Teclado.js";
import { Editor } from "./Editor.js";
import { Musica, Efectos, Sonido } from "./Sonido.js";


class Juego {  
  constructor() {
    Juego.instancia = this;
    this.nombreMapaActual = "Inicial";
    this.clock = new THREE.Clock();
    this.estado;
    this.mapa;
    this.jugador;
    this.editor;
    this.sonido = Sonido;
    this.peligro;

    Graficos.init();
    Sonido.init();
    this.cambiarEstado(Juego.ESTADO_INICIAL);
  }


  cambiarEstado(estado)   { this.estado = estado; }
  actualizar()            { this[this.estado]();  }

  estadoBuclePrincipal_entrada() {
    if (Teclado.tecla[Teclado.CURSOR_IZQUIERDA])  this.jugador.girarIzquierda();
    if (Teclado.tecla[Teclado.CURSOR_DERECHA])  this.jugador.girarDerecha();
    if (Teclado.tecla[Teclado.CURSOR_ARRIBA])  this.jugador.avanzar();
    if (Teclado.tecla[Teclado.CURSOR_ABAJO])  this.jugador.retroceder();
    if (Teclado.tecla[Teclado.F2]) {
      this.editor.mostrarInterfaz();
      Teclado.limpiar();
      this.cambiarEstado(Juego.ESTADO_EDITOR);
    }
  }
  

  estadoEditor_entrada() {
    if (Teclado.tecla[Teclado.SHIFT]) {
      if (Teclado.tecla[Teclado.CURSOR_IZQUIERDA]) this.editor.moverCamara(.04,0,0);
      if (Teclado.tecla[Teclado.CURSOR_DERECHA])   this.editor.moverCamara(-.04,0,0);
      if (Teclado.tecla[Teclado.CURSOR_ARRIBA])    this.editor.moverCamara(0,-.04,0);
      if (Teclado.tecla[Teclado.CURSOR_ABAJO])     this.editor.moverCamara(0,+.04,0);
      if (Teclado.tecla[Teclado.SUMAR])            this.editor.moverCamara(0,0,+0.4);
      if (Teclado.tecla[Teclado.RESTAR])           this.editor.moverCamara(0,0,-0.4);
    } else if (Teclado.tecla[Teclado.ALT]) {
      if (Teclado.tecla[Teclado.CURSOR_IZQUIERDA])  this.editor.moverObjeto(-.1,0,0);
      if (Teclado.tecla[Teclado.CURSOR_DERECHA])    this.editor.moverObjeto(+.1,0,0);
      if (Teclado.tecla[Teclado.CURSOR_ARRIBA])     this.editor.moverObjeto(0,0,-.1);
      if (Teclado.tecla[Teclado.CURSOR_ABAJO])      this.editor.moverObjeto(0,0,+.1);
      if (Teclado.tecla[Teclado.SUMAR])             this.editor.moverObjeto(0,+.1,0);
      if (Teclado.tecla[Teclado.RESTAR])            this.editor.moverObjeto(0,-.1,0);
    } else {
      if (Teclado.tecla[Teclado.CURSOR_IZQUIERDA])  {this.editor.moverCursor(0,-1); Teclado.limpiar();}
      if (Teclado.tecla[Teclado.CURSOR_DERECHA])    {this.editor.moverCursor(0,+1); Teclado.limpiar();}
      if (Teclado.tecla[Teclado.CURSOR_ARRIBA])     {this.editor.moverCursor(+1,0); Teclado.limpiar();}
      if (Teclado.tecla[Teclado.CURSOR_ABAJO])      {this.editor.moverCursor(-1,0); Teclado.limpiar();}
      if (Teclado.tecla[Teclado.SUMAR])             {this.editor.cambiarAlturaCelda(+1); Teclado.limpiar();}
      if (Teclado.tecla[Teclado.RESTAR])            {this.editor.cambiarAlturaCelda(-1); Teclado.limpiar();}
    }

    if (Teclado.tecla[Teclado.INSERT])              {this.editor.anadirObjeto(); Teclado.limpiar();} 
    if (Teclado.tecla[Teclado.SUPR])                {this.editor.borrarObjeto(); Teclado.limpiar();}

    if (Teclado.tecla[Teclado.F2]) {
      this.editor.ocultarInterfaz();
      Teclado.limpiar();
      this.cambiarEstado(Juego.ESTADO_BUCLE_PRINCIPAL);      
    }

    if (Teclado.tecla[Teclado.F4])                  {this.guardarPantalla(); Teclado.limpiar(); }
    if (Teclado.tecla[Teclado.F7])                  {this.cargarPantallasGuardadas(); Teclado.limpiar();}
    if (Teclado.tecla[Teclado.A])                   {this.editor.cambiarAparienciaCelda(); Teclado.limpiar();}
  }


  actualizarCamara() {
    var jugador = this.jugador;
    var posicion = jugador.posicionXYZ();

    var distancia = 60;
    var delta_x = distancia * Math.cos(-jugador.direccion + Math.PI);
    var delta_y = distancia/2+posicion.y;
    var delta_z = distancia * Math.sin(+jugador.direccion - Math.PI);

    var posx = posicion.x + delta_x;
    var posy = delta_y;
    var posz = posicion.z + delta_z;

    Graficos.modificarCamara(posx, posy, posz, posicion.x,posicion.y,posicion.z);
  }  


  actualizarMusica() {
    var posicion = this.jugador.posicionXYZ();
    var peligro = (posicion.y - this.mapa.alturaAgua)/10;

    peligro = Number(peligro.toFixed(1))
    if (peligro>1) peligro = 1;
    else if (peligro<0) peligro = 0;

    if (this.peligro == peligro) return;

    this.peligro = peligro;
    Musica.velocidad(peligro);
    Musica.volumen(1.2-peligro);
  }  



  estadoEditor_actualizarCamara() {
    var direccion = this.editor.camara.direccion;
    var distancia = this.editor.camara.distancia;
    var altura = this.editor.camara.altura;

    var posx = distancia * Math.sin(altura)*Math.sin(direccion);
    var posy = distancia * Math.cos(altura);
    var posz = distancia * Math.sin(altura)*Math.cos(direccion);

    Graficos.modificarCamara(posx, posy, posz, 0,0,0);
  }  


  estadoInicial() {  
    if (!Graficos.ready) return;
    if (!Sonido.ready) return;

    this.mapa = new Mapa(this);
    this.jugador = new Personaje(this.mapa);
    this.editor =  new Editor(this.mapa); 
    
    this.mapa.cargar(this.nombreMapaActual,Juego.codigosMapas[this.nombreMapaActual] );
    this.mapa.crear3D();
    this.jugador.crear3D();
    this.editor.crear3D();
    this.editor.crearInterfaz();
    this.editor.actualizarInterfaz();

    Teclado.init();
    Musica.comenzar();

    this.cambiarEstado(Juego.ESTADO_BUCLE_PRINCIPAL);  
    console.log(Graficos.renderer.info.memory);
  }

  
  estadoBuclePrincipal() {
    var delta = this.clock.getDelta();
    
    this.estadoBuclePrincipal_entrada();
    this.mapa.actualizar(delta);
    this.jugador.actualizar(delta);
    this.actualizarCamara();
    this.actualizarMusica();
    Graficos.render();    
  }

  estadoCambioPantalla() {  
    Graficos.dispose();
    this.cambiarEstado(Juego.ESTADO_INICIAL);    
  }

  estadoEditor() {  
    this.estadoEditor_entrada();
    this.editor.actualizar();
    this.estadoEditor_actualizarCamara();
    Graficos.render();
  }


  static efecto(nombre, parametros){
    Juego.instancia["efecto_"+nombre](parametros);
  }


  efecto_cambiarPantalla(parametros){
    if (parametros.length == 0)
      this.nombreMapaActual = this.siguienteMapa();
    else this.nombreMapaActual = parametros[0];

    this.cambiarEstado(Juego.ESTADO_CAMBIO_PANTALLA);
  }

  efecto_cambiarVida(parametros){
    if (parametros.length == 0)
      parametros.push(-1);

    this.jugador.cambiarVida(parseInt(parametros[0]));
  }

  siguienteMapa() {
    var nombres = Object.keys(Juego.codigosMapas);
    for (var i=0;i<nombres.length;i++)
        if (this.nombreMapaActual == nombres[i]) {
          if (i<nombres.length-1) i++;
          else i=0;
          return nombres[i];
        }
    return false;
  }
}


Juego.configuracion = {
  verCentroMapa:  false,
  verCentro:      false,
  verMuneco:      true,
  verCuadrado:    false,
  verDireccion:   false,
  verMalla:       false
  };

Juego.ESTADO_INICIAL = "estadoInicial";
Juego.ESTADO_BUCLE_PRINCIPAL = "estadoBuclePrincipal";
Juego.ESTADO_CAMBIO_PANTALLA = "estadoCambioPantalla";
Juego.ESTADO_EDITOR = "estadoEditor";
Juego.codigosMapas = {
  Inicial:"2 2 1A 1A 1A 1A 1 10 5 10 GB",
  MonteGB:"5 5 0A 1A 1A 1A 1A 16A 18A 19A 20A 6A 15A 29A 31A 20A 7A 14A 26A 25A 24A 8A 13A 12A 11A 10A 9A 2 25 31 25 GB 5 -4.5 25 VALLA"
}


Juego.instancia;

export { Juego };



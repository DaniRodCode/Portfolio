
import { Juego } from "./Juego.js";
import { VariableContinua } from "./Utils.js";
import { Graficos } from "./Graficos.js";
import { Musica, Efectos, Sonido } from "./Sonido.js";
import { Animacion } from "./Animacion.js";

class Personaje {
  constructor(mapa) {
    this.mapa = mapa;
    this.juego = this.mapa.juego;
    this.fila = 0.5;
    this.columna = 0.5;
    this.altura = 0;
    this.direccion = 0;
    this.velocidadGiro = new VariableContinua(20);
    this.velocidad = new VariableContinua(20);
    this.capacidadSalto = 2;
    this.aceleracion = 0.03; //0.04;
    this.ancho = 4;
    this.largo = 4;
    this.alto = 8;
    this.mesh;
    this.meshMarcador;
    this.animacion;
    this.tamanoSprite = 8;
    this.vida = 100;
    this.tiempoMarcador = 3;
  }

  girarIzquierda() {this.velocidadGiro.cambiar(-this.aceleracion);}
  girarDerecha()   {this.velocidadGiro.cambiar(this.aceleracion);}
  avanzar()        {this.velocidad.cambiar(this.aceleracion);}
  retroceder()     {this.velocidad.cambiar(-this.aceleracion);}
  posicionXYZ()    {return this.mapa.posicionXYZ(this.fila, this.columna);}

  actualizar(time) {
    var actual = this.mapa.posicionXYZ(this.fila,this.columna);
    this.direccion += this.velocidadGiro.valor;

    var d_fila = this.velocidad.valor * Math.cos(this.direccion);
    var d_columna = this.velocidad.valor * Math.sin(this.direccion);

    var new_fila = this.fila + d_fila;
    var new_columna = this.columna + d_columna;
    var nueva = this.mapa.posicionXYZ(new_fila, new_columna);

    if (!this.puedeMover(nueva)) {
      var nuevaX = this.mapa.posicionXYZ(new_fila, this.columna);
      var nuevaZ = this.mapa.posicionXYZ(this.fila, new_columna);

      if (!this.puedeMover(nuevaX)) new_fila = this.fila;
      if (!this.puedeMover(nuevaZ)) new_columna = this.columna;
    }
   
    this.velocidad.actualizar();
    this.velocidadGiro.actualizar();
    this.actualizarPosicion(new_fila, new_columna);   
   
    // comprobamos los objetos y aplicamos su efecto
    for (var objeto of this.objetosEnContacto()) {
      console.log("Contacto con:"+objeto.nombre+" ("+objeto.posicion.x+","+objeto.posicion.y+","+objeto.posicion.z+")");
      objeto.efecto();
    }

    // comprobamos la altura del agua
    if (this.mapa.alturaAgua > this.altura)
       this.cambiarVida(-1);

    if (this.estaMuerto())
      this.juego.cambiarEstado(Juego.ESTADO_CAMBIO_PANTALLA);

    if (this.velocidad.valor > 0) this.animacion.secuencia("arriba");
    else if (this.velocidad.valor < 0) this.animacion.secuencia("abajo");
    else {
      if (this.velocidadGiro.valor > 0) this.animacion.secuencia("derecha");
      else if (this.velocidadGiro.valor <0 ) this.animacion.secuencia("izquierda");
      else this.animacion.parar();
    }

    this.actualizarMarcador(time);
    this.animacion.update(time);

    var actual = this.mapa.posicionXYZ(this.fila,this.columna);
  }

  puedeMover(destino) {
    for (var punto of this.puntosContorno(destino))
      if (!this.puedeSaltar(punto)) 
        return false;

    for (var objeto of this.objetosEnContacto(destino))
      if (objeto.obstaculo)
        return false;    

    return true;
  }

  puedeSaltar(destino) {
    if (destino == -1) return false;

    var delta_y = Math.abs(destino.y - this.altura);
    if (delta_y > this.capacidadSalto) return false;

    return true;
  }

  actualizarPosicion(fila, columna) {
    var final = this.mapa.posicionXYZ(fila, columna);
 
    this.fila = fila;
    this.columna = columna;
    this.altura = final.y;

    this.mesh.position.x = final.x;
    this.mesh.position.y = final.y;
    this.mesh.position.z = final.z;
    //this.mesh.rotation.y = -this.direccion;
  }


  actualizarMarcador(time) {
    if (this.tiempoMarcador == 0) return;

    this.tiempoMarcador -= time;
    if (this.tiempoMarcador <= 0) {
      this.meshMarcador.visible = false;
      this.tiempoMarcador = 0;
    }
    else {
      this.meshMarcador.scale.set(1,1,this.vida/100);
      this.meshMarcador.material.opacity = this.tiempoMarcador;
      this.meshMarcador.visible = true;
    }    
  }


  cambiarVida(valor) {
    this.vida += valor;
    this.tiempoMarcador = 3;
    Efectos.herir();
  }


  estaMuerto(){
    return this.vida <= 0;
  }


  puntosContorno(centro) {
    var puntos = new Array();

    var w = (this.ancho / Graficos.tamCelda) / 2;
    var l = (this.largo / Graficos.tamCelda) / 2;

    var f = centro.fila;
    var c = centro.columna;

    puntos.push(this.mapa.posicionXYZ(f + l, c + w));
    puntos.push(this.mapa.posicionXYZ(f + l, c - w));
    puntos.push(this.mapa.posicionXYZ(f - l, c + w));
    puntos.push(this.mapa.posicionXYZ(f - l, c - w));

    return puntos;
  }

  crear3D() {
    this.mesh = Graficos.crearMallaJugador(this.ancho,this.alto,this.largo, this.tamanoSprite);
    this.animacion = new Animacion(Graficos.mapaSprites, 
            {"derecha":   [224,225,224,226], 
             "izquierda": [227,228,227,229], 
             "abajo":     [230,231,230,232], 
             "arriba":    [233,234,233,235], 
             "parado":    [233]
            });  

    this.animacion.comenzar();    
    this.meshMarcador = this.mesh.marcador; 
    Graficos.scene.add(this.mesh);
  }

  objetosEnContacto(destino) {
    var contactados = new Array();
    for (var objeto of this.mapa.objetos)
        if (this.enContacto(objeto, destino))
          contactados.push(objeto);

    return contactados;
  }


  enContacto(objeto, destino) {
    if (destino == undefined)
      destino = this.mapa.posicionXYZ(this.fila, this.columna);
    
    var p0 = destino;
    var p1 = objeto.posicion;
    var s0 = {l:this.largo,   w:this.ancho,   d:this.alto};
    var s1 = {l:objeto.largo, w:objeto.ancho, d:objeto.alto}; 

    if (p0.x+s0.w/2 > p1.x-s1.w/2 && 
        p0.x-s0.w/2 < p1.x+s1.w/2 && 
        p0.y+s0.d   > p1.y && 
        p0.y        < p1.y+s1.d && 
        p0.z+s0.l/2 > p1.z-s1.l/2 && 
        p0.z-s0.l/2 < p1.z+s1.l/2) {
        return true;
    }

    return false;
  }

  celdaActual() {
    return this.mapa.celdas[Math.floor(this.fila)][Math.floor(this.columna)];
  }
}


export {Personaje};
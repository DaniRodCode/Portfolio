
import * as THREE from "./lib/three.module.js";

class Animacion {
  constructor (texture, secuencias) {
    this.avanzarIndex = false;
    this.currentIndex = 0;
    this.currentTile = 0;
    this.durationTile = texture.velocidad;
    this.currentTime = 0;
    this.hTiles = texture.columnas;
    this.vTiles = texture.filas;
    this.cntTiles = this.hTiles * this.vTiles;
    this.texture = texture;
    this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.repeat.set(1 / this.hTiles, 1 / this.vTiles);
    this.secuencias = secuencias;
    this.secuenciaActual = Object.keys(this.secuencias)[0];
  }

  update(time) {
    if (!this.avanzarIndex) return;

    this.currentTime += time;
    while (this.currentTime > this.durationTile) {
      this.currentTime -= this.durationTile;
      this.currentIndex++;
      var secuencia = this.secuencias[this.secuenciaActual];

      if (this.currentIndex == secuencia.length)
        this.currentIndex = 0;

      this.actualizarFrame();
    }
  }

  actualizarFrame() {
    var secuencia = this.secuencias[this.secuenciaActual];
    this.currentTile = secuencia[this.currentIndex];

    var iColumn = this.currentTile % this.hTiles;
    this.texture.offset.x = iColumn / this.hTiles;
    var iRow = Math.floor(this.currentTile / this.hTiles);
    this.texture.offset.y = iRow / this.vTiles;
  }

  secuencia(nombre){
    if (this.secuenciaActual != nombre) {
      this.secuenciaActual = nombre;
      this.currentIndex = 0;
    }
    this.comenzar();
    this.actualizarFrame();
  }

  comenzar(){this.avanzarIndex=true;}
  
  parar(){
    if (this.avanzarIndex == false) return;

    this.avanzarIndex = false;
    this.currentIndex = 0;
    this.actualizarFrame();
  }
}


export {Animacion};


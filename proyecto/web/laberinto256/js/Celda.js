

import { Graficos } from "./Graficos.js"


class Celda {
  constructor (mapa, data){
    this.mapa = mapa;
    this.altura = data.altura;
    this.apariencia = data.apariencia;
    this.vertices = [this.altura,this.altura,this.altura,this.altura];
    this.adyacentes;
    this.mesh;
  }

  celdasAdyacentes(celdas) { this.adyacentes = celdas; }

  ajustarAltura() {
    var pos = [[0,1,3],[1,2,4],[4,6,7],[3,5,6]];

    for (var i=0;i<4;i++){
      var p = pos[i];
      var h = new Array();

      for (var j=0;j<p.length;j++)
          if (this.adyacentes[p[j]] != null)
             h.push(this.adyacentes[p[j]].altura);

      this.vertices[i] = this.calcularAlturaVertice(h);
    }

  }

//  mostrarEtiqueta(){this.mesh.etiqueta.visible=true;}
//  ocultarEtiqueta(){this.mesh.etiqueta.visible=false;}


  calcularAlturaVertice(alturas) {
    var alturaUnion = this.mapa.alturaUnion;
    var altura = this.altura;

    for (var h of alturas) {
        var dh = Math.abs(this.altura - h);
        if (dh <= alturaUnion && h > altura)
           altura = h;
    }
  
    return altura;
  }

  
  crear3D() {
    this.mesh = Graficos.crearCelda(this);
    return this.mesh;
  }


  calcularY(f, c) {
    var x = f;
    var z = c;
    var y;
    var p1 = {x:0,y:this.vertices[0],z:0};
    var p2 = {x:0,y:this.vertices[1],z:1};
    var p3 = {x:1,y:this.vertices[2],z:1};

    if (x>z) p2 = {x:1,y:this.vertices[3],z:0};

    var det = (p2.z - p3.z) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.z - p3.z);

    var l1 = ((p2.z - p3.z) * (x - p3.x) + (p3.x - p2.x) * (z - p3.z)) / det;
    var l2 = ((p3.z - p1.z) * (x - p3.x) + (p1.x - p3.x) * (z - p3.z)) / det;
    var l3 = 1 - l1 - l2;

    return l1 * p1.y + l2 * p2.y + l3 * p3.y;
  }

  data() {
    return {
      altura:this.altura,
      apariencia:this.apariencia
    };
  }


}

Celda.apariencias = {
  A:[0,51,54,53,55],
  B:[0,51,52],
  C:[0,3,4],
  D:[0,4,3],
}




export { Celda };
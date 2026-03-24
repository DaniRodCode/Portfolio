
import * as THREE from "./lib/three.module.js";
import { Objeto } from "./Objeto.js"
import { Juego } from "./Juego.js"
import { Graficos } from "./Graficos.js"
import { Celda } from "./Celda.js"
 


class Mapa {
  constructor(juego) {
    this.juego = juego;
    this.nombre;
    this.codigo;
    this.data;
    this.celdas;
    this.filas;
    this.columnas;
    this.objetos = new Array();
    this.mesh;
    this.meshAgua;
    this.alturaAgua = 0;
    this.velocidadAlturaAgua = 0.0005;
    this.alturaUnion = 5;
  }

  cargar (nombreMapa, codigoMapa) {
    this.nombre = nombreMapa;
    this.codigo = codigoMapa;
    this.data = this.decodificarCodigo(codigoMapa);

    this.crearCeldas();
    this.ajustarAlturaCeldas();
    this.crearObjetos();

    return true;
  }

  

  crearCeldas() {
    var data = this.data;
    this.filas = data.alturas.length;
    this.columnas = data.alturas[0].length;
    this.celdas = new Array();

    for (var i=0;i<this.filas;i++) {
        var fila = new Array();
        
        for (var j=0;j<this.columnas;j++) {
            var dataCelda = {
                altura:data.alturas[i][j],
                apariencia:data.apariencias[i][j]
            }
            fila[j] = new Celda(this, dataCelda);
        }
        this.celdas[i] = fila;
    }
  }



  crearObjetos() {
    for (var obj of this.data.objetos) {
      var posicion = {x:obj.x, y:obj.y, z:obj.z};
      var objeto = new Objeto(this, posicion, obj.nombre);

      this.objetos.push(objeto);
    }
  }



  celdasAdyacentes(fila,columna) {
    var deltas = [[-1,-1],[-1,0], [-1,1],
                  [ 0,-1],        [ 0,1],
                  [ 1,-1],[ 1,0], [ 1,1]];

    var adyacentes = new Array();

    for (var delta of deltas) {
      var f = fila + delta[0];
      var c = columna + delta[1];

      if (f < 0 || f >= this.filas || 
          c < 0 || c >= this.columnas)
          var adyacente = null;
      else 
         var adyacente = this.celdas[f][c];

      adyacentes.push(adyacente);
    }

    return adyacentes;
  }
  


  ajustarAlturaCeldas() {
      for (var i=0;i<this.filas;i++)
        for (var j=0;j<this.columnas;j++) {
            this.celdas[i][j].celdasAdyacentes(this.celdasAdyacentes(i,j));
            this.celdas[i][j].ajustarAltura();
        }
  }




  posicionXYZ(fila, columna) {
    if ( fila < 0    || fila >= this.filas ||
         columna < 0 || columna >= this.columnas )
         return -1;

    var f = Math.floor(fila);
    var c = Math.floor(columna);
/*
    var x = fila * Graficos.tamCelda - (Graficos.tamCelda * this.columnas) / 2;
    var y = this.celdas[f][c].calcularY(fila-f, columna-c);
    var z = columna * Graficos.tamCelda - (Graficos.tamCelda * this.filas) / 2;
*/

    var x = fila * Graficos.tamCelda;
    var y = this.celdas[f][c].calcularY(fila-f, columna-c);
    var z = columna * Graficos.tamCelda;

    return { x: x, y: y, z: z, fila: fila, columna: columna };
  }



  crear3D() {
    var group = new THREE.Group();

    if (Juego.configuracion.verCentroMapa)
       group.add(crearEjeY());

    Graficos.crearEscena(this.data);
   
    // creamos las celdas
    for (var i = 0; i < this.filas; i++) {
      for (var j = 0; j < this.columnas; j++) {
        group.add(this.crearCelda3D(i,j));
      }
    }

    // creamos los objetos
    for (var objeto of this.objetos)
      group.add(objeto.crear3D());

    // creamos el alturaAgua
    this.meshAgua = Graficos.crearAgua((this.filas)*Graficos.tamCelda,(this.columnas)*Graficos.tamCelda);
    group.add(this.meshAgua);

   this.mesh = group;
   Graficos.scene.add(this.mesh);
  }



  crearCelda3D(fila, columna) {
    var posicion = this.posicionXYZ(fila, columna);

    var obj = this.celdas[fila][columna].crear3D();
    obj.position.set(posicion.x,obj.position.y,posicion.z);

    return obj;
  }

  eliminarCeldas3D() {
    for (var i = 0; i < this.filas; i++)
      for (var j = 0; j < this.columnas; j++)
         this.mesh.remove(this.celdas[i][j].mesh);
  }

  hacerCeldas(funcion) {
    for (var i = 0; i < this.filas; i++)
      for (var j = 0; j < this.columnas; j++)
          this.celdas[i][j][funcion]();
  }


  actualizar(delta) {
      //actualizamos los objetos
      for (var objeto of this.objetos)
          objeto.actualizar(delta);

      this.alturaAgua += this.velocidadAlturaAgua;
      this.meshAgua.position.y = this.alturaAgua;
      this.meshAgua.material.uniforms[ 'time' ].value += 1.0 / 160.0;
  }

  alturasContiguas(fila, columna) {
    var alturas = new Array();
    var deltas = [[0,0],[0,1],[1,1],[1,0]];

    for (var delta of deltas) {
        var altura = this.posicionXYZ(fila + delta[0], columna + delta[1]);
        alturas.push(altura.y);
    }

    return alturas;
  }



  cambiarCelda(fila, columna, data) {
    this.mesh.remove(this.celdas[fila][columna].mesh);
    var celda = new Celda(this,data);
    this.celdas[fila][columna] = celda;
    celda.celdasAdyacentes(this.celdasAdyacentes(fila,columna));
    celda.ajustarAltura();
    this.mesh.add(this.crearCelda3D(fila,columna));
    //celda.mostrarEtiqueta();
  }



  cambiarTamano(filas, columnas) {
    var data = this.data;
    var celdas = new Array();
    var maximoFilas = Math.max(filas,this.filas);
    var maximoColumnas = Math.max(columnas, this.columnas);

    for (var i=0;i<maximoFilas;i++) {
      celdas[i] = new Array();

      for (var j=0;j<maximoColumnas;j++) {
        if (i < filas && j < columnas) {
          if (i < this.filas && j < this.columnas) {
//            console.log("Recupera: "+i+","+j);
            this.mesh.remove(this.celdas[i][j].mesh);
            celdas[i][j] = this.celdas[i][j];
            continue;
          }
          else {
            var dataCelda = {
               altura:1,
               apariencia:"A"
            }

            celdas[i][j] = new Celda(this,dataCelda);
//            console.log("Creamos: "+i+","+j);
            continue;
          }
        }
        else {
          this.mesh.remove(this.celdas[i][j].mesh);
//          console.log("Borramos fila: "+i+","+j);
        }

      }
    }

    this.filas = filas;
    this.columnas = columnas;
    this.celdas = celdas;

    for (var i=0;i<this.filas;i++)
      for (var j=0;j<this.columnas;j++) {
        this.celdas[i][j].celdasAdyacentes(this.celdasAdyacentes(i,j));
        this.celdas[i][j].ajustarAltura();
        this.mesh.add(this.crearCelda3D(i,j));
//        console.log("Ajustamos y 3D: "+i+","+j);
      }
  }
 


  crearObjeto(nombre, x, y, z, id) {
    if ( arguments.length < 5 ) id = -1;

    //console.log("cambiarObjeto: "+id+","+nombre+","+x+","+y+","+z);
  
    var posicion = {x:x, y:y, z:z};
    var objeto = new Objeto(this, posicion, nombre);

    if (id >= 0) {
      this.mesh.remove(this.objetos[id].mesh);
      this.objetos[id] = objeto;
    } else
      this.objetos.push(objeto);
    
    this.mesh.add(objeto.crear3D());
  }



  eliminarObjeto(id) {
    var nuevo = new Array();
    this.mesh.remove(this.objetos[id].mesh);

    for (var i=0;i<this.objetos.length;i++)
        if (i != id)
          nuevo.push(this.objetos[i]);

    this.objetos = nuevo;
  }


  decodificarCodigo(cadena) {
    var alturas = new Array();
    var apariencias = new Array();
    var objetos = new Array();
    var escena = {};

    //separamos por espacios
    var tokens = cadena.split(" ");

    // sacamos las filas y las columnas
    var filas = parseInt(tokens.shift());
    var columnas = parseInt(tokens.shift());

    // cargamos las alturas y apariencias de cada celda
    for (var i=0;i<filas;i++){
        var filaAlturas = new Array();
        var filaApariencias = new Array();
        for (var j=0;j<columnas;j++) {
            var celda = tokens.shift();
            var altura = parseInt(celda.substr(0,celda.length-1));
            var apariencia = celda.substr(-1);
            filaAlturas.push(altura);
            filaApariencias.push(apariencia);
        }

        alturas.push(filaAlturas);
        apariencias.push(filaApariencias);
    }

    //cargamos el nº de objetos
    var nObjetos = parseInt(tokens.shift());

    //cargamos los objetos
    for (var i=0;i<nObjetos;i++){
        var x = parseFloat(tokens.shift());
        var y = parseFloat(tokens.shift());
        var z = parseFloat(tokens.shift());
        var nombre = tokens.shift();

        var objeto = {x:x,y:y,z:z,nombre:nombre};

        objetos.push(objeto);
    }

    return {alturas:alturas, apariencias:apariencias, objetos:objetos, escena:escena};

  }

  generarCodigo() {
    var tokens = new Array();

    tokens.push(this.filas);
    tokens.push(this.columnas);

    for (var i=0;i<this.filas;i++)
        for (var j=0;j<this.columnas;j++) {
            var celda = this.celdas[i][j];
            tokens.push(celda.altura + celda.apariencia);
        }

    tokens.push(this.objetos.length);
    for (var i=0;i<this.objetos.length;i++){
        var obj = this.objetos[i];
        tokens.push(obj.posicionOriginal.x);
        tokens.push(obj.posicionOriginal.y);
        tokens.push(obj.posicionOriginal.z);
        tokens.push(obj.nombre);
    }

    //separamos por espacios
    var cadena = tokens.join(" ");

    return cadena;
  }

}


export {Mapa};
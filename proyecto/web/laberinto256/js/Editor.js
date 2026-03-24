
import { Graficos } from "./Graficos.js"
import { Celda } from "./Celda.js";
import { Objeto } from "./Objeto.js";
import { Cookies } from './lib/Cookies.js';
import { Juego } from "./Juego.js";


class Editor {
    constructor(mapa) {
        this.mapa = mapa;
        this.posicion = {fila:0,columna:0};
        this.camara = {direccion:-Math.PI/2,altura:45,distancia:80};
        this.mesh;
        this.apariencias = "";
        this.efectos = "";
        this.interfaz;

        for (const key in Celda.apariencias)
            this.apariencias += key;

        this.interfaz = document.getElementById("editor");
    }

    crear3D() {
        this.mesh = Graficos.crearCursor();
        this.mesh.visible = false;
        Graficos.scene.add(this.mesh);
    }

    crearInterfaz() {
        //actualizamos el listado de apariencias     
        var lista = document.getElementById("listaAspectos");
        while(lista.length>0) lista.remove(0);
        for (const key in Celda.apariencias) {
            var opt = document.createElement('option');
            opt.appendChild( document.createTextNode(key) );
            lista.appendChild(opt); 
        }

        //actualizamos el listado de objetos
        var lista = document.getElementById("listaObjetos");
        while(lista.length>0) lista.remove(0);
        for (const key in Objeto.tipos) {
            var opt = document.createElement('option');
            opt.appendChild( document.createTextNode(key) );
            lista.appendChild(opt); 
        }

        this.actualizarListadoMapas();

        lista.value = "";
    }

    mostrarInterfaz() {
        this.mesh.visible = true;
        this.interfaz.style.visibility = "visible";
    }

    actualizarInterfaz() {
        var filas = document.getElementById("filas");
        var columnas = document.getElementById("columnas");

        filas.value = this.mapa.filas;
        columnas.value = this.mapa.columnas;

        //actualizamos el listado de objetos actuales
        var lista = document.getElementById("listaObjetosActuales");
        while(lista.length>0) lista.remove(0);
        for (var objeto of this.mapa.objetos) {
            var opt = document.createElement('option');
            opt.appendChild( document.createTextNode(objeto.nombre) );
            opt.value = objeto; 
            lista.appendChild(opt); 
        }

        this.actualizarInterfazCelda();
    }

    actualizarInterfazCelda(){
        var data = this.celdaActual().data()
        document.getElementById("altura").value = data.altura;
        document.getElementById("listaAspectos").value = data.apariencia;
    }


    actualizarInterfazObjeto(){
        var id = document.getElementById("listaObjetosActuales").selectedIndex;
        if (id == -1) return;

        var objeto = this.mapa.objetos[id];
        document.getElementById("listaObjetos").value = objeto.nombre;
        document.getElementById("X").value = objeto.posicionOriginal.x;
        document.getElementById("Y").value = objeto.posicionOriginal.y;
        document.getElementById("Z").value = objeto.posicionOriginal.z;
    }

    ocultarInterfaz() {
        this.mesh.visible = false;
        this.interfaz.style.visibility = "hidden";
    }

    actualizar() {
        var final = this.mapa.posicionXYZ(this.posicion.fila, this.posicion.columna);
        this.mesh.position.set(final.x, final.y+1, final.z);
    }

    moverCamara(direccion, altura, distancia) {
        this.camara.direccion += direccion;
        this.camara.altura += altura;
        this.camara.distancia += distancia;
    }

    moverCursor(df, dc) {
        var f = this.posicion.fila += df;
        var c = this.posicion.columna += dc;

        if (f < 0 ) f = 0;
        else if (f >= this.mapa.filas) f=this.mapa.filas-1;

        if (c < 0 ) c = 0;
        else if (c >= this.mapa.columnas) c=this.mapa.columnas-1;

        this.posicion.fila = f;
        this.posicion.columna = c;

        this.actualizarInterfazCelda();
    }

    cambiarAlturaCelda(dh, absoluto){
        if (isNaN(dh)) return;
        if ( arguments.length < 2 ) absoluto = false;

        var data = this.celdaActual().data();
        if (absoluto) data.altura = dh;
        else data.altura += dh; 

        this.mapa.cambiarCelda(this.posicion.fila, this.posicion.columna, data);
    }

    cambiarAparienciaCelda(apariencia) {
        var data = this.celdaActual().data();
        if (arguments.length < 1) apariencia = this.siguienteElemento(this.apariencias, data.apariencia);

        data.apariencia = apariencia;
        this.mapa.cambiarCelda(this.posicion.fila, this.posicion.columna, data);
    }

    celdaActual() {
        return this.mapa.celdas[this.posicion.fila][this.posicion.columna];
    }

    siguienteElemento(cadena, elemento) {
        var index = cadena.indexOf(elemento);
        index++;
        if (index >= cadena.length) index = 0;

        return cadena.charAt(index);
    }

    actualizarObjeto() {
        var id = document.getElementById("listaObjetosActuales").selectedIndex;
        if (id == -1) return;
                
        var nombre = document.getElementById("listaObjetos").value;
        var x = parseFloat(document.getElementById("X").value);
        var y = parseFloat(document.getElementById("Y").value);
        var z = parseFloat(document.getElementById("Z").value);

        this.mapa.crearObjeto(nombre, x,y,z, id);
        this.actualizarInterfaz();
        document.getElementById("listaObjetosActuales").selectedIndex = id;
    }

    anadirObjeto() {  
        var nombre = document.getElementById("listaObjetos").value;
        if (nombre == "") nombre="DUMMY";

        var posicion = this.mapa.posicionXYZ(this.posicion.fila+.5, this.posicion.columna+.5);


        this.mapa.crearObjeto(nombre, posicion.x, posicion.y, posicion.z);
        this.actualizarInterfaz();
        document.getElementById("listaObjetosActuales").selectedIndex = this.mapa.objetos.length-1;
        this.actualizarInterfazObjeto();
    }

    limpiarObjeto() {  
        document.getElementById("listaObjetosActuales").selectedIndex = -1;
        document.getElementById("listaObjetos").value = "DUMMY";
        document.getElementById("X").value = "";
        document.getElementById("Y").value = "";
        document.getElementById("Z").value = "";
    }

    borrarObjeto() {
        var id = document.getElementById("listaObjetosActuales").selectedIndex;
        if (id == -1) return;
            
        this.mapa.eliminarObjeto(id);
        this.actualizarInterfaz();
        document.getElementById("listaObjetosActuales").selectedIndex = this.mapa.objetos.length-1;
    }

    moverObjeto(x,y,z) {
        var id = document.getElementById("listaObjetosActuales").selectedIndex;
        if (id == -1) return;
                
        var objeto = this.mapa.objetos[id];
        objeto.mover(objeto.posicionOriginal.x+x,objeto.posicionOriginal.y+y,objeto.posicionOriginal.z+z);

        document.getElementById("X").value = objeto.posicionOriginal.x;
        document.getElementById("Y").value = objeto.posicionOriginal.y;
        document.getElementById("Z").value = objeto.posicionOriginal.z;
    }

    cambiarPosicionObjeto() {
        var id = document.getElementById("listaObjetosActuales").selectedIndex;
        if (id == -1) return;
                
        var x = parseFloat(document.getElementById("X").value);
        var y = parseFloat(document.getElementById("Y").value);
        var z = parseFloat(document.getElementById("Z").value);

        var objeto = this.mapa.objetos[id];
        objeto.mover(x,y,z);

        document.getElementById("X").value = objeto.posicionOriginal.x;
        document.getElementById("Y").value = objeto.posicionOriginal.y;
        document.getElementById("Z").value = objeto.posicionOriginal.z;
    }

    actualizarListadoMapas() {
        var lista = document.getElementById("listaMapas");
        while(lista.length>0) lista.remove(0);

        var pantallasCookies = Cookies.getStartsWith("cookies:");

        for (var key in pantallasCookies)
            Juego.codigosMapas[key]=pantallasCookies[key];

        var pantallas = new Array();

        for (var key in Juego.codigosMapas) {
            var opt = document.createElement('option');
            opt.appendChild( document.createTextNode(key));
            opt.value = key;
            lista.appendChild(opt); 
        }

        lista.value = this.mapa.nombre;
    }

    guardarMapa() {
        var lista = document.getElementById("listaMapas");
        var nombre = lista.value;

        if (!nombre.startsWith("cookies:")) 
            nombre = "cookies:"+prompt("¿Qué nombre tendrá esta nueva pantalla?");

        Cookies.set(nombre, this.mapa.generarCodigo());
    }

}


export { Editor };
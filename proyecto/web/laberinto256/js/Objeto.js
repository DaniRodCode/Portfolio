
import { Graficos } from "./Graficos.js"
import { Juego } from "./Juego.js "



class Objeto {
  constructor (mapa, posicion, nombre){
    //console.log("nuevo Objeto:"+nombre+","+posicion.x+","+posicion.y+","+posicion.z);
    this.info = Objeto.tipos[nombre];
    this.mapa = mapa;
    this.posicion  = posicion;
    this.posicionOriginal = Object.assign({},posicion);
    this.nombre = nombre;
    var tamano = this.info.tamano || [1,1,1];
    this.largo = tamano[0];
    this.alto = tamano[1];
    this.ancho = tamano[2];
    this.obstaculo = (this.info.obstaculo == true);
    this.mesh;
    this.funcionesActualizar = new Array();
    this.parametrosActualizar = new Array();
    if (this.info.efectos === undefined) this.info.efectos = new Array();
  }

  crear3D() {
      this.mesh = Graficos.crearAspectos(this, this.info.aspectos);
      this.mesh.position.set(this.posicion.x, this.posicion.y, this.posicion.z);

      return this.mesh;
  }

  efecto() {
    for (var efecto of this.info.efectos)
        Juego.efecto(efecto[0], efecto.slice(1)); 
  }

  nuevoActualizar(funcion, parametros) {
    this.funcionesActualizar.push(funcion);
    this.parametrosActualizar.push(parametros);
  }
  
  actualizar(delta) {
    for (var i=0;i<this.funcionesActualizar.length;i++)
        this.funcionesActualizar[i](this,this.parametrosActualizar[i],delta);
  }

  mover(x,y,z) {
    this.posicionOriginal.x = x;
    this.posicionOriginal.y = y;
    this.posicionOriginal.z = z;
    this.mesh.position.set(x, y, z);
  }

}


Objeto.tipos = {
  DUMMY:{tipo:0,tamano:[5,5,5],aspectos:[["Sprite",6]]},
  GB:{tipo:0,tamano:[5,5,5],efectos:[["cambiarPantalla"]],aspectos:[["Sprite",5],["Animacion","rotacion",true]]},
  VALLA:{tipo:0,obstaculo:true,tamano:[10,10,0],efectos:[["cambiarVida",-1]],aspectos:[["Cubo","56"],["Animacion","oscilacion",5,false]]},
  CUBO:{tipo:0,obstaculo:true,tamano:[5,1,5],aspectos:[["Cubo","0xff0000"]]}
}



export { Objeto };
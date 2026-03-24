
import * as THREE from "./lib/three.module.js";
import { Juego } from "./Juego.js";
import { Celda } from "./Celda.js";
import { Water } from './lib/Water.js';
import { Sky } from './lib/Sky.js';


var Recursos = {
  mapaSprites: "./resources/tileset.png",
  filas: 16,
  columnas:16,
  ancho:32,
  texturaAgua: "./resources/waternormals.jpg"
}


class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }

    return resource;
  }
  untrack(resource) {
    this.resources.delete(resource);
  }
  dispose() {
    for (const resource of this.resources) {
      if (resource instanceof THREE.Object3D) {
        if (resource.parent) {
          resource.parent.remove(resource);
        }
      }
      if (resource.dispose) {
        resource.dispose();
      }
    }
    this.resources.clear();
  }
}





class Graficos { 
  constructor() {}

  static cargarTexturas(){
    var loaded = false;

    Graficos.texturaAgua = Graficos.track(new THREE.TextureLoader().load(Recursos.texturaAgua));
    Graficos.texturaAgua.wrapS = THREE.RepeatWrapping;
    Graficos.texturaAgua.wrapT = THREE.RepeatWrapping;

    var filas = Recursos.filas;
    var columnas = Recursos.columnas;
    var ancho = Recursos.ancho;
    Graficos.mapaSprites = Graficos.track(new THREE.TextureLoader().load(Recursos.mapaSprites));
    Graficos.mapaSprites.magFilter = THREE.NearestFilter;
    Graficos.mapaSprites.minFilter = THREE.LinearFilter;
    Graficos.mapaSprites.filas = filas;
    Graficos.mapaSprites.columnas = columnas;
    Graficos.mapaSprites.velocidad = .1;

    var image = Graficos.track(new Image());
    Graficos.tiles = new Array();

    for (var i=0;i<filas;i++) {
      for (var j=0;j<columnas;j++) {            
          var numero = i*columnas+j;
          Graficos.tiles[numero] = Graficos.track(new THREE.Texture());
      }
    }


    image.onload = function() {
      for (var i=0;i<filas;i++) {
          for (var j=0;j<columnas;j++) {            
              var canvas = document.createElement('canvas');
              var context = canvas.getContext('2d');
              context.canvas.width = ancho;
              context.canvas.height = ancho;
              
              var numero = i*columnas+j;
              context.drawImage(image, j*ancho, i*ancho,ancho,ancho,0,0,ancho,ancho);
              var texture = Graficos.track(new THREE.Texture(canvas));
              texture.needsUpdate = true;
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              texture.magFilter = THREE.NearestFilter;
              texture.minFilter = THREE.LinearFilter;
          
              Graficos.tiles[numero] = texture;              
            }
      }
      
      Graficos.ready = true;
    };

  image.src = Recursos.mapaSprites;
  }

  static crearCamara() {
    var width = window.innerWidth - 20;
    var height = window.innerHeight - 20;
    Graficos.camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
  }

  static modificarCamara(posx, posy, posz, lookx, looky, lookz) {
    Graficos.camera.position.set(posx,posy,posz);
    Graficos.camera.lookAt(new THREE.Vector3(lookx, looky, lookz));
  }


  static crearEscena(data) {
    Graficos.scene = new THREE.Scene();

    var sun = new THREE.Vector3();

    var sky = new Sky();
    sky.scale.setScalar( 10000 );
    Graficos.scene.add( sky );
    Graficos.track(sky.geometry);
    Graficos.track(sky.material);

    var uniforms = sky.material.uniforms;

    uniforms[ 'turbidity' ].value = 10;
    uniforms[ 'rayleigh' ].value = 2;
    uniforms[ 'mieCoefficient' ].value = 0.005;
    uniforms[ 'mieDirectionalG' ].value = 0.8;

    var parameters = {
      inclination: 0.1,
      azimuth: 0.02
    };

    var theta = Math.PI * ( parameters.inclination - 0.5 );
    var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );

    sun.x = Math.cos( phi );
    sun.y = Math.sin( phi ) * Math.sin( theta );
    sun.z = Math.sin( phi ) * Math.cos( theta );

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    Graficos.scene.environment = sky.texture;
  }


  static crearRenderer() {
    var width = window.innerWidth - 20;
    var height = window.innerHeight - 20;

    Graficos.renderer = new THREE.WebGLRenderer({ antialias: false });
    Graficos.renderer.setPixelRatio(window.devicePixelRatio);
    Graficos.renderer.setSize(width, height);
    Graficos.renderer.domElement.id = "juego";
    document.body.appendChild(Graficos.renderer.domElement);
  }


  static init() {
    if (Graficos.renderer == null) {      
      Graficos.resourceTracker = new ResourceTracker();
      Graficos.crearRenderer();
      Graficos.cargarTexturas();

      Graficos.crearCamara();

      window.addEventListener('resize', Graficos.onWindowResize, false);
    }
  }


  static onWindowResize() {
    var width = window.innerWidth - 20;
    var height = window.innerHeight - 20;
    Graficos.camera.aspect = width / height;
    Graficos.camera.updateProjectionMatrix();
    Graficos.renderer.setSize(width, height);
  }


  static render() {
    Graficos.renderer.render(Graficos.scene, Graficos.camera);
  }




  static crearAspectos(objeto, aspectos) {
    var group = new THREE.Group();
    //group.add(Graficos.crearEjeY());
    //group.add(Graficos.crearEjeX());
    //group.add(Graficos.crearEjeZ());

    for (var aspecto of aspectos) {
      var funcion = "crearAspecto_"+aspecto[0];
      var parametros = aspecto.slice(1);
      var mesh = this[funcion](objeto,parametros);

      if (mesh != undefined)
          group.add(mesh);
    }

    group.currentTime = 0;
    return group;
  }

  static crearAspecto_Sprite(objeto, aspecto) {
    return this.crearSprite(aspecto[0], objeto.alto);
  }



  static crearAspecto_Cubo(objeto, aspecto) { 
    var largo = objeto.largo;
    var ancho = objeto.ancho;
    var alto = objeto.alto;
    var material = this.crearAspecto_Material(aspecto[0]);

    var g = Graficos.track(new THREE.BoxBufferGeometry(ancho, alto, largo));
    var obj = Graficos.track(new THREE.Mesh(g, material));
    obj.position.y = alto/2;
    return obj;
  }


  static crearAspecto_Material(material) {
    if (material == undefined)
       material = "0xff0000";
    
    if (material.startsWith("0x")) {
      var valor = Number(material);
      var m = Graficos.track(new THREE.MeshBasicMaterial({ color: valor}));
    }
    else {
      var tile = parseInt(material);
      var texture = Graficos.tiles[tile];
      var m = Graficos.track(new THREE.MeshBasicMaterial({map: texture, transparent:true}));  
    }
    
    return m;
  }

  static crearAspecto_Animacion(objeto, aspecto) {
    var funcion = "animacion_"+aspecto[0];
    objeto.nuevoActualizar(Graficos[funcion], aspecto.slice(1));
  }


  static animacion_oscilacion(objeto, parametros, delta){
    var amplitud = (parametros.length < 1)?5:parametros[0];
    var oldSchool = (parametros.length < 2)?false:parametros[1];
    
    var t = objeto.mesh.currentTime += delta;

    if (oldSchool)
      var y = Math.round(amplitud*Math.sin(t));
    else 
     var y = amplitud*Math.sin(t);

    objeto.posicion.y = objeto.posicionOriginal.y + y;
    objeto.mesh.position.y = objeto.posicion.y; 
  }



  static animacion_rotacion(objeto, parametros, delta) {
    var oldSchool = (parametros.length < 1)?false:parametros[0];
    var mesh = objeto.mesh;

    var t = mesh.currentTime += delta;
    var s = mesh.scale;
    var pos = mesh.position.clone();

    if (oldSchool)
      var ancho = Math.round(Math.sin(t)*5)/5;
    else 
      var ancho = Math.sin(t);    
    
    objeto.mesh.scale.set(ancho,1,1);
  }


  static cambiarPosicion(objeto, x, y ,z){
    objeto.position.x = x;
    objeto.position.y = y;
    objeto.position.z = z;
  }


  static crearMallaJugador(ancho,alto,largo, tamanoSprite) {
    var group = new THREE.Group();

    if (Juego.configuracion.verDireccion) {
      var g = Graficos.track(new THREE.BoxBufferGeometry(0.1, 4, 0.1));
      g.translate(0, 2, 0);
      g.rotateZ(-Math.PI / 2);
      var m = Graficos.track(new THREE.MeshBasicMaterial({ color: 0xffffff }));
      var obj = Graficos.track(new THREE.Mesh(g, m));
      group.add(obj);
    }

    if (Juego.configuracion.verCuadrado) {
      var g = Graficos.track(new THREE.BoxBufferGeometry(ancho, alto, largo));
      g.translate(0, alto / 2, 0);
      var m = Graficos.track(new THREE.MeshBasicMaterial({ color: 0xff00ff }));
      var obj = Graficos.track(new THREE.Mesh(g, m));
      group.add(obj);
    }

    if (Juego.configuracion.verMalla) {
      var g = new THREE.BoxBufferGeometry(ancho, alto, largo);
      var wireframe = new THREE.WireframeGeometry(g);
      var line = new THREE.LineSegments(wireframe);
      line.material.depthTest = true;
      line.material.opacity = 1;
      line.material.transparent = true;
      line.translateY(alto / 2);
      group.add(line);
    }

    if (Juego.configuracion.verMuneco) {
      var spriteMap = Graficos.mapaSprites;
      var spriteMaterial = Graficos.track(new THREE.SpriteMaterial({ map: spriteMap}));
      var sprite = Graficos.track(new THREE.Sprite(spriteMaterial));
      sprite.scale.set(tamanoSprite, tamanoSprite, tamanoSprite);
      sprite.translateY(tamanoSprite / 2);
      sprite.renderOrder = 0;
      group.add(sprite);
    }


    // creamos el marcador
    var g = Graficos.track(new THREE.PlaneBufferGeometry(tamanoSprite, tamanoSprite/25));
    g.rotateY(-Math.PI / 2);
    var m = Graficos.track(new THREE.MeshBasicMaterial({ color: 0xff0000 , transparent:true, opacity:1.0}));
    var obj = Graficos.track(new THREE.Mesh(g, m));
    obj.position.y = tamanoSprite+tamanoSprite/5;
    group.add(obj);

    group.marcador = obj;


    return group;
  }



  static crearCelda(celda) {
    var apariencia = Celda.apariencias[celda.apariencia];
    var h = celda.vertices;
    var hmedia = (h[0]+h[2])/2;
    var group = new THREE.Group();
    var w=Graficos.tamCelda;
    var tipo = apariencia[0];
    var tileFloor = apariencia[1];
    var tileSideTop = apariencia[2];    
    var tileSide = (apariencia.length>3)?apariencia[3]:tileSideTop;
    var tileSideBottom = (apariencia.length>4)?apariencia[4]:tileSideTop;

    /*
    if (Juego.configuracion.verCentro) {
      var g = Graficos.track(new THREE.BoxBufferGeometry(0.1, 4, 0.1));
      g.translate(0, h[0] + 2, 0);
      var m = new THREE.MeshBasicMaterial({ color: 0xffffff });
      var obj = Graficos.track(new THREE.Mesh(g, m));
      group.add(obj);
    }
    */

   
   /* var etiqueta = Graficos.crearTexto(celda.altura+celda.apariencia, w/2, hmedia, w/2);
    etiqueta.visible = false;
    group.add(etiqueta);
    group.etiqueta = etiqueta;
    */

    var geometry = Graficos.track(new THREE.BufferGeometry());

    var vertices = new Float32Array( [
      0, h[0], 0,      0,h[1],w,     w,h[2],w,
      0, h[0], 0,      w,h[2],w,     w,h[3],0,
    ] );
    var uvs = new Float32Array( [
      0, 0,   1,0,    1,1,
      0, 0,   1,1,    0,1,
    ] );
    var normals = new Float32Array( [
      0, 1, 0,      0,1,0,     0,1,0,
      0, 1, 0,      0,1,0,     0,1,0,
    ] );


    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('normal',   new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    var texture = Graficos.tiles[tileFloor];
    var material = Graficos.track(new THREE.MeshBasicMaterial({map: texture}));

    var obj = Graficos.track(new THREE.Mesh(geometry, material));
    group.add(obj);

    
    var hTiles = Math.ceil(h[0]/w);
    for (var i=0;i<hTiles;i++) {
        var hbase = h[0]-i*w;
        if (i==0) group.add(Graficos.crearParedesCelda(h,tileSideTop));
        else if (i==hTiles-1)
            group.add(Graficos.crearParedesCelda([hbase,hbase,hbase,hbase],tileSideBottom));
        else
            group.add(Graficos.crearParedesCelda([hbase,hbase,hbase,hbase],tileSide));
    }
    

    // creamos los efectos segun el tipo
    if (tipo == 1) {
       for (var i=0;i<10;i++) {
          var x=Math.random()*w;
          var z=Math.random()*w;
          var y=celda.calcularY(x/w,z/w);
          var color=Math.random()>.5?0x000000:0xffffff;
          group.add(Graficos.crearLinea(x,y,z, Math.random()*5,color));         
       }
    }


    return group;
  }

  static crearLinea(x,y,z,largo,color){
    var pixel = Graficos.tamCelda/32;
    var g = Graficos.track(new THREE.BoxBufferGeometry(pixel, largo*pixel, pixel));
    var m = Graficos.track(new THREE.MeshBasicMaterial({ color: color }));
    var obj = Graficos.track(new THREE.Mesh(g, m));
    obj.position.x = x;
    obj.position.y = y+largo*pixel/2;
    obj.position.z = z;
    return obj;   
  }


  static crearParedesCelda(h,tile){
    var w = Graficos.tamCelda;
    var hbase = h[0]-w;

   var geometry = Graficos.track(new THREE.BufferGeometry());

   var vertices = new Float32Array( [
      0, h[0], 0,      0,hbase,0,     0,hbase,w,
      0, h[0], 0,      0,hbase,w,     0,h[1],w,

      0, h[1], w,      0,hbase,w,     w,hbase,w,
      0, h[1], w,      w,hbase,w,     w,h[2],w,

      w, h[2], w,      w,hbase,w,     w,hbase,0,
      w, h[2], w,      w,hbase,0,     w,h[3],0,

      w, h[3], 0,      w,hbase,0,     0,hbase,0,
      w, h[3], 0,      0,hbase,0,     0,h[0],0,     
    ] );
   var uvs = new Float32Array( [
     0, 0,   0,-1,    -1,-1,
     0, 0,   -1,-1,    -1,0,

     0, 0,   0,-1,    -1,-1,
     0, 0,   -1,-1,    -1,0,

     0, 0,   0,-1,    -1,-1,
     0, 0,   -1,-1,    -1,0,

     0, 0,   0,-1,    -1,-1,
     0, 0,   -1,-1,    -1,0,
    ] );
   var normals = new Float32Array( [
     0, 1, 0,      0,1,0,     0,1,0,
     0, 1, 0,      0,1,0,     0,1,0,

     0, 1, 0,      0,1,0,     0,1,0,
     0, 1, 0,      0,1,0,     0,1,0,

     0, 1, 0,      0,1,0,     0,1,0,
     0, 1, 0,      0,1,0,     0,1,0,

     0, 1, 0,      0,1,0,     0,1,0,
     0, 1, 0,      0,1,0,     0,1,0,
    ] );

   geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
   geometry.setAttribute('normal',   new THREE.BufferAttribute(normals, 3));
   geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

   var texture = Graficos.tiles[tile];
   var material = Graficos.track(new THREE.MeshBasicMaterial({map: texture}));
   var obj = Graficos.track(new THREE.Mesh(geometry, material));
   return obj;   
  }




  static crearEjeY() {
    var g = Graficos.track(new THREE.BoxBufferGeometry(0.1, 30, 0.1));
    g.translate(0, 15, 0);
    var m = Graficos.track(new THREE.MeshBasicMaterial({ color: 0xffffff }));
    var obj = Graficos.track(new THREE.Mesh(g, m));
    return obj;   
  }

  static crearEjeX() {
    var g = Graficos.track(new THREE.BoxBufferGeometry(30, 0.1, 0.1));
    g.translate(15, 0, 0);
    var m = Graficos.track(new THREE.MeshBasicMaterial({ color: 0xffffff }));
    var obj = Graficos.track(new THREE.Mesh(g, m));
    return obj;   
  }

  static crearEjeZ() {
    var g = Graficos.track(new THREE.BoxBufferGeometry(0.1, 0.1, 30));
    g.translate(0, 0, 15);
    var m = Graficos.track(new THREE.MeshBasicMaterial({ color: 0xffffff }));
    var obj = Graficos.track(new THREE.Mesh(g, m));
    return obj;   
  }


  static crearSprite(idTile, escala) {
    var spriteMap = Graficos.tiles[idTile];

    var spriteMaterial = Graficos.track(new THREE.SpriteMaterial({ map: spriteMap }));
    var sprite = Graficos.track(new THREE.Sprite(spriteMaterial));
    sprite.scale.set(escala,escala,escala);
    sprite.position.y = escala/2;

    return sprite;
  }


  

static crearTexto(texto, x,y,z) { 	
  var fontface = 'Helvetica';
  var fontsize =  120;
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = fontsize + "px " + fontface;

  // get size data (height depends only on font size)
  var metrics = context.measureText(texto);
  var textWidth = metrics.width;

  // text color
  context.fillStyle = 'rgba(0, 0, 0, 1.0)';
  context.fillText(texto, 0, fontsize);

  // canvas contents will be used for a texture
  var texture = Graficos.track(new THREE.Texture(canvas))
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  var spriteMaterial = Graficos.track(new THREE.SpriteMaterial({ map: texture }));
  var sprite = Graficos.track(new THREE.Sprite( spriteMaterial ));
  sprite.scale.set( 4, 2, 1.0 );
  sprite.center.set( 0.1,0 );
  sprite.position.y = y+1;
  sprite.position.x = x;
  sprite.position.z = z;
  return sprite;	
  }




static crearAgua(ancho,largo) {
  var waterGeometry = Graficos.track(new THREE.PlaneBufferGeometry( 10000, 10000 ));

  var water = Graficos.track(new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: Graficos.texturaAgua,
      alpha: 0.0,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 2,
      fog: Graficos.scene.fog !== undefined
    }
  ));
  water.material.uniforms[ 'size' ].value = 1.0;

  water.position.y = 0;
  water.rotation.x = - Math.PI / 2;
  Graficos.track(water.material);
  return water;
}



  static crearPunto(x,y,z) {         
    var g = new THREE.Geometry();
    g.vertices.push(new THREE.Vector3( x, y, z));
    var m = new THREE.PointsMaterial({ size: 3, sizeAttenuation: false } );
    var obj = new THREE.Points( g, m );

    return obj;    
  }


  static crearCursor() {
    var group = new THREE.Group();
    var w=Graficos.tamCelda;
    var h = [0,0,0,0];

    var geometry = Graficos.track(new THREE.BufferGeometry());

    var vertices = new Float32Array( [
      0, h[0], 0,      0,h[1],w,     w,h[2],w,
      0, h[0], 0,      w,h[2],w,     w,h[3],0,
    ] );    

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    var material = Graficos.track(new THREE.LineBasicMaterial( {color: 0xffffff} ));

    var wireframe = Graficos.track(new THREE.WireframeGeometry(geometry));
    var line = new THREE.LineSegments(wireframe,material);
    line.material.depthTest = false;
    group.add(line);

    material = Graficos.track(new THREE.MeshBasicMaterial({color: 0xdddddd}));
    var obj = Graficos.track(new THREE.Mesh(geometry, material));
    group.add(obj);
    
    return group;
  }


  static track(obj){return Graficos.resourceTracker.track(obj);}
  static dispose() {Graficos.resourceTracker.dispose();}
}

Graficos.tamCelda = 10;
Graficos.camera = null;
Graficos.scene = null;
Graficos.renderer = null;
Graficos.mapaSprites = null;
Graficos.tiles = null;
Graficos.resourceTracker = null;
Graficos.ready = false;
Graficos.texturaAgua = null;

export {Graficos};

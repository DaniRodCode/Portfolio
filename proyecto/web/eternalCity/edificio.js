

			
			function crearMapaCiudad(tamano) {
				var mapa = new Array();
				for (var i=0; i<tamano; i++) {
					var fila = new Array();
					for (var j=0; j<tamano; j++)
						fila.push(Math.random()*alturaEdificio);
						//fila.push(((i+j)/tamano)*alturaEdificio);
					mapa.push(fila);					
				}

				return mapa;
			}
						
			
						
			function crearCiudad3D() {		
				var texture       = new THREE.Texture( generateTexture() );
				texture.needsUpdate    = true;

				var material =  new THREE.MeshPhongMaterial( { map: texture, color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 } );
				var geometry = new THREE.Geometry();
				
			
				for (var i=0;i<edificiosVisibles;i++)
					for (var j=0; j<edificiosVisibles; j++) {
						var matrix = new THREE.Matrix4();
						
						var altura = mapaCiudad[i][j];
						var edificio = crearGeometriaEdificio(tamEdificio, altura, tamEdificio);
						var posX = i*(tamEdificio + separacionEdificios) + tamEdificio/2;
						var posY = 0;
						var posZ = j*(tamEdificio + separacionEdificios) + tamEdificio/2;				
						
						matrix.makeTranslation(posX, posY, posZ);		
						geometry.merge(new THREE.Geometry().fromBufferGeometry( edificio ), matrix);
					}
					
				var mesh = new THREE.Mesh( geometry, material );
				mesh.position.set(0,0,0);
				scene.add(mesh);
			}

			
			
			function crearEdificio3D(dimX, dimY, dimZ) {		
				var texture       = new THREE.Texture( generateTexture() );
				texture.needsUpdate    = true;
				
				var material = new THREE.MeshPhongMaterial( { map: texture, color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0 } );
				var edificio = crearGeometriaEdificio(dimX, dimY, dimZ);
				var mesh = new THREE.Mesh( edificio, material );
				
				
				var ground_material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
			
				var suelo = new THREE.BoxGeometry(dimX, 0, dimZ);
				suelo.position.set(0,dimY,0);
				
				return mesh;
			}

			
			
			function crearGeometriaEdificio(dimX, dimY, dimZ){			
				var geometry = new THREE.Geometry();

				var baseColor   = new THREE.Color(0xff0000);
				var baseColor2  = new THREE.Color(0x00ff00);
				var baseColor3  = new THREE.Color(0x0000ff);

				
				// techo
				var plano = new THREE.PlaneBufferGeometry( dimX, dimZ );				
				plano.attributes.uv.array[ 1 ] = 0.5;
				plano.attributes.uv.array[ 3 ] = 0.5;
				plano.rotateX( -Math.PI / 2 );
				plano.translate(0,dimY,0);
				geometry.merge(new THREE.Geometry().fromBufferGeometry( plano ));
			
				// lateral
				var plano = new THREE.PlaneBufferGeometry( dimX, dimY );
				plano.attributes.uv.array[ 1 ] = 0.5;
				plano.attributes.uv.array[ 3 ] = 0.5;
				plano.rotateY( Math.PI / 2 );
				plano.translate(dimX/2,dimY/2,0);							
				geometry.merge(new THREE.Geometry().fromBufferGeometry( plano ));

				// frontal
				var plano = new THREE.PlaneBufferGeometry( dimX, dimY );
				plano.attributes.uv.array[ 1 ] = 0.5;
				plano.attributes.uv.array[ 3 ] = 0.5;
				plano.rotateY( Math.PI);
				plano.translate(0,dimY/2,-dimZ/2);							
				geometry.merge(new THREE.Geometry().fromBufferGeometry( plano ));
				
				geometry.rotateY(Math.PI/2)

				return new THREE.BufferGeometry().fromGeometry( geometry );
			
				//return geometry;
			}
			
			


			function crearCiudad3DFisica(x, y) {		
				var material_suelo =  Physijs.createMaterial(
					new THREE.MeshPhongMaterial({opacity:0, transparent: true, color:0xff0000}),
					10, // low friction
					.5 // high restitution
				);

				var material_edificio =  Physijs.createMaterial(
					new THREE.MeshPhongMaterial({ opacity:0, transparent: true, color:0xff00ff}),
					10, // low friction
					.5 // high restitution
				);

				
				var sueloCiudad = new Physijs.PlaneMesh(
					new THREE.PlaneGeometry( tamCiudad, 	tamCiudad),
					material_suelo,
					0
				);
				
				sueloCiudad.rotation.x = -Math.PI/2;
				scene.add(sueloCiudad);

				for (var i=0;i<edificiosVisiblesFisica;i++)
					for (var j=0; j<edificiosVisiblesFisica; j++) {
				
					var altura = mapaCiudad[i][j];

					var edificio = new Physijs.BoxMesh(
						new THREE.CubeGeometry( tamEdificio, altura, tamEdificio),
						material_edificio,
						0
					);								

					var posX = i*(tamEdificio + separacionEdificios) + tamEdificio/2;
					var posY = altura/2;
					var posZ = j*(tamEdificio + separacionEdificios) + tamEdificio/2;
						
					edificio.position.set(posX, posY, posZ);
					scene.add(edificio);
				}				

			}




			
			
			function generateTexture() {
			  // build a small canvas 32x64 and paint it in white
			  var canvas  = document.createElement( 'canvas' );
			  canvas.width = 32;
			  canvas.height = 64;
			  var context = canvas.getContext( '2d' );
			  // plain it in white
			 context.fillStyle    = '#ffffff';
			  context.fillRect( 0, 0, 32, 64 );
			  // draw the window rows - with a small noise to simulate light variations in each room
			  for( var y = 2; y < 64; y += 2 ){
				  for( var x = 0; x < 32; x += 2 ){
					  var value   = Math.floor( Math.random() * 64);
					  //var value = Math.random()>.5?0:128;
					  context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
					  context.fillRect( x, y, 2, 1 );
				  }
			  }

			  // build a bigger canvas and copy the small one in it
			  // This is a trick to upscale the texture without filtering
			  var canvas2 = document.createElement( 'canvas' );
			  canvas2.width    = 512;
			  canvas2.height   = 1024;
			  var context = canvas2.getContext( '2d' );
			  // disable smoothing
			  context.imageSmoothingEnabled        = false;
			  context.webkitImageSmoothingEnabled  = false;
			  context.mozImageSmoothingEnabled = false;
			  // then draw the image
			  context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
			  // return the just built canvas2
			  return canvas2;
			}
			
			
			
			
			


class Vector2d {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.v = false;
        this.vAngular = false;
        this.angulo = false;
        this.anguloObjetivo = false;
        this.objetivo = false;
        this.posicionOriginal = {x,y};
    }    

    actualizar() {
        this.x = this.x + Math.cos(this.angulo)*this.v; 
        this.y = this.y + Math.sin(this.angulo)*this.v;
        
        if (this.objetivo) {
            this.anguloObjetivo = this.calcularAngulo(this.objetivo);
            this.angulo = this.interpolarAngulo();
            if (this.distanciaObjetivo() < 10) 
                this.vAngular = this.vAngular*1.1;
        }
        
        if (this.objetivoAlcanzado())
            this.borrarObjetivo();
    }

    calcularAngulo(punto) {
        return Math.atan2(punto.y - this.y, punto.x - this.x);
    }

    interpolarAngulo(anguloActual, anguloObjetivo, velocidadAngular) {
        let diferencia = this.anguloObjetivo - this.angulo;

        // Normalizar diferencia al rango [-π, π]
        while (diferencia > Math.PI) diferencia -= 2 * Math.PI;
        while (diferencia < -Math.PI) diferencia += 2 * Math.PI;

        // Si la diferencia es pequeña, asignamos directamente el ángulo objetivo
        if (Math.abs(diferencia) < this.vAngular)
            return this.anguloObjetivo;

        // Aplicamos interpolación para girar en la dirección más corta
        return this.angulo + Math.sign(diferencia) * this.vAngular;
    }

    nuevoObjetivo(x, y) {
        this.objetivo = {x,y};
        this.calcularAngulo(this.objetivo);
        this.v = .05;
        this.vAngular = Math.PI/90;
    }

    objetivoAleatorio(radio) {
        this.nuevoObjetivo(
            this.posicionOriginal.x + Math.random() * radio - radio/2,
            this.posicionOriginal.y + Math.random() * radio - radio/2,
        );
    }

    objetivoAlcanzado() {
        if (this.distanciaObjetivo() > 1)
            return false;

        return true;
    }

    tieneObjetivo() { return this.objetivo; } 

    distanciaObjetivo() {
        return Math.sqrt(
            Math.pow(this.objetivo.x - this.x, 2) + Math.pow(this.objetivo.y - this.y, 2)
        );
    }
  
    borrarObjetivo() {
        this.objetivo = this.angulo = this.v = this.vAngular = false;
    }


    dibujar(ctx) {        
        this.dibujarPunto(ctx, this, 5, "blue");
        this.dibujarLinea(ctx, this, this.objetivo, "blue", [2,6]);
        this.dibujarPunto(ctx, this.objetivo, 5, "red");        
        this.dibujarAngulo(ctx, this, this.angulo, this.v*10, "red");      
    }


    dibujarAngulo(ctx, origen, angulo, longitud, color = "black", estilo) {
        const destino = {
            x: origen.x + Math.cos(angulo) * longitud,
            y: origen.y + Math.sin(angulo) * longitud,
        };

        this.dibujarLinea(ctx, origen, destino, color, estilo);
    }


    dibujarLinea(ctx, origen, destino, color = "black", estilo) {
        ctx.save();

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        
        if (estilo)
            ctx.setLineDash(estilo);

        ctx.moveTo(origen.x, origen.y);
        ctx.lineTo(destino.x, destino.y);
        ctx.stroke();
        ctx.closePath();        
        ctx.restore();
    }

    dibujarPunto(ctx, pos, r = 5, color = "black") {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(pos.x, pos.y, r, 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

};




if (!customElements.get('dr-shape')) 
    window.customElements.define("dr-shape", 


    class extends HTMLElement {
		
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
        this.puntos = [];
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<style>	
                :host {
                    width: 100%;
                    height: 100%;
                    display:flex;
                }

                canvas {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    image-rendering: pixelated;                    
                }

			</style>
            
            <canvas></canvas>
            `;
        

        this.canvas = this.shadowRoot.querySelector("canvas");

        // Detectar cambios de tamaño con un ResizeObserver
        this.resizeObserver = new ResizeObserver(() => this.ajustarTamano());
        this.resizeObserver.observe(this.canvas);

        this.ajustarTamano();
        const size = this.canvas.getBoundingClientRect();

        
        this.puntos = [
            new Vector2d(size.width * .1, size.height * .1), 
            new Vector2d(size.width * .9, size.height * .1), 
            new Vector2d(size.width * .9, size.height * .9), 
            new Vector2d(size.width * .1, size.height * .9), 
        ];

        this.cp = [
            new Vector2d(size.width * .5, size.height * .1), 
            new Vector2d(size.width * .9, size.height * .5), 
            new Vector2d(size.width * .5, size.height * .9), 
            new Vector2d(size.width * .1, size.height * .5), 
        ];
        
        this.loop();
	}			



    ajustarTamano() {
        const size = this.canvas.getBoundingClientRect();

        this.canvas.width = size.width;
        this.canvas.height = size.height;
        
        this.context = this.canvas.getContext("2d");
    }


    loop() {
        this.draw();
        requestAnimationFrame(() => {this.loop()});
    }




    draw(){
        this.clear();
        //this.dibujarShape(this.puntos);
        this.dibujarCurvedShape(this.puntos, this.cp);
        this.actualizarPuntos(this.puntos);            
        this.actualizarPuntos(this.cp);            
    }


    dibujarPunto(punto, color = "black") {
        const ctx = this.context;

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(punto.x, punto.y, 5, 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();
    }    
    



    dibujarShape(puntos) {
        let p = [...puntos];
//        p.push(p[0]);

        this.context.beginPath();


        this.context.moveTo(this.puntos[0].x, this.puntos[0].y);
        
        for (let i=1; i<p.length; i++) {
            //this.context.lineTo(this.puntos[i].x, this.puntos[i].y);
            this.dibujarCurva(p[i-1], p[i])            
        }

        this.context.lineTo(this.puntos[0].x, this.puntos[0].y);
        this.context.fill();            
    }


    dibujarCurvedShape(puntos, cp) {
        let p = [...puntos];

        this.context.beginPath();

        this.context.moveTo(this.puntos[0].x, this.puntos[0].y);
        
        for (let i=1; i<puntos.length; i++)
            this.context.quadraticCurveTo(cp[i-1].x, cp[i-1].y, puntos[i].x, puntos[i].y);         

        //this.context.lineTo(this.puntos[0].x, this.puntos[0].y);
        this.context.quadraticCurveTo(cp[cp.length-1].x, cp[cp.length-1].y, puntos[0].x, puntos[0].y);
        this.context.fill();            
    }    

    dibujarCurva(origen, destino) {        
        let dx = (destino.x - origen.x);
        let dy = (destino.y - origen.y);

        let cp = {
            x: origen.x + dx / 2 + 10*this.signo(dx),
            y: origen.y + dy / 2 + 10*this.signo(dy),            
        };

    }

    signo(valor) {
        return valor > 0 ? 1 : -1;
    }

    

    actualizarPuntos(puntos) {
        for (let punto of puntos) {
            if (!punto.tieneObjetivo())
                punto.objetivoAleatorio(50);
            punto.actualizar();
        }
    }


    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    
});




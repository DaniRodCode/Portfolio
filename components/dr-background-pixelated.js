
if (!customElements.get('dr-background-pixelated')) 
    window.customElements.define("dr-background-pixelated", 
    class extends HTMLElement {
		
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });	
        this.escala = 1;
        this.framebuffer = false;
        this.estado = false;
        this.drawFunction = this.getAttribute("draw-function") || "scanline",
        this.backgroundColor = this.getAttribute("background-color") || "black",
        this.screen = {
            width: this.getAttribute("width") || 100,
            height:false
        };


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
        this.loop();
	}			



    ajustarTamano() {
        const size = this.canvas.getBoundingClientRect();

        this.screen.height = Math.floor(this.screen.width / size.width * size.height);

        this.canvas.width = this.screen.width;
        this.canvas.height = this.screen.height;
        
        this.context = this.canvas.getContext("2d");
    }


    loop() {
        this[this.drawFunction]();
        requestAnimationFrame(() => {this.loop()});
    }





    
    randomNoise() {              
        const screen = this.screen;

        for (let i=0; i<screen.width; i++) {
            for (let j=0; j<screen.height; j++) {
                this.setPixel(i,j,this.randomColor());
            }
        }

        for (let i=0; i<screen.width; i++) {
            this.setPixel(i,0,'red');
            this.setPixel(i,screen.height-1,'red');
        }

        for (let i=0; i<screen.height; i++) {
            this.setPixel(0,i,'red');
            this.setPixel(screen.width-1,i,'red');
        }

    }    





    scanline() {
        const screen = this.screen;

        if (!this.estado) {
            const fondo = this.context.createLinearGradient(0, 0, 0, screen.height);
        
            fondo.addColorStop(0,   "#355c7d");
            fondo.addColorStop(0.5, "#6c5b7b");
            fondo.addColorStop(1,   "#c06c84");
    
            this.estado = {
                linea:0,
                color:'#FFF1',
                fondo,
                highlight:false,
            };
        }

        this.estado.linea++;
            
        if (this.estado.linea >= screen.height) {
            this.estado.linea = 0;
        }      

        //this.clear(this.estado.fondo);
        
        if (this.estado.highlight) {
            if (Math.random() < .1)
                this.clear(this.estado.fondo,.5);
            
            this.estado.color = "#aaa1";
            this.estado.linea = this.estado.highlight + Math.random()*6-4;
        }
        else {
            this.clear(this.estado.fondo);

            if (Math.random() < .1)
            this.estado.linea = Math.random() * screen.height;          
        }
    
        this.setLine(this.estado.linea + Math.random()*2-1, this.estado.color);
    }

    highlight(y){
        this.clear(this.estado.fondo);

        const size = this.canvas.getBoundingClientRect();
        this.estado.highlight = y/size.height * this.screen.height;
    }

 






    clear(color, opacity = 1) {
        //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.globalAlpha = opacity;
        this.context.fillStyle = color || this.backgroundColor;        
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.globalAlpha = 1.0;
    }
    
    
    setPixel(x, y, color) {
        this.context.fillStyle = color;        
        this.context.fillRect(Math.round(x), Math.round(y), 1, 1);
    }

    setLine(y, color) {
        this.context.fillStyle = color;        
        this.context.fillRect(0, Math.round(y), this.screen.width, 1);
    }
    
    
    randomColor() {
        return 'rgb('+
                Math.floor(Math.random()*256)+','+
                Math.floor(Math.random()*256)+','+
                Math.floor(Math.random()*256)+')';
    }


    randomGrayColor(min, max) {
        let v = Math.min((min || 0) + Math.floor(Math.random()*256), max || 256);
        return 'rgb('+ v +','+ v +','+ v + ')';
    }    

});




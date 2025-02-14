
if (!customElements.get('dr-background-pixelated')) 
    window.customElements.define("dr-background-pixelated", 
    class extends HTMLElement {
		
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });	
        this.escala = 1;
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

        this.screen.height = this.screen.width / size.width * size.height;

        this.canvas.width = this.screen.width;
        this.canvas.height = this.screen.height;

        //this.context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        
        this.context = this.canvas.getContext("2d");
    }


    loop() {
        this.dibujar();
        requestAnimationFrame(() => {this.loop()});
    }


    
    dibujar() {              
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


    randomColor() {
        return 'rgb('+
                Math.floor(Math.random()*256)+','+
                Math.floor(Math.random()*256)+','+
                Math.floor(Math.random()*256)+')';
    }


    setPixel(x, y, color) {
        this.context.fillStyle = color;        
        this.context.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
        
        


});


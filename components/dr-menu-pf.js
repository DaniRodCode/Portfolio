

if (!customElements.get('dr-menu-pf-opcion')) 
    window.customElements.define("dr-menu-pf-opcion", 
    class extends HTMLElement {
		
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
        this.nombre = false;
	}


	connectedCallback() {       
        const style = document.createElement('style');
        style.textContent = `
            :host {
                width: fit-content;
                height: fit-content;
            }
            
            div {
                color: white;
                white-space: nowrap;
                cursor: pointer;
                padding:5px;
            }

            div{
                position: relative;
                top:0px;
                left:0;
                z-index: 1;
                align-content: center;
                filter: drop-shadow(.1em .1em 3px #000b);
            }

            div:hover {
                z-index: 1;
            }

            div::before{
                content: '';
                padding:5px;
                width:0%;
                height:0%;
                position: absolute;
                top: 0;
                left: 0;
                transition: 0.2s;
                z-index: -1;
                border-radius: 5px;
                color: transparent;
            }

            div:hover::before{
                content: attr(data-text);
                width: 100%;
                height: fit-content;
                filter: blur(0.2em);
                background: #fff2;
            }            
        `;

        this.shadowRoot.append(style);        
	}			

    init(titulo, nombre) {
        const opcion = document.createElement("div")
        opcion.innerHTML = titulo;
        opcion.id = nombre;
        this.setAttribute("id",nombre)
        opcion.setAttribute("data-text",titulo)

        this.shadowRoot.append(opcion);
    }


});








if (!customElements.get('dr-menu-pf')) 
    window.customElements.define("dr-menu-pf", 
    class extends HTMLElement {
		
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
        this.opciones = [];	
        this.font = this.getAttribute("font") || "sans-serif";
	}

	connectedCallback() {
		this.shadowRoot.innerHTML = `
			<style>	

                :host {
                    width: 100%;
                    height: 100%;
                    display:flex;
                }
                
                #contenedor {
                    width: 100%;
                    height: 1em;
                    display:flex;
                    flex-direction: column;
                }

                dr-menu-pf-opcion {
                    font-family: ${this.font};
                    font-size: .7em;
                }
                

			</style>
            
            <div id="contenedor"></div>
            `;
        
        this.contenedor = this.shadowRoot.querySelector("#contenedor");
        this.contenedor.addEventListener("click",(e) => {
            this.dispatchEvent(new CustomEvent("opcionSeleccionada", {
                detail:e.target.id
            }));
        });
	}			

    crearOpcion(titulo, nombre) {
        const opcion = document.createElement("dr-menu-pf-opcion")
        opcion.init(titulo, nombre);

        this.contenedor.append(opcion);
        this.opciones.push(opcion); 
    }

});






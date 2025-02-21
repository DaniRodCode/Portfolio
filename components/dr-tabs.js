

if (!customElements.get('dr-tabs')) 
    window.customElements.define("dr-tabs", 
    class extends HTMLElement {
		
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}


	connectedCallback() {       
		this.shadowRoot.innerHTML = `
			<style>	
                :host {
                    width: 100%;
                    height: 100%;
                }
        
                #contenedor {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .tab {
                    width: 100%;
                    height: 100%;
                    display:flex; 
                    flex-direction: column;
                    display: none;                                  
                }

                .visible {
                    display: block;
                }

            </style>
            <div id="contenedor">
                ${this.innerHTML}            
            </div>
        `;
        
        this.contenedor = this.shadowRoot.querySelector("#contenedor");        
	}			

    mostrar(id) {
        const tab = this.contenedor.querySelector("#"+id);
        if (!tab) return;

        this.ocultarVisibles();        
        tab.classList.add("visible");
    }

    ocultarVisibles() {
        const visibles = this.contenedor.querySelectorAll(".visible");
        for (let tab of visibles)
            tab.classList.remove("visible");
    }


});








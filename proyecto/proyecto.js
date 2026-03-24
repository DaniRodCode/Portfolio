

const galeria = document.querySelector("#galeria");
const main = document.querySelector("main");
const imagenPrincipal = document.querySelector("#imagenPrincipal");
const visor = document.querySelector("#visor");
const visorImg = document.querySelector("#visorImg");
let nProyectoActual = false;
let proyectos = false;


galeria.addEventListener("click", e => {

  if (e.target.tagName === "IMG") {
    visorImg.src = e.target.src;
    visor.showModal();
  }

});

visor.addEventListener("click", () => visor.close());



async function init() {

  const id = obtenerIdProyecto();

  if (!id) {
    //document.querySelector("body").innerHTML = "";
    console.log("sin id");    
    return;
  }
  
  proyectos = await cargarProyectos();
  const proyecto = buscarProyecto(id);
  
  if (!proyecto) {
    //document.querySelector("body").innerHTML = "";
    console.log("sin proyecto");    
    return;
  }

  mostrarProyecto(proyecto);
}




init();


function obtenerIdProyecto() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}



async function cargarProyectos() {
  try {
    
    const response = await fetch(`./proyectos.json`);
    const data = await response.json();

    return data.proyectos;

  } catch {

    return false;
  }  

}


function buscarProyecto(id) {
    for (let i=0; i<proyectos.length; i++) {
      if (proyectos[i].id == id) {
          nProyectoActual = i;
          return proyectos[i];
      }
    }
}



async function mostrarProyecto(proyecto) {
  main.classList.add("oculto");

  await Promise.all([
    delay(300) 
  ]);   

  // textos
  const slots = document.querySelectorAll("slot");
  
  for (const slot of slots) {    
    const nombreSlot = slot.attributes[0].name;
    slot.innerHTML = proyecto[nombreSlot];
  }

  // imagenes
  imagenPrincipal.src = `${proyecto.id}/${proyecto.imagenPrincipal}`;
  
  // galeria
  galeria.innerHTML = proyecto.galeria
    .map(img => `<img src="${proyecto.id}/${img}">`)
    .join("");
  
  await Promise.all([
    esperarImagenes(main),
    delay(300)
  ]);  
  
  main.classList.remove("oculto");
}



function siguienteProyecto() {
  nProyectoActual++;

  if (nProyectoActual == proyectos.length)
      nProyectoActual = 0;

  mostrarProyecto(proyectos[nProyectoActual]);
}




function esperarImagenes(container) {

  const imagenes = container.querySelectorAll("img");

  const promesas = [...imagenes].map(img => {

    if (img.complete) return Promise.resolve();

    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });

  });

  return Promise.all(promesas);
}



function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

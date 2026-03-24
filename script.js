  
  const presentacion = document.getElementById("presentacion"); 
  const nombre = document.getElementById("nombre"); 
  const fondo = document.getElementById("fondo");
  const redes = document.getElementById("redes");
  const anosDesde2021 = document.getElementById("anosDesde2021");
  const main = document.getElementsByTagName("main")[0];
  const footer = document.getElementsByTagName("footer")[0];
  
  const rootStyle = getComputedStyle(document.documentElement);

  const c0 = rootStyle.getPropertyValue('--fondoVariable0').trim();
  const c1 = rootStyle.getPropertyValue('--fondoVariable1').trim();
  
  
  presentacion.style.backgroundColor = "#000";
  
  const TOTAL = 50;
  let count = 0;


  // MAIN
  requestAnimationFrame(() => {
    nombre.style.opacity = 1;
    nombre.style.scale = 1;

    anosDesde2021.innerHTML = new Date().getFullYear() - 2021;
  });

  setTimeout(crearMancha, 200);
  setTimeout(moverTexto, 100); 


  function crearMancha() {
    const m = document.createElement("div");
    m.className = "mancha";

    m.style.left = Math.random() * 100 + "%";
    m.style.top  = Math.random() * 100 + "%";
    m.style.transform = `
      translate(-15%, -15%)
      rotate(${Math.random() * 360}deg)      
    `;      

    fondo.appendChild(m);

    requestAnimationFrame(() => {
      m.style.opacity = 1;
      m.style.scale = 1 + Math.random() * 3;
    });

    if (count++ < TOTAL) 
      setTimeout(crearMancha, Math.random() * 100);
  }




  function moverTexto() {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;

    fondo.style.transform = `translate(${x}px, ${y}px)`;    

    if (count < TOTAL) 
      setTimeout(moverTexto, 100 + Math.random() * count * 5);
    else {
      mostrarLogoFinal();
      setTimeout(mostrarRedes, 500);
    }
  }



  function mostrarLogoFinal() {
    fondo.style.background = "white";
  }


  function mostrarRedes() {
    requestAnimationFrame(() => {
      redes.classList.remove('oculto');
    });
  }




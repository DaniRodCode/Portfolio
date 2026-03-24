
import { loadScript } from "./Utils.js";


class Sonido {
    constructor() {}

    static init() {
        Sonido.pendienteCargar = 4;
        loadScript('js/lib/scriptprocessor_player.min.js',Sonido.cargaFinalizada);
        loadScript('js/lib/ym_tracer.js',Sonido.cargaFinalizada);
        loadScript('js/lib/backend_ym.js',Sonido.cargaFinalizada);
        loadScript('js/lib/jsfx.js',Sonido.cargaFinalizada);
    }

    static cargaFinalizada() {
        Sonido.pendienteCargar--;
        if ( Sonido.pendienteCargar == 0 ) {
            Musica.init();
            Efectos.init();
            Sonido.ready = true;
        }
    }
}


class Efectos { 
    constructor() {}

    static init() {
        Efectos.library["coin"] = jsfx.Preset.Coin;
        Efectos.library["powerup"] = jsfx.Preset.Powerup;
        Efectos.library["hit"] = jsfx.Preset.Hit;
        Efectos.library["lucky"] = jsfx.Preset.Lucky;
        
        var sonidos = jsfx.Sounds(Efectos.library);

        for(var key in sonidos)
            if (sonidos.hasOwnProperty(key))
                Efectos[key] = sonidos[key];
    }


    static arrayToParams(pararr) {
        var p = jsfx.EmptyParams();
        
        var params = {};
        var len = p.length;
        for(var i = 0; i < len; i++){
            params[p[i].id] = pararr[i];
        }
        return params;
    }    

}


class Musica {
    constructor() {}
    static init() {
        Musica.ymTracer = new YmTracer(8192);		
        ScriptNodePlayer.createInstance(new YMBackendAdapter(), '', [], true, function(){},
                                            Musica.doOnTrackReadyToPlay, Musica.doOnTrackEnd, function(){}, Musica.ymTracer);
    }

    static comenzar() {
        var cancion =  Musica.canciones["Inicial"];
        Musica.reproducirCancion(cancion.url);
        Musica.cancionActual = cancion;
    }

    static comenzado() {
        Musica.volumen(.5);
        Musica.velocidad(.5);
    }

    static parar()                  { ScriptNodePlayer.getInstance().pause(); }
    static continuar()              { ScriptNodePlayer.getInstance().resume(); }
    static volumen(valor) 	        { ScriptNodePlayer.getInstance().setVolume(valor); }
    static doOnTrackReadyToPlay()   { ScriptNodePlayer.getInstance().play(); }
    static doOnTrackEnd()           { ScriptNodePlayer.getInstance().play(); }
    
    static reproducirCancion(cancion) {
        var p = ScriptNodePlayer.getInstance();
        if (p.isReady()) {
            p.loadMusicFromURL(cancion, new Object(), 
            (function(filename){Musica.comenzado(filename);}), 
            (function(){}.bind(this)), 
            (function(total, loaded){}));
        }
    }

    static velocidad(valor) { 
        var v = Musica.cancionActual.velocidad;
        var vfinal = v.minima + (v.maxima - v.minima)*valor;
        var p = ScriptNodePlayer.getInstance();       
        var s = Math.round(p.getDefaultSampleRate()*vfinal);
        p.resetSampleRate(s);        
    }

}

Sonido.pendienteCargar = false;
Sonido.ready = false;
Sonido.musica = Musica;
Sonido.efectos = Efectos;

Musica.cancionActual = null;
Musica.ymTracer = null;
Musica.canciones = {
                    Inicial:{url:"./resources/cancion2.ym",velocidad:{maxima:1.2,minima:1}},
                    Machacona:{url:"./resources/Scout.ym",velocidad:{maxima:1.2,minima:.8}}
                   };

Efectos.library = {
                   "herir":{"Frequency":{"Start":966.7343630617312,"Slide":-0.670332209568628},"Generator":{"Func":"noise","A":0.3780345808579808,"ASlide":-0.11412212869755001},"Filter":{"HP":0.06611220367682692},"Volume":{"Sustain":0.08863489436330033,"Decay":0.11521096496023082}},
                    "select": {"Volume":{"Sustain":0.1,"Decay":0.15,"Punch":0.55}},
                    "long": {"Volume":{"Sustain":0.1,"Decay":0.5,"Punch":1}}
                  };


export {Sonido};
export {Musica};
export {Efectos};


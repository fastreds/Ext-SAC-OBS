//Generalidaes de la Extension
//window.testVariable = true


generaArrayGlobal();

///////////////////////////////////////// constante global para gestionar botones y datos extraidos ////////////

function generaArrayGlobal(){
     // Guardar los datos en chrome.storage
   // Inicializar AAE_EXT_SAC en chrome.storage.local si no existe
   chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    if (!result.AAE_EXT_SAC) {
      // Definir estructura predeterminada para AAE_EXT_SAC
      const estructuraPredeterminada = {
        app: { activo: true },
        agenda: { activo: false, sonidoRefrescaAgenda: false },
        BuscarAusentes: { activo: false, sonidoBsucaAusentes: false },
        medicamentos: { activo: true },
        ExtracDatos: { activo: true, infoCliente:false },
        Valoraciones: {activo: false},
        sonidoAlerta: {activo: false},
        GestionIncidentes: {infoIncidente: false }
      };
      
      // Guardar la estructura predeterminada en chrome.storage.local
      chrome.storage.local.set({ AAE_EXT_SAC: estructuraPredeterminada }, () => {
        console.log("AAE_EXT_SAC inicializado:", estructuraPredeterminada);
      });
    } else {
      console.log("AAE_EXT_SAC existe:", result.AAE_EXT_SAC);
    }
  });
}


  //Recibe el mensaje del popup y ejecuta cuando se presiona btn agenda
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.action === "popupCicloDeAgenda") {
        popupCicloDeAgenda();
    }
 
    //Busca Ausentes
   if (request.action === "BuscaAusentes") {
        GestionBuscaAusentes();
    }
    
    //etiquetas
    if (request.action === "agregarBotonATabla") {
      
       agregarBotonATabla(request.args[0],request.args[1]);
    }


     //extraccion de daos  modulab
    if (request.action === "extractIdentificationData") {
      extractIdentificationData();
    }

    //Genera el array global
    if (request.action === "generaArrayGlobal") {
      generaArrayGlobal();
    }

    //refrescar valoraciones
    if (request.action === "valoracionesAlertRefresh") {
      verificarEstadoServicioEmergencias();   
  
    }
    
        //imprime variable array sonido
        if (request.action === "SonidoAgenda") {
          console.log("Cambia estado del sonido");
        }
    

     //extraccion de datos  al form de incidentes
     if (request.action === "llenarFormularioAtencionMedica") {
      llenarFormularioAtencionMedica();
    }
        

});



//////////////////////////////////// genera un tono de aviso//////////////////////////////////
function sonido() {

  //consulta el estado de preferencia de usuario

  // Obtiene el estado actual y alterna si no se define un estado específico
chrome.storage.local.get("AAE_EXT_SAC", (result) => {
  // Estructura predeterminada si no existe en el almacenamiento
  let estructuraActual = result.AAE_EXT_SAC || { sonidoAlerta: { activo: false} }; 

  if(!estructuraActual.sonidoAlerta.activo) return;
   // create web audio api context
   var audioCtx = new (window.AudioContext || window.webkitAudioContext)()

   // create Oscillator node
   var oscillator = audioCtx.createOscillator()
 
   oscillator.type = "triangle"
   oscillator.frequency.setValueAtTime(240, audioCtx.currentTime) //  hertz
   oscillator.connect(audioCtx.destination)
   oscillator.start()
 
   setTimeout(function () {
     oscillator.stop() // detiene el sonido
   }, 150)
   console.log("Reproduciendo tono...")
  
 });

} /// fin sonido


 //////////////////////////////////// helpers de compatibilidad ////////////////////////////////////

 function parseRgb(colorStr) {
   if (!colorStr) return null;
   const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
   if (m) {
     return { r: parseInt(m[1], 10), g: parseInt(m[2], 10), b: parseInt(m[3], 10) };
   }
   return null;
 }

 function colorDiferencia(p1, p2) {
   if (!p1 || !p2) return Infinity;
   return Math.abs(p1.r - p2.r) + Math.abs(p1.g - p2.g) + Math.abs(p1.b - p2.b);
 }

 // Compara el color de fondo de un elemento con un color rgbTarget.
 // Funciona con rgb(), rgba(), inline styles o clases CSS tanto en el elemento
 // como en sus hijos internos de FullCalendar (.fc-event-main).
 function bgMatches(element, rgbTarget) {
   if (!element) return false;
   const targetParsed = parseRgb(rgbTarget);
   if (!targetParsed) return false;

   const elementsToCheck = [
     element,
     element.querySelector?.('.fc-event-main'),
     element.querySelector?.('.fc-event-main-frame')
   ].filter(Boolean);

   for (const el of elementsToCheck) {
     try {
       // 1. Verificar estilo inline
       if (el.style && el.style.backgroundColor) {
         const parsedInline = parseRgb(el.style.backgroundColor);
         if (parsedInline && colorDiferencia(parsedInline, targetParsed) <= 15) {
           return true;
         }
       }
       // 2. Verificar getComputedStyle
       const computed = getComputedStyle(el).backgroundColor;
       if (computed && computed !== 'transparent' && computed !== 'rgba(0, 0, 0, 0)') {
         const parsedComputed = parseRgb(computed);
         if (parsedComputed && colorDiferencia(parsedComputed, targetParsed) <= 15) {
           return true;
         }
       }
     } catch (e) {
       // ignorar error de elemento desconectado
     }
   }
   return false;
 }

 // Devuelve los eventos del calendario (compatible con FullCalendar v3, v4, v5 y v6 en vistas de día, semana y mes)
 function eventosDelCalendario() {
   return document.querySelectorAll('.fc-timegrid-event, .fc-event, .fc-daygrid-event, [data-event-id]');
 }

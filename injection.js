//Generalidaes de la Extension
//window.testVariable = true


console.clear();
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

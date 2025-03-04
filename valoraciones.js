TiempoRefrescadoEmergencias = 120000;


// Verifica es estado del Servicio
function verificarEstadoServicioEmergencias() {




  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    const AAE_EXT_SAC = result.AAE_EXT_SAC || { Valoraciones: { activo: false } };
    if (AAE_EXT_SAC.Valoraciones.activo) {
      intervaloEmergencias = setInterval(valoracionesAlertRefresh, TiempoRefrescadoEmergencias);
      console.log("Refrescar Emergencias. Iniciado previamente");
      valoracionesAlertRefresh();
    } else {
      if (typeof intervaloEmergencias !== "undefined") {
        clearInterval(intervaloEmergencias);
      }
      console.log("Refrescar intervalo Emergencias desactivado");
    }
    console.log("Refrescar Emergencias  /  Activo?: " + AAE_EXT_SAC.Valoraciones.activo + " cada: " + TiempoRefrescadoEmergencias / 1000 + " Segundos.");
  });
}

verificarEstadoServicioEmergencias(); // ejecuta al cargar el archivo


function valoracionesAlertRefresh()
{      
        

  
     // Buscar la fila que contiene "Sin clasificar" en la primera columna
      let filaSinClasificar = Array.from(document.querySelectorAll('table#sample_3 tbody tr')).find(row => {
       let primeraColumna = row.cells[0].textContent.trim(); // Obtener el texto de la primera celda
      return primeraColumna === 'Sin clasificar'; // Comprobar si es "Sin clasificar"
    });

    if (!filaSinClasificar) return;
  
        var triageModule = !!document.getElementById("triage_cont");
        
        //valida si estamos en la agenda
        if (triageModule) {
               console.log("Refrescando Emergencias...");
                const emergenciaItem = document.querySelector('a[onclick*="interface/main/urgencies/triage.php"]');        //document.querySelector('a[title="refresh"]'); 
                      emergenciaItem.click();
                      
                      setTimeout( verificarPendientesClasificar,6000);
                     
                 
     
        } else console.log("No se encuentra visualiando ventana de emergencias se repetira en "  + TiempoRefrescadoEmergencias/1000 + " Segundos.")
      
    
      
}




function verificarPendientesClasificar() {
    // Buscar la fila que contiene "Sin clasificar" en la primera columna
      let  filaSinClasificar = Array.from(document.querySelectorAll('table#sample_3 tbody tr')).find(row => {
       let primeraColumna = row.cells[0].textContent.trim(); // Obtener el texto de la primera celda
      return primeraColumna === 'Sin clasificar'; // Comprobar si es "Sin clasificar"
    });
  
    // Si se encuentra la fila "Sin clasificar", buscar el valor en la columna "Pendientes"
    if (filaSinClasificar) {
      const pendientes = filaSinClasificar.cells[1].textContent.trim(); // Obtener el valor en la columna de "Pendientes"
     
      
      if (pendientes !== '0') {
        console.log('Hay pendientes sin clasificar:', pendientes);
        setTimeout( sonido,1000);
        return true;
        

      } else {
        console.log('No hay pendientes sin clasificar.');
        return false;
      }
    } else {
      console.log('No se encontró la fila "Sin clasificar".');
      return false;
    }
  }
  



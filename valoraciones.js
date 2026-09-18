var TiempoRefrescadoEmergencias = 120000;
var intervaloEmergencias = null;

// Verifica el estado del Servicio
function verificarEstadoServicioEmergencias() {
  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    const AAE_EXT_SAC = result.AAE_EXT_SAC || { Valoraciones: { activo: false } };
    if (AAE_EXT_SAC.Valoraciones.activo) {
      if (intervaloEmergencias) clearInterval(intervaloEmergencias);
      intervaloEmergencias = setInterval(valoracionesAlertRefresh, TiempoRefrescadoEmergencias);
      console.log("Refrescar Emergencias iniciado previamente");
      valoracionesAlertRefresh();
    } else {
      if (intervaloEmergencias) {
        clearInterval(intervaloEmergencias);
        intervaloEmergencias = null;
      }
      console.log("Refrescar intervalo Emergencias desactivado");
    }
    console.log("Refrescar Emergencias / Activo?: " + AAE_EXT_SAC.Valoraciones.activo + " cada: " + TiempoRefrescadoEmergencias / 1000 + " Segundos.");
  });
}

verificarEstadoServicioEmergencias(); // ejecuta al cargar el archivo

function valoracionesAlertRefresh() {
  // Buscar la fila que contiene "Sin clasificar" en la primera columna
  let filaSinClasificar = Array.from(document.querySelectorAll('table#sample_3 tbody tr')).find(row => {
    let primeraColumna = row.cells[0]?.textContent?.trim() || "";
    return primeraColumna === 'Sin clasificar';
  });

  if (!filaSinClasificar) return;

  var triageModule = !!document.getElementById("triage_cont");
  
  if (triageModule) {
    console.log("Refrescando Emergencias...");
    const emergenciaItem = document.querySelector('a[onclick*="interface/main/urgencies/triage.php"]') ||
                           document.querySelector('a[href*="urgencies/triage.php"]') ||
                           document.querySelector('a[title="refresh"]') ||
                           document.querySelector('#triage_refresh');
    if (emergenciaItem) {
      emergenciaItem.click();
      setTimeout(verificarPendientesClasificar, 6000);
    } else {
      console.warn("No se encontró botón/enlace de refresco de emergencias");
    }
  } else {
    console.log("No se encuentra visualizando ventana de emergencias. Se repetirá en " + TiempoRefrescadoEmergencias / 1000 + " Segundos.");
  }
}

function verificarPendientesClasificar() {
  let filaSinClasificar = Array.from(document.querySelectorAll('table#sample_3 tbody tr')).find(row => {
    let primeraColumna = row.cells[0]?.textContent?.trim() || "";
    return primeraColumna === 'Sin clasificar';
  });

  if (filaSinClasificar && filaSinClasificar.cells[1]) {
    const pendientes = filaSinClasificar.cells[1].textContent.trim();
    
    if (pendientes !== '0') {
      console.log('Hay pendientes sin clasificar:', pendientes);
      setTimeout(sonido, 1000);
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

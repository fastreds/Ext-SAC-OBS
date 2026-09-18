//Refrescar Agenda

let intervaloAgenda = 0;
var tiempo_resfrescar = 120000;


// Llamada cuando el popup es abierto 
chrome.storage.local.get("AAE_EXT_SAC", (result) => {
  const AAE_EXT_SAC = result.AAE_EXT_SAC || { agenda: { activo: false } };
  if (AAE_EXT_SAC.agenda.activo) {
    intervaloAgenda = setInterval(contador, tiempo_resfrescar);
    console.log("Activando Refrescar Agenda. Iniciado");
    contador();
  }
  console.log("Refrescar Agenda  /  Activo?: " + AAE_EXT_SAC.agenda.activo + " cada: " + tiempo_resfrescar/1000 + " Segundos." );
 
});



// Función para iniciar y detener la agenda
function popupCicloDeAgenda() {
  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    const AAE_EXT_SAC = result.AAE_EXT_SAC || { agenda: { activo: false } };

    if (AAE_EXT_SAC.agenda.activo) {
      intervaloAgenda = setInterval(contador, tiempo_resfrescar);
      console.log("Activando Refrescar Agenda");
      contador();
    } else {
      clearInterval(intervaloAgenda);
      console.log("Refrescar Agenda desactivado");
    }
  });
}



 /////////////////////////////// Muestra los paciente pendientes/////////////////////////////////
function ListaPacientesPendientes() {
    console.log("Pacientes pendientes: ")
  
    const citas = BusquedaDeCita()
  
    citas.forEach(infoDePacientes)
  
    function infoDePacientes(value, index, array) {
      const elem = document.getElementById(value)
  
      if (elem) console.log(elem.textContent)
    }
  }

////////////////////////////busca los elementos en la agenda que contiene un paciente listo para atender////////////////////////////////

function BusquedaDeCita() {
    var color = "rgb(228, 123, 254)"; // color morado de estado presente
    var elementos = eventosDelCalendario();
    var i = 0;
    var nuevaCitas = []; // contiene el id de las citas con estado presente. "morado"
  
    for (const dato of elementos) {
      if (bgMatches(dato, color)) {
        nuevaCitas[i] = dato.id;
        i++;
      }
    }
    if (i) sonido();
    console.log("nuevas citas: " + i + ". Id's: " + nuevaCitas);
    return nuevaCitas;
  }
  

//////////////////////////////////////////// funcion general sobre el ciclo de la agenda/////////////////
function contador() {
    var testCalendar = !!document.getElementById("refreshCal");
       
    // Si se encuentra en citas diarias, este refresco general no debe operar
    const enCitasDiarias = typeof esAgendaCitasDiarias === "function"
      ? esAgendaCitasDiarias()
      : Array.from(document.querySelectorAll("h1, h2, h3, h4, .card-title, .page-title, .todo-blue"))
          .some(h => h && h.textContent && h.textContent.toLowerCase().includes("agenda de citas diarias"));

    if (enCitasDiarias) {
      console.log("No se encuentra visualizando una agenda general / Se encuentra en citas diarias");
      return;
    } 

    //valida si estamos en la agenda
    if (testCalendar) {
      //refresca la agenda
      var refrescarAgenda = document.getElementById("refreshCal");
      if (refrescarAgenda) refrescarAgenda.click();

      //busca una cita
      ListaPacientesPendientes();
    } else {
      console.log("No se encuentra visualizando una agenda");
    }
  }
  
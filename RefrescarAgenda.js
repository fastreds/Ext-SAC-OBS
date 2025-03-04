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
  
      console.log(elem.text)
    }
  }

////////////////////////////busca los elementos en la agenda que contiene un paciente listo para atender////////////////////////////////

function BusquedaDeCita() {
    var color = "rgb(228, 123, 254)" // color morado de esrado presente
    var elementos = document.getElementsByClassName("fc-timegrid-event")
    var i = 0
    var nuevaCitas = [] // contiene el id de las citas con estado presente. "morado"
  
    for (dato of elementos) {
      if (dato.style["background-color"] == color) {
        nuevaCitas[i] = dato.id
        i++
      }
    }
    if (i) sonido()
    console.log("nuevas citas: " + i + ". Id's: " + nuevaCitas)
    datosDelaCita = nuevaCitas
    return nuevaCitas
  }
  

//////////////////////////////////////////// funcion general sobre el ciclo de la agenda/////////////////
function contador() {
  

    var testCalendar = !!document.getElementById("refreshCal");
    const agendaTitulo = !!document.querySelector("h3.todo-blue");
       
    // Verificar si el elemento fue encontrado y contiene "Agenda de citas diarias"
    if (agendaTitulo && agendaTitulo.textContent.includes("Agenda de citas diarias")) {
          console.log("No se encuentra visualiando una agenda / Se encuentra en citas diarias /  ");
          return;
      } 
    //valida si estamos en la agenda
    if (testCalendar) {
    
      
      //refresca la agenda
      var refrescarAgenda = document.getElementById("refreshCal")
      refrescarAgenda.click();

      //busca una cita
      ListaPacientesPendientes()
    } else console.log("No se encuentra visualiando una agenda")
  
   
  }
  
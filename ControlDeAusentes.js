// Configuración de colores y tiempo en minutos
var color = "rgb(3, 252, 44)"; // color verde de estado normal
var nMinutes = 5; // cantidad de minutos después de los cuales el elemento parpadeará
var intervalCheck = 120000; // intervalo para buscar nuevos elementos (milisegundos)
var IntervaloBuscaAusentes = 0;

// CSS REQUERIDO
// Control de Ausentes - Agregar estilos CSS para el parpadeo
const style = document.createElement("style");
style.innerHTML = `
@keyframes blink {
    50% {
        background-color: rgb(47, 181, 192); /* Color de alerta (naranja) */
    }
}
.blink {
    animation: blink 1s infinite;
}
`;

document.head.appendChild(style); // Agregar el estilo


// Función para iniciar y detener la agenda
function GestionBuscaAusentes() {
  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    const AAE_EXT_SAC = result.AAE_EXT_SAC || { BuscarAusentes: { activo: false } };

    if (AAE_EXT_SAC.BuscarAusentes.activo) {
      IntervaloBuscaAusentes = setInterval(BuscaAusentes, intervalCheck);
      console.log(
        "Buscar Ausente iniciado, solo funciona en la vista de citas diarias"
      );
      BuscaAusentes();
    } else {
      clearInterval(IntervaloBuscaAusentes);
      console.log("Buscar Ausente desactivado");
    }
  });
}

GestionBuscaAusentes(); /// inicia al cargar el archivo 


// Esperar cierta cantidad de tiempo (en milisegundos) antes de continuar
function esperar(ms, callback) {
  setTimeout(callback, ms);
}

// Activa o desactiva la búsqueda de ausentes según el estado
function ActivaBuscaAusentes() {
  chrome.storage.local.get("AAE_EXT_SAC", (result) => {
    const estadoServicioBuscaAusentes = result.AAE_EXT_SAC || {
      BuscarAusentes: { activo: false },
    }; // estructura predeterminada si no existe

    // Si el servicio está activo, se activa el intervalo
    if (estadoServicioBuscaAusentes.BuscarAusentes.activo) {
      IntervaloBuscaAusentes = setInterval(BuscaAusentes, intervalCheck);
      BuscaAusentes(); // Llamar la función de búsqueda inmediatamente
      console.log(
        "1 btn Activando busca Ausentes / es Activo? " +
          estadoServicioBuscaAusentes.BuscarAusentes.activo
      );
    } else {
      clearInterval(IntervaloBuscaAusentes); // Desactiva el intervalo
      console.log(
        "1 btn  Buscar Ausentes desactivado / es Activo? " +
          estadoServicioBuscaAusentes.BuscarAusentes.activo
      );
    }
  });
}

// Busca los eventos ausentes según la agenda y los eventos en pantalla
function BuscaAusentes() {
  var testCalendar = !!document.getElementById("refreshCal");

  //valida si estamos en la agenda
  if (testCalendar) {
    //refresca la agenda
    var refrescarAgenda = document.getElementById("refreshCal");
    refrescarAgenda.click();
  } else {
    console.log("No se encuentra visualiando una agenda");
    return;
  }

  esperar(3000, () => {
    // esperamos a que refrescar la agenda

    const agendaTitulo = document.querySelector("h3.todo-blue");

    // Verificar si el elemento fue encontrado y contiene "Agenda de citas diarias"
    if (
      agendaTitulo &&
      agendaTitulo.textContent.includes("Agenda de citas diarias")
    ) {
      console.log("La etiqueta 'Agenda de citas diarias' ha sido encontrada.");
    } else {
      console.log(
        "Control de ausentes: Agenda de citas diarias no encontrada."
      );
      return;
    }

    var testCalendar = !!document.getElementById("refreshCal");
    if (!testCalendar) {
      console.log("Control de ausentes: No está viendo una agenda");
      return;
    }

    var elementos = document.getElementsByClassName("fc-timegrid-event");
    let activarSonido = false;

    // Extrae la fecha visible en pantalla
    const fechaEnPantalla = extraeFechaEnPantalla();
    const now = fechaEnPantalla ? new Date(fechaEnPantalla) : new Date();

    // Comparar las fechas (sin la hora para una comparación más exacta)
    const fechaActual = new Date();

    // Conservar la fecha de "now" pero actualizar su hora a la actual

    fechaActual.setHours(
      fechaActual.getHours(),
      fechaActual.getMinutes(),
      fechaActual.getSeconds(),
      fechaActual.getMilliseconds()
    );

    now.setHours(
      fechaActual.getHours(),
      fechaActual.getMinutes(),
      fechaActual.getSeconds(),
      fechaActual.getMilliseconds()
    );

    // Si las fechas son diferentes, salimos de la función
    if (now.getTime() !== fechaActual.getTime()) {
      console.log(
        "La fecha en pantalla es diferente a la fecha actual. Saliendo de la función buscar ausentes."
      );
      return;
    }

    const regexList = [
      /(\d+):(\d+)\s*(a\.?\s?m\.?|p\.?\s?m\.?|pm|PM|P\.?M\.?)/i, // Variación para "a.m." y "p.m."
      /(\d+):(\d+)\s*(am|pm|AM|PM)/i, // Otra variación para am/pm sin puntos
    ];

    for (var dato of elementos) {
      if (dato.style["background-color"] === color) {
        const timeText = dato
          .querySelector(".fc-event-time")
          ?.textContent.trim();

        if (!timeText) {
          console.warn("No se encontró el tiempo para este evento.");
          continue;
        }

        const startTime = timeText.split(" - ")[0];
        let timeMatch = null;

        // Intentar hacer match con las expresiones regulares
        for (const regex of regexList) {
          timeMatch = startTime.match(regex);
          if (timeMatch) break;
        }

        if (timeMatch) {
          const [_, hour, minute, period] = timeMatch;
          //console.log(            `Cadena descompuesta: ${hour} : ${minute} | Periodo: ${period}`           );

          let hours = parseInt(hour, 10);
          const minutes = parseInt(minute, 10);

          // Ajustar horas según el período (AM/PM)
          if (period.toLowerCase().includes("p. m.") && hours < 12) {
            hours += 12; // Si es "p.m." y la hora es menor que 12, sumamos 12 horas
          }
          if (period.toLowerCase().includes("a. m.") && hours === 12) {
            hours = 0; // Si es "a.m." y la hora es 12, convertimos a medianoche (00:00)
          }

          const eventTime = new Date(now);
          eventTime.setHours(hours, minutes, 0, 0);

          const elapsedMinutes = Math.floor((now - eventTime) / (1000 * 60));

          const formatTime = (date) => {
            const h = date.getHours();
            const m = date.getMinutes().toString().padStart(2, "0");
            const period = h >= 12 ? "p.m." : "a.m.";
            return `${h % 12 || 12}:${m} ${period}`;
          };

          const eventTimeFormatted = formatTime(eventTime);
          const nowFormatted = formatTime(now);

          console.log(
            `Evento: ${startTime} (Hora convertida: ${eventTimeFormatted}), Hora actual: ${nowFormatted}, Tiempo transcurrido: ${elapsedMinutes} minutos.`
          );

          if (elapsedMinutes >= nMinutes) {
            console.log(
              `La cita con ID ${dato.id} y hora ${startTime} ha excedido ${nMinutes} minutos.`
            );
            dato.classList.add("blink");
            activarSonido = true;
          }
        } else {
          console.warn(
            `No se pudo analizar la hora para el evento: ${timeText}`
          );
        }
      }
    }
    if (activarSonido) sonido();
  }); /// fin de func esperar
}

// Función para extraer la fecha visible en la pantalla
function extraeFechaEnPantalla() {
  const fechaTexto = document
    .querySelector("h2.fc-toolbar-title")
    .textContent.trim();
  //console.log("Fecha original:", fechaTexto);

  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const partesFecha = fechaTexto.split(" de ");
  //console.log("Partes de la fecha:", partesFecha);

  const [dia, mesTexto, anio] = partesFecha;
  //console.log("Día:", dia);
  //console.log("Mes extraído:", mesTexto);
  //console.log("Año:", anio);

  const mes = meses.indexOf(mesTexto.toLowerCase().trim());

  // console.log("Índice del mes:", mes);

  if (mes === -1) {
    console.error("Mes no válido");
  } else {
    const fecha = new Date(anio, mes, dia);
    const now = new Date();
    fecha.setHours(now.getHours(), now.getMinutes(), now.getSeconds()); // Establece la hora actual

    //console.log("Fecha con hora actual:", formatFecha(fecha));
    return formatFecha(fecha);
  }
}

// Función para formatear la fecha en formato "YYYY-MM-DD HH:mm:ss"
function formatFecha(fecha) {
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  const segundos = String(fecha.getSeconds()).padStart(2, "0");

  return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}

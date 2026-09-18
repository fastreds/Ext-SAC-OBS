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

// Función auxiliar para detectar si la pantalla actual corresponde a la agenda de citas diarias
function esAgendaCitasDiarias() {
  const headings = document.querySelectorAll("h1, h2, h3, h4, .card-title, .page-title, .todo-blue");
  for (const h of headings) {
    if (h && h.textContent && h.textContent.toLowerCase().includes("agenda de citas diarias")) {
      return true;
    }
  }
  return false;
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

    // Verificar si contiene "Agenda de citas diarias" en cualquier encabezado de la página
    if (esAgendaCitasDiarias()) {
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

    var elementos = eventosDelCalendario();
    let activarSonido = false;

    // Extrae la fecha visible en pantalla
    const fechaEnPantalla = extraeFechaEnPantalla();
    const now = fechaEnPantalla ? new Date(fechaEnPantalla) : new Date();

    // Comparar las fechas (sin la hora para una comparación exacta de día)
    const fechaActual = new Date();
    const fechaCompActual = new Date(fechaActual);
    fechaCompActual.setHours(0, 0, 0, 0);

    const fechaCompPantalla = new Date(now);
    fechaCompPantalla.setHours(0, 0, 0, 0);

    // Si las fechas son diferentes, salimos de la función
    if (fechaCompPantalla.getTime() !== fechaCompActual.getTime()) {
      console.log(
        "La fecha en pantalla es diferente a la fecha actual. Saliendo de la función buscar ausentes."
      );
      return;
    }

    const regexList = [
      /(\d+):(\d+)\s*(a\.?\s?m\.?|p\.?\s?m\.?|pm|PM|P\.?M\.?)/i, // Variación para "a.m." y "p.m."
      /(\d+):(\d+)\s*(am|pm|AM|PM)/i, // Otra variación para am/pm sin puntos
      /^(\d{1,2}):(\d{2})$/ // Formato 24 horas sin periodo
    ];

    for (var dato of elementos) {
      if (bgMatches(dato, color)) {
        const timeText = (
          dato.querySelector(".fc-event-time") ||
          dato.querySelector(".fc-time") ||
          dato.querySelector(".fc-event-title-container")
        )?.textContent.trim();

        if (!timeText) {
          console.warn("No se encontró el tiempo para este evento.");
          continue;
        }

        const startTime = timeText.split(" - ")[0].trim();
        let timeMatch = null;

        // Intentar hacer match con las expresiones regulares
        for (const regex of regexList) {
          timeMatch = startTime.match(regex);
          if (timeMatch) break;
        }

        if (timeMatch) {
          const hour = timeMatch[1];
          const minute = timeMatch[2];
          const period = timeMatch[3] || "";

          let hours = parseInt(hour, 10);
          const minutes = parseInt(minute, 10);

          // Ajustar horas según el período (AM/PM) si existe
          if (period) {
            const pLower = period.toLowerCase();
            if ((pLower.includes("p. m.") || pLower.includes("pm") || pLower.includes("p.m.")) && hours < 12) {
              hours += 12;
            }
            if ((pLower.includes("a. m.") || pLower.includes("am") || pLower.includes("a.m.")) && hours === 12) {
              hours = 0;
            }
          }

          const eventTime = new Date(now);
          eventTime.setHours(hours, minutes, 0, 0);

          const elapsedMinutes = Math.floor((now - eventTime) / (1000 * 60));

          const formatTime = (date) => {
            const h = date.getHours();
            const m = date.getMinutes().toString().padStart(2, "0");
            const periodStr = h >= 12 ? "p.m." : "a.m.";
            return `${h % 12 || 12}:${m} ${periodStr}`;
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

// Función para extraer la fecha visible en la pantalla (compatible con múltiples formatos en español y números)
function extraeFechaEnPantalla() {
  const titulo = document.querySelector("h2.fc-toolbar-title") || document.querySelector(".fc-toolbar-title");
  if (!titulo) return null;
  const fechaTexto = titulo.textContent.trim().toLowerCase();

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

  // 1. Intentar formato con nombre de mes en texto (ej. "18 de septiembre de 2026" o "viernes, 18 de septiembre de 2026")
  let mesIndex = -1;
  for (let i = 0; i < meses.length; i++) {
    if (fechaTexto.includes(meses[i])) {
      mesIndex = i;
      break;
    }
  }

  if (mesIndex !== -1) {
    const anioMatch = fechaTexto.match(/\b(20\d\d)\b/);
    const diaMatch = fechaTexto.match(/(\d{1,2})\s+de\s+[a-z]+/i) || fechaTexto.match(/\b(\d{1,2})\b/);
    if (anioMatch && diaMatch) {
      const anio = parseInt(anioMatch[1], 10);
      const dia = parseInt(diaMatch[1], 10);
      const fecha = new Date(anio, mesIndex, dia);
      const now = new Date();
      fecha.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      if (!isNaN(fecha.getTime())) {
        return formatFecha(fecha);
      }
    }
  }

  // 2. Intentar formato numérico DD/MM/YYYY o YYYY-MM-DD
  const slashMatch = fechaTexto.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d\d)/);
  if (slashMatch) {
    const dia = parseInt(slashMatch[1], 10);
    const mes = parseInt(slashMatch[2], 10) - 1;
    const anio = parseInt(slashMatch[3], 10);
    const fecha = new Date(anio, mes, dia);
    const now = new Date();
    fecha.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    if (!isNaN(fecha.getTime())) {
      return formatFecha(fecha);
    }
  }

  return null;
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

////////////////////////////////// etiquetas   ///////////////////////////////////


console.log("Función Gestión de Etiquetas" );
// Función para agregar el botón a cada fila para las etiquetas
function agregarBotonATabla(tipo,detalle) {
  
    console.log("Imprime Etiqueta");

    let tableBody = document.querySelector("#datatable_ajax tbody");
    if (!tableBody) return;
   
  
    var date = new Date()
    let rows = tableBody.getElementsByTagName("tr");
    fechaActual =     date.getDate() +       "/" +      ("0" + (date.getMonth() + 1)).slice(-2) +      "/" +      ("0" + date.getFullYear()).slice(-2) ;
    let EsAdministrador = 0;
  
      //elimna los botones existentes 
  
      for (let i = 0; i < rows.length; i++) {
        let buttonCell = rows[i].querySelector('.custom-action-button');
        if (buttonCell) {
            // Elimina la celda que contiene el botón
            let cellToRemove = buttonCell.closest("td");
            if (cellToRemove) {
                cellToRemove.remove();
            }
        }
    }
  
    
  
    /// verifica el si tabla contiene checkbox para determinar con esto si es un administrador
    var checkboxes = tableBody.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length > 0) {  EsAdministrador = 1;   }
  
  
    for (let i = 0; i < rows.length; i++) {
        if (!rows[i].querySelector('.custom-action-button')) {
            let newButton = document.createElement("button");
            newButton.innerHTML = tipo;
            newButton.classList.add("btn", "btn-sm", "btn-primary", "custom-action-button");
  
            if(EsAdministrador)  a = 1; else  a = 0;
            newButton.addEventListener("click", function() {
                let nombre =    rows[i].cells[2+a].textContent;
                let apellidos = rows[i].cells[1+a].textContent;
                let cedula = rows[i].cells[3+a].textContent;
                let fechaNacimiento = rows[i].cells[4+a].textContent;
                let telefono_px = rows[i].cells[6+a].textContent;
  
                imprimirDatos(tipo,nombre, cedula, fechaNacimiento,apellidos,detalle, fechaActual,telefono_px);
                
            });
  
            let newCell = document.createElement("td");
            newCell.appendChild(newButton);
            rows[i].appendChild(newCell);
        }
    }
  
    //////////Función para imprimir los datos////////////////////////////
  function imprimirDatos(tipo, nombre, cedula, fechaNacimiento, apellidos,detalle,fechaActual, telefono_px) {
    
   
    function procesarCadenaParaCedulaDeEtiqueta(cadena) {
      // Eliminar caracteres especiales y espacios, manteniendo solo números
      let cadenaLimpia = cadena.replace(/[^a-zA-Z0-9]/g, '');
  
      // Verificar si la longitud de la cadena es suficiente
      if (cadenaLimpia.length < 6) {
          return "La cadena debe tener al menos 6 dígitos.";
      }
  
      // Determinar la longitud que se necesita para el formato deseado
      let longitudNecesaria = cadenaLimpia.length - 4; // Mantener 4 caracteres para -xx-xx
  
      // Obtener la parte inicial sin alterar
      let parteInicial = cadenaLimpia.slice(0, longitudNecesaria);
      
      // Tomar los últimos 4 caracteres
      let parteFinal = cadenaLimpia.slice(-4);
  
      // Formatear la cadena con los guiones
      let resultado = `${parteInicial}-${parteFinal.slice(0, 2)}-${parteFinal.slice(2)}`;
  
      return resultado;
  }
    ///case del tipo de etiqueta 
     contenido = "sin contenido";
     
   ////////////// Recepcion ///////
  switch (tipo) {
    case "Recepcion":
       contenido = `
  <html>
  <head>
      <title>Etiqueta de paciente para recepción</title>
      <style>
          body { 
             /* font-family: Arial, sans-serif; 
              margin: 5px;
              font-size: 10px; 
              align-items: center; /* Alinea verticalmente los elementos */
                  body { font-family: Arial, sans-serif;  margin: 5px; }
                h2 { text-align: center; }
                table { margin-left: 35px; width: 350px;  margin-top: 5px; border-collapse: collapse; }
                td { padding: 2px;  font-size: small; border: 0px solid #000; }
             
          }
          
      </style>
  </head>
  <body>
      
      <table>
          <tr>
               <td><strong> ${detalle} </strong></td>
      
          </tr>
          <tr>
           <td><strong>Identificación: ${cedula}</strong></td>
   
       </tr>
       <tr>
           <td><strong>Nombre: ${nombre} ${apellidos}</strong></td>
        
       </tr>
       <tr>
           <td><strong>Fecha Nacimiento: ${fechaNacimiento} </strong></td>
      
       </tr>
       
   </table>
  </body>
  </html>
  `;
      break;
  
  
    //////////// Medicamento ///////
      case "Medicamento":
         contenido = `
        <html>
        <head>
            <title>Etiqueta medicamento</title>
         <style>
          body { 
             /* font-family: Arial, sans-serif; 
              margin: 5px;
              font-size: 10px; 
              align-items: center; /* Alinea verticalmente los elementos */
                  body { font-family: Arial, sans-serif;  margin: 5px; }
                h2 { text-align: center; }
                table { margin-left: 35px; width: 350px;  margin-top: 5px; border-collapse: collapse; }
                td { padding: 2px;  font-size: small; border: 0px solid #000; }
             
          }
          
      </style>
        </head>
        <body>
            <table>
                <tr>
                    <td><strong>Identificación: ${cedula} </strong> </td> <td>Fecha: ${ fechaActual }</td>
                    
                </tr>
                <tr>
                   <td><strong>Nombre: ${nombre} ${apellidos}</strong></td>
                </tr>
                 <tr>
                    <td><strong>Instrucciones: ${detalle} </strong></td>
         
                </tr>
  
                
                
            </table>
        </body>
        </html>
    `;
    break;
  
   ////////////// correo ///////
    case "Correo":
      contenido = `
     <html>
     <head>
         <title>Etiqueta medicamento</title>
         <style>
               body { 
             /* font-family: Arial, sans-serif; 
              margin: 5px;
              font-size: 10px; 
              align-items: center; /* Alinea verticalmente los elementos */
                  body { font-family: Arial, sans-serif;  margin: 5px; }
                h2 { text-align: center; }
                table { margin-left: 35px; width: 350px;  margin-top: 5px; border-collapse: collapse; }
                td { padding: 2px;  font-size: small; border: 0px solid #000; }
             
          }
         </style>
     </head>
     <body>
         <h2>Universidad De Costa Rica </h2>
         <table>
             <tr>
                 <td><strong>Nombre: ${nombre} ${apellidos}</strong></td>
                
             </tr>
             <tr>
                 <td>Identificación: ${cedula}</td>
               
             </tr>
                 <tr>
                 <td><strong>Teléfono: ${telefono_px}</strong></td>
               
             </tr>
               <tr>
                    <td><strong>${detalle}  </strong></td>
                  
                </tr>
             
         </table>
     </body>
     </html>
  `;
  break;
  
   ////////////// Archivo ///////
   case "Archivo":
    contenido = `
  <html>
  
  <head>
      <title>Etiqueta Archivo</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0px;
  
          }
  
          table {
              margin-left: 0px;
              width: 1000px;
              margin-top: 10px;
              border-collapse: collapse;
              border: 0px solid #000;
  
          }
  
          .DIV_Identificacion {
              padding: 10px;
              border: 0px solid #000;
              font-size: 110px;
              font-weight: bold;
              text-align: center;
  
          }
  
          .DIV_Nombre {
  
              padding: 10px;
              font-size: 50px;
              border: 0px solid #000;
              font-weight: bold;
              text-align: center;
          }
      </style>
  </head>
  
  <body>
      <table>
          <tr>
              <td>
                  <div class="DIV_Nombre"> ${nombre} ${apellidos}</div>
              </td>
  
          </tr>
          <tr>
              <td>
                  <div class="DIV_Identificacion">${procesarCadenaParaCedulaDeEtiqueta(cedula)}
  
                  </div>
  
              </td>
  
          </tr>
  
          <tr>
              <td>
                  <div class="DIV_Nombre"> ${detalle} </div>
              </td>
  
          </tr>
  
  
      </table>
  </body>
  
  </html>
  `;
  break;
  
    default:
      console.log("No se cargó contenido");
  }
     
  
    let ventanaImpresion = window.open('', '_blank');
    ventanaImpresion.document.open();
    ventanaImpresion.document.write(contenido);
    ventanaImpresion.document.close();
    setTimeout(function() {
        ventanaImpresion.print();
        ventanaImpresion.close();
    }, 500);
  
  
  }
  }
  
  
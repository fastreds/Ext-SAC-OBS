# Guía de Instalación y Actualización Manual

Esta guía explica detalladamente cómo instalar por primera vez o actualizar manualmente la extensión **Ext Gestión SAC-UCR** utilizando el código de GitHub.

---

## Método 1: Para Usuarios Estándar (Descargando archivo ZIP)

### Paso 1: Descargar la última versión
1. Abre tu navegador y ve al repositorio de GitHub: [https://github.com/fastreds/Ext-SAC-OBS](https://github.com/fastreds/Ext-SAC-OBS)
2. Haz clic en el botón verde **Code** (ubicado en la esquina superior derecha).
3. Selecciona la opción **Download ZIP**.
4. Guarda el archivo `.zip` en una carpeta que recuerdes (por ejemplo, en tus *Documentos* o *Escritorio*).

### Paso 2: Extraer los archivos
1. Ve a la carpeta donde descargaste el archivo `.zip`.
2. Haz clic derecho sobre el archivo y selecciona **Extraer todo...** (o usa un programa como WinRAR o 7-Zip).
3. Asegúrate de extraerlo en una carpeta permanente (si eliminas o mueves esta carpeta más adelante, la extensión dejará de funcionar en Chrome).

### Paso 3: Cargar la extensión en Chrome
1. Abre Google Chrome y escribe en la barra de direcciones: `chrome://extensions/` (y presiona *Enter*).
2. En la esquina superior derecha de la pantalla, activa el interruptor que dice **Modo de desarrollador**.
3. En la esquina superior izquierda, haz clic en el botón **Cargar descomprimida**.
4. Selecciona la carpeta que acabas de extraer (debe ser la carpeta que contiene el archivo `manifest.json`).
5. ¡Listo! La extensión ya estará activa.

---

### ¿Cómo actualizar cuando hay una nueva versión?
Cuando la extensión te notifique que hay una nueva versión disponible:
1. Sigue el **Paso 1** para descargar el nuevo archivo `.zip`.
2. Extrae el nuevo `.zip` y **reemplaza todos los archivos** dentro de la carpeta permanente que ya tenías configurada.
3. Ve a `chrome://extensions/` en tu navegador.
4. Busca la tarjeta de **Ext Gestión SAC-UCR** y haz clic en el icono de **Recargar (↻)** en la parte inferior derecha de la tarjeta.
5. La extensión cargará los nuevos cambios inmediatamente sin necesidad de volver a instalarla.

---

## Método 2: Para Desarrolladores (Usando Git)

Si clonaste el repositorio con Git, el proceso es mucho más rápido y automatizado.

### Instalación inicial:
1. Abre tu terminal (Git Bash, PowerShell, etc.).
2. Clona el repositorio en tu PC:
   ```bash
   git clone https://github.com/fastreds/Ext-SAC-OBS.git
   ```
3. Abre `chrome://extensions/` en Chrome, activa el **Modo de desarrollador**, haz clic en **Cargar descomprimida** y selecciona la carpeta clonada.

### Actualización rápida:
Cuando la extensión te alerte de una nueva versión:
1. Abre la terminal dentro de la carpeta del proyecto.
2. Ejecuta el comando para descargar los cambios del repositorio:
   ```bash
   git pull
   ```
3. Abre `chrome://extensions/` en Chrome y haz clic en el icono de **Recargar (↻)** en la tarjeta de la extensión.

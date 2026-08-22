// background.js - Comprobación de actualizaciones SIN sondeo continuo.
// Solo se ejecuta al iniciar el navegador o al instalar/actualizar la extensión,
// y como máximo una vez al día, para no saturar GitHub en muchas computadoras.

const CACHE_KEY = "AAE_EXT_SAC_UPDATE_CACHE";
const LAST_CHECK_KEY = "AAE_EXT_SAC_LAST_CHECK";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 horas
const UPDATE_URL = "https://raw.githubusercontent.com/fastreds/Ext-SAC-OBS/main/manifest.json";

function checkUpdatesOnStartup() {
  chrome.storage.local.get(LAST_CHECK_KEY, (res) => {
    const now = Date.now();
    const last = res[LAST_CHECK_KEY] || 0;
    if (now - last < COOLDOWN_MS) return; // ya se comprobó hoy

    fetch(UPDATE_URL)
      .then(r => {
        if (!r.ok) throw new Error("Respuesta de red: " + r.status);
        return r.json();
      })
      .then(remote => {
        chrome.storage.local.set({
          [CACHE_KEY]: { latestVersion: remote.version, timestamp: now },
          [LAST_CHECK_KEY]: now
        });
      })
      .catch(err => console.error("No se pudo comprobar actualizaciones:", err));
  });
}

// Se dispara al abrir el navegador (no en cada apertura del popup)
chrome.runtime.onStartup.addListener(checkUpdatesOnStartup);
// Se dispara al instalar o actualizar la extensión
chrome.runtime.onInstalled.addListener(checkUpdatesOnStartup);

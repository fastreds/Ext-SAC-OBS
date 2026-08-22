// background.js - Service worker de fondo
// Maneja la actualizacion automatica via Native Messaging para que el proceso
// continue aunque el popup se cierre.

const HOST_NAME = "com.fastreds.extsacobs";
const DEFAULT_ZIP_URL = "https://github.com/fastreds/Ext-SAC-OBS/archive/refs/heads/main.zip";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === "startUpdate") {
    startUpdate(msg.path, msg.url || DEFAULT_ZIP_URL);
    return false;
  }
});

function startUpdate(installPath, zipUrl) {
  let port;
  try {
    port = chrome.runtime.connectNative(HOST_NAME);
  } catch (e) {
    chrome.runtime.sendMessage({
      action: "updateResult",
      ok: false,
      message: "Host de actualizacion no instalado. Ejecuta install-host.ps1."
    });
    return;
  }

  port.onMessage.addListener((response) => {
    if (response.status === "progress") {
      chrome.runtime.sendMessage({
        action: "updateProgress",
        step: response.step,
        message: response.message
      });
    } else if (response.status === "done") {
      chrome.runtime.sendMessage({ action: "updateProgress", message: response.message });
      port.disconnect();
      // Recargar la extension con los archivos nuevos ya en disco
      chrome.runtime.reload();
    } else if (response.status === "error") {
      port.disconnect();
      chrome.runtime.sendMessage({
        action: "updateResult",
        ok: false,
        message: response.message
      });
    }
  });

  port.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      console.error("Native host desconectado:", chrome.runtime.lastError.message);
      chrome.runtime.sendMessage({
        action: "updateResult",
        ok: false,
        message: chrome.runtime.lastError.message
      });
    }
  });

  port.postMessage({ type: "update", path: installPath, url: zipUrl });
}

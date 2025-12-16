// Escucha eventos personalizados desde el content script para actualizar Select2
// Esto corre en el contexto de la página (page world)
document.addEventListener('ProcessSelect2Update', function (e) {
    const data = e.detail;
    if (data && data.elementId && data.value) {
        try {
            if (typeof jQuery !== 'undefined') {
                var $el = jQuery('#' + data.elementId);
                if ($el.length) {
                    // Actualizar valor y disparar change para Select2
                    $el.val(data.value).trigger('change');
                    console.log(`[Ext-SAC-OBS] Select2 updated for #${data.elementId}`);
                }
            }
        } catch (err) {
            console.error('[Ext-SAC-OBS] Error updating select2:', err);
        }
    }
});

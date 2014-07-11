Components.utils.import("resource://transparentcrypto/util.jsm");

/* Create namespace */
var transparentcrypto = {};

transparentcrypto.preview = function() {
    var editor = window.gMsgCompose.editor;
    var text = editor.outputToString('text/plain', editor.eNone)

    var window_preview = window.open(
        "chrome://transparentcrypto/content/preview.xul",
        "transparentcrypto-window-preview",
        "chrome,width=400,height=300");

    log('messengercompose.js: ' + window_preview);

    alert(window_preview);

    window_preview.document.getElementById('encrypted-data').innerHTML = 'CRYPTCRYPTCRYPT' + text + 'CRYPTCRYPTCRYPT';
};

log('messengercompose.js: ' + 'loaded')

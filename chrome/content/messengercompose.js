/* Create namespace */
var transparentcrypto = {};

transparentcrypto.preview = function() {
    var editor = window.gMsgCompose.editor;
    var text = editor.outputToString('text/plain', editor.eNone)
    //alert(text);
    var window_preview = window.open(
        "chrome://transparentcrypto/content/preview.xul",
        "transparentcrypto-window-preview",
        "chrome,width=400,height=300");
    alert(window_preview);
    window_preview.document.getElementById('encrypted-data').innerHTML = 'CRYPTCRYPTCRYPT' + text + 'CRYPTCRYPTCRYPT';
};

/* Create namespace */
var transparentcrypto = {};

transparentcrypto.preview = function() {
    window.open(
        "chrome://transparentcrypto/content/preview.xul",
        "transparentcrypto-window-preview",
        "chrome,width=400,height=300");
};

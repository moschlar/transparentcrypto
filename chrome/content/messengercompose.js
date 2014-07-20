Components.utils.import("resource://transparentcrypto/util.jsm");

try {
    log(window.openpgp.config.versionstring);
} catch (ex) { log(ex); };

/* Create namespace */
var transparentcrypto = {

    MAX_LINE_LENGTH: 76,

    editor: null,
    preview_window: null,

    showPreviewWindow: function() {
        log('showPreviewWindow');
        log(this.preview_window);
        try {
            this.preview_window = window.open(
                "chrome://transparentcrypto/content/preview.xul",
                "transparentcrypto-preview-window",
                "chrome,width=400,height=300");
            return this.preview_window;
        } catch (ex) {
            log(ex);
            return null;
        };
    },

    getEditorContent: function() {
        //log('getEditorContent');
        try {
            return this.editor.outputToString('text/plain', this.editor.eNone);
        } catch (ex) {
            log(ex);
            return '';
        };
    },

    makePreview: function(data) {
        //log('makePreview');
        cryptdata = '';
        while (cryptdata.length < data.length) {
            cryptdata += Math.random().toString(36).substr(2);
        }
        cryptdata = btoa(cryptdata);
        crypt = '';
        for (i=0; i < cryptdata.length; i += this.MAX_LINE_LENGTH) {
            crypt += cryptdata.substr(i, this.MAX_LINE_LENGTH) + '\n';
        }
        crypt = '-----BEGIN PGP MESSAGE-----\n'
            + 'Comment: This is just a nonsene preview of your mail.\n\n'
            + crypt
            + '\n-----END PGP MESSAGE-----';
        return crypt;
    },

    setPreviewContent: function(data) {
        //log('setPreviewContent');
        try {
            var elem = this.preview_window.document.getElementById('email-preview');
            elem.innerHTML = data;
        } catch (ex) { log(ex); };
    },

    updatePreview: function() {
        //log('updatePreview');
        if (this.preview_window) {
            try {
                var data = this.getEditorContent();
                data = this.makePreview(data);
                this.setPreviewContent(data);
            } catch (ex) { log(ex); };
        } else {
            log('No preview window')
        }
        log(gMsgCompose.compFields.from);
        log(gMsgCompose.compFields.to);
        log(gMsgCompose.compFields.cc);
        log(gMsgCompose.compFields.bcc);
        log(gMsgCompose.compFields.subject);
        log(gMsgCompose.compFields.otherRandomHeaders);

   },

    myEditorObserver: {
        /* http://mxr.mozilla.org/comm-central/source/mozilla/editor/idl/nsIEditorObserver.idl#21 */
        EditAction: function() {
            //log('EditAction');
            transparentcrypto.updatePreview();
        }
    },

    myStateListener: {
        /* http://mxr.mozilla.org/comm-central/source/mailnews/compose/public/nsIMsgCompose.idl#73 */
        NotifyComposeFieldsReady: function() {
            log('NotifyComposeFieldsReady');
            try {
                gMsgCompose.editor.addEditorObserver(transparentcrypto.myEditorObserver);
            } catch (ex) { log(ex); };
            try {
                transparentcrypto.editor = gMsgCompose.editor;
            } catch (ex) { log(ex); };
        },
        NotifyComposeBodyReady: function() {},
        ComposeProcessDone: function(aResult) {},
        SaveInFolderDone: function(folderURI) {}
    },

    composeWindowInit: function() {
        log('composeWindowInit');
         try {
            gMsgCompose.RegisterStateListener(transparentcrypto.myStateListener);
        } catch (ex) { log(ex); };
    },

    init: function() {
        log('init');
        try {
            window.addEventListener("compose-window-init", transparentcrypto.composeWindowInit, true);
        } catch (ex) { log(ex); };
    },
}

log('messengercompose.js: ' + 'loaded');

try {
    transparentcrypto.init();
} catch (ex) { log(ex); };

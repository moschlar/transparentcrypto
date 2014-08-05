Components.utils.import("resource://transparentcrypto/util.jsm");

try {
    Components.utils.import("resource://enigmail/enigmailCommon.jsm");
    //Components.utils.import("resource://enigmail/commonFuncs.jsm");
    //Components.utils.import("resource://enigmail/keyManagement.jsm");
} catch (ex) {Components.utils.reportError(ex);log(ex);}

try {
    log(window.openpgp.config.versionstring);
} catch (ex) { Components.utils.reportError(ex); log(ex); };

/* Create namespace */
var transparentcrypto = {

    MAX_LINE_LENGTH: 76,

    editor: null,
    preview_window: null,

    publicKey: null,

    showPreviewWindow: function() {
        log('showPreviewWindow');
        log(this.preview_window);
        try {
            this.preview_window = window.open(
                "chrome://transparentcrypto/content/preview.xul",
                "transparentcrypto-preview-window",
                "chrome,centerscreen,resizable,width=400,height=300");
            return this.preview_window;
        } catch (ex) {
            Components.utils.reportError(ex); log(ex);
            return null;
        };
    },

    getPublicKey: function() {
        var uid = "0xFBDD8888";
        try {
            var enigmailSvc = EnigmailCommon.getService(window);
            if (!enigmailSvc) throw("!enigmailSvc");

            var exitCodeObj = {};
            var errorMsgObj = {};

            var key = enigmailSvc.extractKey(window, 0, uid, undefined, exitCodeObj, errorMsgObj);
            if (exitCodeObj.value != 0) {
              throw(errorMsgObj.value);
            }

            //log("key: " + key);

            this.publicKey = openpgp.key.readArmored(key);

            //log("publicKey: " + this.publicKey);

            return this.publicKey;
        } catch (ex) {
            Components.utils.reportError(ex);
            log(ex);
            return undefined;
        }
    },

    getHeaders: function() {
        //log('getHeaders');
        /*
        log(gMsgCompose.compFields.from);
        log(gMsgCompose.compFields.to);
        log(gMsgCompose.compFields.cc);
        log(gMsgCompose.compFields.bcc);
        log(gMsgCompose.compFields.subject);
        log(document.getElementById("msgSubject").value);
        log(gMsgCompose.compFields.otherRandomHeaders);
        */
        try {
            return {
                from: gMsgCompose.compFields.from,
                to: gMsgCompose.compFields.to,
                cc: gMsgCompose.compFields.cc,
                bcc: gMsgCompose.compFields.bcc,
                subject: gMsgCompose.compFields.subject || document.getElementById("msgSubject").value,
            };
        } catch (ex) {
            Components.utils.reportError(ex); log(ex);
            return {from: '', to: '', cc: '', bcc: '', subject: ''};
        };
    },

    getEditorContent: function() {
        //log('getEditorContent');
        try {
            return this.editor.outputToString('text/plain', this.editor.eNone);
        } catch (ex) {
            Components.utils.reportError(ex); log(ex);
            return '';
        };
    },

/*
Return-Path: <moschlar@metalabs.de>
Message-ID: <5389E86B.8050408@metalabs.de>
Date: Sat, 31 May 2014 16:34:19 +0200
From: Moritz Schlarb <moschlar@metalabs.de>
User-Agent: Mozilla/5.0 (Windows NT 6.3; WOW64; rv:24.0) Gecko/20100101 Thunderbird/24.5.0
MIME-Version: 1.0
To: moschlar@metalabs.de, Moritz Schlarb <mail@moritz-schlarb.de>
Subject: Test Encrypt
X-Enigmail-Version: 1.6
Content-Type: text/plain; charset=ISO-8859-15
Content-Transfer-Encoding: 8bit
*/

    makePreview: function(headers, body) {
        //log('makePreview');
        var cipherText = '';
        try {
            var publicKey = this.publicKey || this.getPublicKey();
            cipherText = openpgp.encryptMessage(publicKey.keys, body);

            log('cipherText: ' + cipherText);
        } catch (ex) {Components.utils.reportError(ex); log(ex);}

        /*
        cryptdata = '';
        while (cryptdata.length < body.length) {
            cryptdata += Math.random().toString(36).substr(2);
        }
        cryptdata = btoa(cryptdata);
        crypt = '';
        for (i=0; i < cryptdata.length; i += this.MAX_LINE_LENGTH) {
            crypt += cryptdata.substr(i, this.MAX_LINE_LENGTH) + '\n';
        }
        */
        crypt = ''
            + 'From: ' + headers['from'] + '\n'
            + 'To: ' + headers['to'] + '\n'
            + 'Subject: ' + headers['subject'] + '\n' + '\n'
            //+ '\n-----BEGIN PGP MESSAGE-----\n'
            //+ 'Comment: This is just a nonsene preview of your mail.\n\n'
            + cipherText
            //+ '\n-----END PGP MESSAGE-----'
            ;
        return crypt;
    },

    setPreviewContent: function(data) {
        //log('setPreviewContent');
        try {
            var elem = this.preview_window.document.getElementById('email-preview');
            elem.innerHTML = data;
        } catch (ex) { Components.utils.reportError(ex); log(ex); };
    },

    updatePreview: function() {
        //log('updatePreview');
        if (this.preview_window) {
            try {
                var headers = this.getHeaders();
                var body = this.getEditorContent();
                var data = this.makePreview(headers, body);
                this.setPreviewContent(data);
            } catch (ex) { Components.utils.reportError(ex); log(ex); };
        } else {
            log('No preview window')
        }
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
            } catch (ex) { Components.utils.reportError(ex); log(ex); };
            try {
                transparentcrypto.editor = gMsgCompose.editor;
            } catch (ex) { Components.utils.reportError(ex); log(ex); };
        },
        NotifyComposeBodyReady: function() {},
        ComposeProcessDone: function(aResult) {},
        SaveInFolderDone: function(folderURI) {}
    },

    composeWindowInit: function() {
        log('composeWindowInit');
         try {
            gMsgCompose.RegisterStateListener(transparentcrypto.myStateListener);
        } catch (ex) { Components.utils.reportError(ex); log(ex); };
    },

    init: function() {
        log('init');
        try {
            window.addEventListener("compose-window-init", transparentcrypto.composeWindowInit, true);
        } catch (ex) { Components.utils.reportError(ex); log(ex); };
    },
}

log('messengercompose.js: ' + 'loaded');

try {
    transparentcrypto.init();
} catch (ex) { Components.utils.reportError(ex); log(ex); };

/*
TODO: Listen for changes in msgComposeFields
TODO: Preview window sizing
TODO: Performance
*/

Components.utils.import("resource://transparentcrypto/util.jsm");

try {
    Components.utils.import("resource://enigmail/enigmailCommon.jsm");
    Components.utils.import("resource://enigmail/commonFuncs.jsm");
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

    recipients: null,
    publicKeys: null,

    showPreviewWindow: function() {
        log('showPreviewWindow');
        log(this.preview_window);
        try {
            this.preview_window = window.open(
                "chrome://transparentcrypto/content/preview.xul",
                "transparentcrypto-preview-window",
                "chrome,centerscreen,resizable,width=400,height=300");
            this.updatePreview();
            return this.preview_window;
        } catch (ex) {
            Components.utils.reportError(ex); log(ex);
            return null;
        };
    },

    getPublicKeys: function(recipients) {
        if (this.recipients && recipients && arrayEquality(this.recipients, recipients) && this.publicKeys) {
            // Should be okay to be lazy
            return this.publicKeys;
        } else {
            var publicKeys = new Array;
            var enigmailSvc = EnigmailCommon.getService(window);
            if (!enigmailSvc) throw("!enigmailSvc");

            for (var i = 0; i < recipients.length; ++i ) {
                var uid = recipients[i];
                if (uid) {
                    try {
                        var exitCodeObj = {};
                        var errorMsgObj = {};

                        var key = enigmailSvc.extractKey(window, 0, uid, undefined, exitCodeObj, errorMsgObj);
                        if (exitCodeObj.value != 0) {
                            throw(errorMsgObj.value);
                        }
                        //log("key: " + key);

                        var publicKey = openpgp.key.readArmored(key);
                        //log("publicKey: " + publicKey);

                        for (var j=0; j < publicKey.keys.length; ++j)
                            publicKeys.push(publicKey.keys[j]);
                        //publicKeys.concat(publicKey.keys);
                        //log(publicKeys);
                    } catch (ex) {
                        Components.utils.reportError(ex);
                        log(ex);
                    }
                }
            }
            this.publicKeys = publicKeys;
            this.recipients = recipients;
            return publicKeys;
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
                from: gMsgCompose.compFields.from || gMsgCompose.identity.identityName,
                to: gMsgCompose.compFields.to,
                cc: gMsgCompose.compFields.cc,
                bcc: gMsgCompose.compFields.bcc,
                subject: gMsgCompose.compFields.subject || document.getElementById('msgSubject').value,
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

    getRecipients: function(headers) {
        var recipients = new Array();
        //var recipients = headers['to'] || '' + headers['cc'] || '' + headers['bcc'] || '';
        //recipients = recipients.split(',');

        var splitRecipients = gMsgCompose.compFields.splitRecipients;

        var fields = ['to', 'cc', 'bcc'];
        for (var f=0; f < fields.length; ++f) {
            var field = fields[f];
            if (headers[field]) {
                var recList = undefined;
                var arrLen = {};
                recList = splitRecipients(headers[field], true, arrLen)                    ;
                for (var i=0; i < recList.length; ++i) {
                    recipients.push(EnigmailFuncs.stripEmail(recList[i]));
                }
            }
        }

        return recipients;
    },

    makePreview: function(headers, body) {
        //log('makePreview');
        var preview = '';
        var cipherText = '';
        try {
            var recipients = this.getRecipients(headers);
            var publicKeys = this.getPublicKeys(recipients);
            //log(JSON.stringify(publicKeys));
            cipherText = openpgp.encryptMessage(publicKeys, body);
            //log('cipherText: ' + cipherText);
        } catch (ex) {
            Components.utils.reportError(ex);
            log(ex);
            cipherText = '...\nThere was an error encrypting this message:\n' + ex + '\n...';
        }

/*
        cryptdata = '';
        while (cryptdata.length < body.length) {
            cryptdata += Math.random().toString(36).substr(2);
        }
        cryptdata = btoa(cryptdata);
        preview = '';
        for (i=0; i < cryptdata.length; i += this.MAX_LINE_LENGTH) {
            preview += cryptdata.substr(i, this.MAX_LINE_LENGTH) + '\n';
        }
*/

        // Replace Version and Comment fields and emtpy lines
        cipherText = cipherText
            .replace(/^Version:.*\r?\n?/m, '')
            .replace(/^Comment:.*\r?\n?/m, '')
            .replace(/^\s*\r?\n?/gm, '');

        if (headers['from'])
            preview += 'From: ' + headers['from'] + '\n';
        if (headers['to'])
            preview += 'To: ' + headers['to'] + '\n';
        if (headers['cc'])
            preview += 'Cc: ' + headers['cc'] + '\n';
        if (headers['subject'])
            preview += 'Subject: ' + headers['subject'] + '\n';

        preview += '\n'
            //+ '\n-----BEGIN PGP MESSAGE-----\n'
            //+ 'Comment: This is just a nonsene preview of your mail.\n\n'
            + cipherText
            //+ '\n-----END PGP MESSAGE-----'
            ;

        return preview;
    },

    setPreviewContent: function(data) {
        //log('setPreviewContent');
        try {
            var elem = this.preview_window.document.getElementById('email-preview');
            elem.innerHTML = escapeHTML(data);
        } catch (ex) { Components.utils.reportError(ex); log(ex); };
    },

    updatePreview: function() {
        //log('updatePreview');
        //log(this);
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
            try {
                document.getElementById("addresses-box").addEventListener("change", transparentcrypto.updatePreview.bind(transparentcrypto));
            } catch (ex) { Components.utils.reportError(ex); log(ex); };
        },
        NotifyComposeBodyReady: function() {}, // TODO: what is this?
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

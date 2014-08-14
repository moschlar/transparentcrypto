var EXPORTED_SYMBOLS = [ "log", "console", "escapeHTML" ];

const Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;

var Console = {};
Cu.import("resource://gre/modules/devtools/Console.jsm", Console);

var Application = Cc["@mozilla.org/steel/application;1"].getService(Ci.steelIApplication);

/*
var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
*/

/**
 * Log to system console (stdout/stderr) and application console
 * @param msg
 *     The message to log
 */
function log(msg) {
    var date = new Date();
    msg = date.toISOString() + ': ' + msg;
    Console.console.log(msg);
    Application.console.log(msg);
    //consoleService.logStringMessage(msg);
}

// This allows us to use console.log everywhere to be compatible with browsers!
var console = {log: log};

/**
 * Escape HTML special characters to HTML entities
 * @param s
 *     The string to convert
 * @returns
 *     The string with all HTML special characters converted to HTML entities
 */
function escapeHTML(s) {
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

log('util.jsm: ' + 'loaded')

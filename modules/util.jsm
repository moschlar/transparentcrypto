var EXPORTED_SYMBOLS = [ "log" ];

const Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;

var Console = {};
Cu.import("resource://gre/modules/devtools/Console.jsm", Console);

var Application = Cc["@mozilla.org/steel/application;1"].getService(Ci.steelIApplication);

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
}

log('util.jsm: ' + 'loaded')

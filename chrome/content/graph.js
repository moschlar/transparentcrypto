Components.utils.import("resource://transparentcrypto/util.jsm");

/* Create namespace */
var transparentcrypto = {};

log('graph.js: ' + 'loaded')

try {
	Components.utils.import("resource://enigmail/enigmailCommon.jsm");
	Components.utils.import("resource://enigmail/commonFuncs.jsm");
	Components.utils.import("resource://enigmail/keyManagement.jsm");
} catch (ex) {Components.utils.reportError(ex);log(ex);}

var keyListObj = {};

try {
	//EnigmailFuncs.loadKeyList(window, refresh, keyListObj, sortColumn, sortDirection);
	EnigmailFuncs.loadKeyList(window, false, keyListObj, "userid", 1);
	log(JSON.stringify(keyListObj));
} catch (ex) {Components.utils.reportError(ex);log(ex);}

try {
	//EnigmailFuncs.loadKeyList(window, refresh, keyListObj, sortColumn, sortDirection);
	EnigmailFuncs.loadKeyList(window, true, keyListObj, "userid", 1);
	//log(JSON.stringify(keyListObj));
} catch (ex) {Components.utils.reportError(ex);log(ex);}

log("keyList")
for (var i=0; i < keyListObj.keyList.length; ++i) {
	log(JSON.stringify(keyListObj.keyList[i]));
}
log("keySortList")
for (var i=0; i < keyListObj.keySortList.length; ++i) {
	var el = keyListObj.keySortList[i];
	log(JSON.stringify(el));
	// {"userId":"moritz schlarb <moschlar@metalabs.de>","keyId":"45D3DBDDFBDD8888"}
}
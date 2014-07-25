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

/*
log("keyList")
for (var i=0; i < keyListObj.keyList.length; ++i) {
	log(JSON.stringify(keyListObj.keyList[i]));
}
*/
log("keySortList")
for (var i=0; i < keyListObj.keySortList.length; ++i) {
	var keySortObj = keyListObj.keySortList[i];
	log(JSON.stringify(keySortObj));
	// {"userId":"moritz schlarb <moschlar@metalabs.de>","keyId":"45D3DBDDFBDD8888"}
	var keyObj = keyListObj.keyList[keySortObj.keyId];
	log(JSON.stringify(keyObj));
	// {"expiry":"25.04.2016","expiryTime":1461591907,"created":"27.04.2011","keyId":"45D3DBDDFBDD8888","keyTrust":"u","keyUseFor":"scaESCA","ownerTrust":"u","SubUserIds":[{"userId":"Moritz Schlarb <mail@moritz-schlarb.de>","keyTrust":"u","type":"uid"},{"userId":"Moritz Schlarb <info@moritz-schlarb.de>","keyTrust":"u","type":"uid"},{"userId":"Moritz Schlarb <schlarbm@uni-mainz.de>","keyTrust":"u","type":"uid"},{"userId":"Moritz Schlarb <moschlar@students.uni-mainz.de>","keyTrust":"r","type":"uid"},{"userId":"Moritz Schlarb (TU Darmstadt) <moritz.schlarb@stud.tu-darmstadt.de>","keyTrust":"u","type":"uid"},{"userId":"Moritz Schlarb (TU Darmstadt) <ak16izaj@rbg.informatik.tu-darmstadt.de>","keyTrust":"u","type":"uid"},{"userId":"Moritz Schlarb <moritz_schlarb@yahoo.de>","keyTrust":"r","type":"uid"},{"userId":"User attribute (JPEG image)","keyTrust":"r","type":"uat","uatNum":0},{"userId":"User attribute (JPEG image)","keyTrust":"u","type":"uat","uatNum":1},{"userId":"Moritz Schlarb <moschlar@monoceres.uberspace.de>","keyTrust":"u","type":"uid"}],"fpr":"19F9B5A8821A081EFE92D30645D3DBDDFBDD8888","photoAvailable":true,"secretAvailable":true,"userId":"Moritz Schlarb <moschlar@metalabs.de>"}
	for (var j=0; j < keyObj.SubUserIds.length; ++j) {
		log(JSON.stringify(keyObj.SubUserIds[j]));
		// {"userId":"Moritz Schlarb (TU Darmstadt) <moritz.schlarb@stud.tu-darmstadt.de>","keyTrust":"u","type":"uid"}
	}
}
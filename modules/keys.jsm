var EXPORTED_SYMBOLS = [ "getKeys", "getSigs", "keyTrustLevel", "keyTrustName" ];

const Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;

try {
	Cu.import("resource://transparentcrypto/util.jsm");
	Cu.import("resource://enigmail/enigmailCommon.jsm");
	Cu.import("resource://enigmail/commonFuncs.jsm");
	Cu.import("resource://enigmail/keyManagement.jsm");
} catch (ex) {Cu.reportError(ex);}

const keyTrustLevel = {
	"u": 0,
	"f": 1,
	"m": 2,
	"n": 3,
	"q": 4,
	"-": 4,
	"e": 5,
	"r": 6,
	"d": 7,
	"i": 8,
	"o": 9,
	get: function(x) {
		return this[x] === undefined ? 10 : this[x];
	}
};

const keyTrustName = {
	"u": "The key is ultimately valid",
	"f": "The key is fully valid",
	"m": "The key is marginal valid",
	"n": "The key is valid",
	"q": "Undefined validity",
	"-": "Unknown validity",
	"e": "The key has expired",
	"r": "The key has been revoked",
	"d": "The key has been disabled",
	"i": "The key is invalid",
	"o": "Unknown",
	get: function(x) {
		return this[x] === undefined ? "Totally unknown validity" : this[x];
	}
};


// see GnuPG doc/DETAILS
// Format of colon listings
const sigRowField = {
	type: 0,
	keyValidity: 1,
	keyAlgo: 3, // 1 = RSA, 16 = Elgamal (encryption only), 17 = DSA, 20 = Elgamal (sign and encrypt)
	keyId: 4,
	created: 5,
	expiry: 6,
	uidId: 7,
	ownerTrust: 8,
	userId: 9,
	sigType: 10, // Signature class as per RFC-4880: x = exportable, l = local-only
	keyCapabilities: 11, // Key capabilities: e, s, c, a, E, S, C, A, D
	sigHash: 15, // Used hash algorithm for sig records: 2 = SHA-1, 8 = SHA-256
};

function getKeys(window) {
	log('keys.jsm: ' + 'getKeys');

	var keys = [];

	var keyListObj = {};

	try {
		//EnigmailFuncs.loadKeyList(window, refresh, keyListObj, sortColumn, sortDirection);
		EnigmailFuncs.loadKeyList(window, false, keyListObj, "userid", 1);
	} catch (ex) {
		Cu.reportError(ex);
		log('keys.jsm: ' + ex);
		return undefined;
	}

	for (var i=0; i < keyListObj.keySortList.length; ++i) {
		var keySortObj = keyListObj.keySortList[i];
		var keyObj = keyListObj.keyList[keySortObj.keyId];
		keys.push(keyObj);
	}

	return keys;
}

function getSigs(window, keyId) {
	log('keys.jsm: ' + 'getSigs' + ' ' + keyId);

	var sigs = [];

	// From enigmailViewKeySigDlg.xul

	var enigmailSvc = EnigmailCommon.getService(window);
	if (!enigmailSvc) {
		Cu.reportError(EnigGetString("accessError"));
		log('keys.jsm: ' + EnigGetString("accessError"));
		return undefined;
	}

	var exitCodeObj = {};
	var errorMsgObj = {};

	var sigList = enigmailSvc.getKeySig("0x" + keyId, exitCodeObj, errorMsgObj);

	if (exitCodeObj.value != 0) {
		Cu.reportError(errorMsgObj.value);
		log('keys.jsm: ' + errorMsgObj.value);
		return undefined;
	}

	//log(sigList);
	var aSigList = sigList.split(/\n/);
	//log(aSigList);

	for (var i=0; i<aSigList.length; ++i) {
		if (aSigList[i]) {
			try {
				var listRow = aSigList[i].split(/:/);
				//log(listRow);
				// sig,,,1,45D3DBDDFBDD8888,1303911907,,,,Moritz Schlarb <moschlar@metalabs.de>,18x,,,,,2,
				var entry = {
					type: listRow[sigRowField.type],
					keyValidity: listRow[sigRowField.keyValidity],
					keyId: listRow[sigRowField.keyId],
					created: EnigmailCommon.getDateTime(listRow[sigRowField.created], true, false),
					expiry: EnigmailCommon.getDateTime(listRow[sigRowField.expiry], true, false),
					uidId: listRow[sigRowField.uidId],
					ownerTrust: listRow[sigRowField.ownerTrust],
					userId: EnigmailCommon.convertGpgToUnicode(listRow[sigRowField.userId]),
					//userId: listRow[sigRowField.userId],
					sigType: listRow[sigRowField.sigType],
					keyUseFor: listRow[sigRowField.keyUseFor],
				};
				sigs.push(entry);
			} catch (ex) {Cu.reportError(ex);log('keys.jsm: ' + ex);}
		}
	}

	return sigs;
}

log('keys.jsm: ' + 'loaded')
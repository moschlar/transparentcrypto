var EXPORTED_SYMBOLS = [ "getKeys", "getSigs" ];

const Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;

try {
	Cu.import("resource://transparentcrypto/util.jsm");
	Cu.import("resource://enigmail/enigmailCommon.jsm");
	Cu.import("resource://enigmail/commonFuncs.jsm");
	Cu.import("resource://enigmail/keyManagement.jsm");
} catch (ex) {Cu.reportError(ex);}

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

/*
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
		try {
			var userId = EnigConvertGpgToUnicode(keyObj.userId);
			data_d3.nodemap[keyObj.keyId] = i;
			data_d3.nodes.push({
				group: keyTrustLevel.get(keyObj.keyTrust) + 1,
				name: userId,
			});
			data_sigma.nodemap[keyObj.keyId] = true;
			data_sigma.nodes.push({
				id: keyObj.keyId,
			});
			data_vis.nodes.push({
				id: keyObj.keyId,
				level: keyTrustLevel.get(keyObj.keyTrust),
				group: keyObj.keyTrust,
				label: userId.replace(" <", "\n<"),
				title: "<b>userId:</b> " + escapeHTML(userId) + "<br />" +
					"<b>keyId:</b> " + keyObj.keyId + "<br />" +
					"<b>keyTrust:</b> " + keyObj.keyTrust + " (" + keyTrustName.get(keyObj.keyTrust) + ")" + "<br />" +
					"<b>ownerTrust:</b> " + keyObj.ownerTrust + "<br />" +
					"<b>secretAvailable:</b> " + keyObj.secretAvailable + "<br />" +
					"<b>created:</b> " + keyObj.created + "<br />" +
					"<b>expiry:</b> " + keyObj.expiry + "<br />" +
					"",
			});
			data_cy.nodes.push({data: {
				id: keyObj.keyId,
				name: userId,
			}});
		} catch (ex) {Components.utils.reportError(ex);log(ex);}
	}
*/
}

function getSigs(window, keyId) {
	log('keys.jsm: ' + 'getSigs');

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
					created: listRow[sigRowField.created],
					expiry: listRow[sigRowField.expiry],
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
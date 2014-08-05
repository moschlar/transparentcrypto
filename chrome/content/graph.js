Components.utils.import("resource://transparentcrypto/util.jsm");

/* Create namespace */
var transparentcrypto = {};

try {
	Components.utils.import("resource://enigmail/enigmailCommon.jsm");
	Components.utils.import("resource://enigmail/commonFuncs.jsm");
	Components.utils.import("resource://enigmail/keyManagement.jsm");
} catch (ex) {Components.utils.reportError(ex);log(ex);}

var keyId = "45D3DBDDFBDD8888";

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
		return this[x] === undefined ? "Totally unknown" : this[x];
	}
};

var data_d3 = {
	nodes: [],
	nodemap: {},
    links: [],
};
var data_sigma = {
	nodes: [],
	nodemap: {},
    edges: [],
    edgemap: {}
};
var data_vis = {
	nodes: [],
    edges: [],
};
var data_cy = {
	nodes: [],
    edges: [],
};

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

// Get index of central key
var t = data_d3.nodemap[keyId];
log(t);

// From enigmailCommon.js

// see GnuPG doc/DETAILS
// Format of colon listings
const keyRowField = {
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

const keyValidityValue = {
	invalid: "i",
	disabled: "d",
	revoked: "r",
	expired: "e",
	notValid: "erid",
}

// From enigmailViewKeySigDlg.xul

var enigmailSvc = GetEnigmailSvc();
if (!enigmailSvc) {
	log(EnigGetString("accessError"));
}

var exitCodeObj = {};
var errorMsgObj = {};

var sigList = enigmailSvc.getKeySig("0x"+keyId, exitCodeObj, errorMsgObj);

if (exitCodeObj.value != 0) {
	log(errorMsgObj.value);
}

//log(sigList);
var aSigList = sigList.split(/\n/);
//log(aSigList);

for (var i=0; i<aSigList.length; ++i) {
	if (aSigList[i]) {
		try {
			var listRow = aSigList[i].split(/:/);
			log(listRow);
			log(listRow.length);
			// sig,,,1,45D3DBDDFBDD8888,1303911907,,,,Moritz Schlarb <moschlar@metalabs.de>,18x,,,,,2,
			var entry = {
				type: listRow[keyRowField.type],
				keyValidity: listRow[keyRowField.keyValidity],
				keyId: listRow[keyRowField.keyId],
				created: listRow[keyRowField.created],
				expiry: listRow[keyRowField.expiry],
				uidId: listRow[keyRowField.uidId],
				ownerTrust: listRow[keyRowField.ownerTrust],
				userId: EnigConvertGpgToUnicode(listRow[keyRowField.userId]),
				sigType: listRow[keyRowField.sigType],
				keyUseFor: listRow[keyRowField.keyUseFor],
			};
			log(JSON.stringify(entry));
			//{"type":"sig","keyValidity":"","keyId":"45D3DBDDFBDD8888","created":"1303911907","expiry":"","uidId":"","ownerTrust":"","userId":"Moritz Schlarb <moschlar@metalabs.de>","sigType":"18x"}
			if (entry.type === "sig") {
				var s = data_d3.nodemap[entry.keyId];
				if (!s) {
					log("###" + entry.keyId);
					s = data_d3.nodes.length;
					data_d3.nodemap[entry.keyId] = s;
					data_d3.nodes.push({
						group: 5,
						name: EnigConvertGpgToUnicode(entry.userId),
					});
				}
				data_d3.links.push({
					target: t,
					source: s,
				});

				if (!data_sigma.nodemap[entry.keyId]) {
					log("###" + entry.keyId);
					data_sigma.nodemap[entry.keyId] = true;
					data_sigma.nodes.push({
						id: entry.keyId,
					});
				}
				var name = keyId + '-' + entry.keyId;
				if (!data_sigma.edgemap[name]) {
					log("###" + entry.keyId);
					data_sigma.edgemap[name] = true;
					data_sigma.edges.push({
						id: name,
						target: keyId,
						source: entry.keyId,
					});
				}
				data_vis.edges.push({
					to: keyId,
					from: entry.keyId,
					//label: "",
					title: entry.created,
				});
				data_cy.edges.push({data: {
					target: keyId,
					source: entry.keyId,
				}});
			}
		} catch (ex) {Components.utils.reportError(ex);log(ex);}
	}
}

//log("graph.js: " + JSON.stringify(data_vis));
//log("graph.js: " + JSON.stringify(data_cy));

delete data_d3.nodemap;
window._data_d3 = data_d3;
delete data_sigma.nodemap;
delete data_sigma.edgemap;
window._data_sigma = data_sigma;
window._data_vis = data_vis;
window._data_cy = data_cy;

log('graph.js: ' + 'loaded');
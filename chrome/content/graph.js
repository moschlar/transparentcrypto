try {
	Components.utils.import("resource://transparentcrypto/util.jsm");
} catch (ex) {Components.utils.reportError(ex);}

// Mock variables from EnigmailCommon

var gKeyList = [];
var gKeySortList = [];

// Proxy selected Enigmail functions

function enigmailGetSelectedKeys() {
	log('enigmailGetSelectedKeys');
	try {
		gKeyList = window.gKeyList || [];
		gKeySortList = window.gKeySortList || [];
		if (window.hoverNode) {
			return [window.hoverNode];
		} else {
			return [];
		}
	} catch(ex) {Components.utils.reportError(ex);}
}

function enigmailRefreshKeys() {
	log('enigmailRefreshKeys');
	var b = document.getElementById('transparentcrypto-browser-graph');
	b.reload();
}

function signKey() {
	try {
		return enigSignKey();
	} catch(ex) {Components.utils.reportError(ex);}
}

function editKeyTrust() {
	try {
		return enigEditKeyTrust();
	} catch(ex) {Components.utils.reportError(ex);}
}

function displayKeySigs() {
	try {
		return enigmailListSig();
	} catch(ex) {Components.utils.reportError(ex);}
}

function displayKeyDetails() {
	try {
		return enigmailKeyDetails();
	} catch(ex) {Components.utils.reportError(ex);}
}

log('graph.js: ' + 'loaded');
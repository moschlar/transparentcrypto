try {
	Components.utils.import("resource://transparentcrypto/util.jsm");
	Components.utils.import("resource://transparentcrypto/keys.jsm");
	Components.utils.import("resource://enigmail/enigmailCommon.jsm");
} catch (ex) {Components.utils.reportError(ex);}

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

/* Create namespace */
var transparentcrypto = {};

var keyId = "45D3DBDDFBDD8888";

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

try {
	var keyList = getKeys(window);
} catch (ex) {Components.utils.reportError(ex);}

for (var i=0; i < keyList.length; ++i) {
	var keyObj = keyList[i];
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

var sigList = getSigs(keyId);

for (var i=0; i < sigList.length; ++i) {
	var entry = sigList[i];
	try {
		//log(JSON.stringify(entry));
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
			});
			data_cy.edges.push({data: {
				target: keyId,
				source: entry.keyId,
			}});
		}
	} catch (ex) {Components.utils.reportError(ex);log(ex);}
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
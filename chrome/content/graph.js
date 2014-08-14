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
		return this[x] === undefined ? "Totally unknown validity" : this[x];
	}
};

/* Create namespace */
var transparentcrypto = {};

var keyId = "45D3DBDDFBDD8888";

var nodemap = {}, edgemap = {};

var data_d3 = {
	nodes: [],
    links: [],
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
	log('graph.js: ' + 'getKeys')
	var keyList = getKeys(window);
} catch (ex) {Components.utils.reportError(ex); log('graph.js: ' + ex);}

for (var i=0; i < keyList.length; ++i) {
	var keyObj = keyList[i];
	try {
		if (!nodemap[keyObj.keyId]) {
			var userId = EnigConvertGpgToUnicode(keyObj.userId);
			nodemap[keyObj.keyId] = i;  // NodeIdx
			data_d3.nodes.push({
				group: keyTrustLevel.get(keyObj.keyTrust) + 1,
				name: userId.replace(" <", "\n<"),
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
				level: keyTrustLevel.get(keyObj.keyTrust),
			}});
		} else {log('Duplicate node keyId: ' + keyObj.keyId);}
	} catch (ex) {Components.utils.reportError(ex);log('graph.js: ' + ex);}
}

// Get index of central key
var t = nodemap[keyId];

try {
	log('graph.js: ' + 'getSigs')
	var sigList = getSigs(window, keyId);
} catch (ex) {Components.utils.reportError(ex); log('graph.js: ' + ex);}

for (var i=0; i < sigList.length; ++i) {
	var entry = sigList[i];
	try {
		//log(JSON.stringify(entry));
		if (entry.type === "sig") {
			var edgeId = keyId + '-' + entry.keyId;
			if (!edgemap[edgeId]) {
				edgemap[edgeId] = true;
				var nodeIdx = nodemap[entry.keyId];
				if (!nodeIdx) {
					log("Missing node for " + entry.keyId);
					nodeIdx = Object.keys(nodemap).length;
					nodemap[entry.keyId] = nodeIdx;
					var userId = EnigConvertGpgToUnicode(entry.userId);
					data_d3.nodes.push({
						group: 9,
						name: userId.replace(" <", "\n<"),
					});
					data_vis.nodes.push({
						id: entry.keyId,
						level: 10,
						group: 9,
						label: userId.replace(" <", "\n<"),
					});
					data_cy.nodes.push({data: {
						id: entry.keyId,
						name: userId,
						level: 10,
					}});
				}

				data_d3.links.push({
					target: t,
					source: nodeIdx,
				});
				data_vis.edges.push({
					to: keyId,
					from: entry.keyId,
				});
				data_cy.edges.push({data: {
					target: keyId,
					source: entry.keyId,
				}});

			} else {log("Duplicate edgeId: " + edgeId);}
		}
	} catch (ex) {Components.utils.reportError(ex);log('graph.js: ' + ex);}
}

log(JSON.stringify(nodemap));
log(JSON.stringify(edgemap));

//log('graph.js: ' + JSON.stringify(data_d3));
//log('graph.js: ' + JSON.stringify(data_vis));
//log('graph.js: ' + JSON.stringify(data_cy));

window._data_d3 = data_d3;
window._data_vis = data_vis;
window._data_cy = data_cy;

log('graph.js: ' + 'loaded');
Components.utils.import("resource://transparentcrypto/util.jsm");

/* Create namespace */
var transparentcrypto = {};

transparentcrypto.graph = function() {
	log('messenger.js: ' + 'graph');
	window.open(
		"chrome://transparentcrypto/content/graph.xul",
		"transparentcrypto-window-graph",
		"chrome,width=700,height=400");
};

log('messenger.js: ' + 'loaded')

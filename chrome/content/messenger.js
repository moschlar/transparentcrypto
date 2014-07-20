Components.utils.import("resource://transparentcrypto/util.jsm");

/* Create namespace */
var transparentcrypto = {};

transparentcrypto.graph = function() {
	log('messenger.js: ' + 'graph');
    try {
		window.open(
			"chrome://transparentcrypto/content/graph.xul",
			"transparentcrypto-window-graph",
			"chrome,width=700,height=400");
    } catch (ex) { Components.utils.reportError(ex); log(ex); };
};

log('messenger.js: ' + 'loaded')

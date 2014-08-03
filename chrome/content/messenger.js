Components.utils.import("resource://transparentcrypto/util.jsm");

/* Create namespace */
var transparentcrypto = {};

transparentcrypto.graph = function() {
	log('messenger.js: ' + 'graph');
    try {
		return window.open(
			"chrome://transparentcrypto/content/graph.xul",
			"transparentcrypto-window-graph",
			"chrome,centerscreen,resizable,width=800,height=500");
    } catch (ex) { Components.utils.reportError(ex); log(ex); };
};

log('messenger.js: ' + 'loaded')

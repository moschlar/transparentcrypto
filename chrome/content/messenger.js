Components.utils.import("resource://transparentcrypto/util.jsm");

/* Create namespace */
var transparentcrypto = {};

transparentcrypto.graph_d3 = function() {
	log('messenger.js: ' + 'graph_d3');
	window.open(
		"chrome://transparentcrypto/content/graph_d3.xul",
		"transparentcrypto-window-graph-d3",
		"chrome,width=600,height=400");
};
transparentcrypto.graph_sigma = function() {
	log('messenger.js: ' + 'graph_sigma');
	window.open(
		"chrome://transparentcrypto/content/graph_sigma.xul",
		"transparentcrypto-window-graph-sigma",
		"chrome,width=600,height=400");
};

log('messenger.js: ' + 'loaded')

/* Create namespace */
var transparentcrypto = {};

transparentcrypto.preview = function() {
	window.open(
		"chrome://transparentcrypto/content/preview.xul",
		"transparentcrypto-window-preview",
		"chrome,width=400,height=300");
};
transparentcrypto.graph_d3 = function() {
	window.open(
		"chrome://transparentcrypto/content/graph_d3.xul",
		"transparentcrypto-window-graph-d3",
		"chrome,width=600,height=400");
};
transparentcrypto.graph_sigma = function() {
	window.open(
		"chrome://transparentcrypto/content/graph_sigma.xul",
		"transparentcrypto-window-graph-sigma",
		"chrome,width=600,height=400");
};

/* UglifyJS by Mihai Bazon (mihai.bazon@gmail.com) | Browser Wrapper by Georg Großberger (georg@grossberger.at) */
function uglify(orig_code, options){
	options || (options = {});
	var jsp = uglify.parser;
	var pro = uglify.uglify;

	var ast = jsp.parse(orig_code, options.strict_semicolons); // parse code and get the initial AST
	ast = pro.ast_mangle(ast, options.mangle_options); // get a new AST with mangled names
	ast = pro.ast_squeeze(ast, options.squeeze_options); // get an AST with compression optimizations
	var final_code = pro.gen_code(ast, options.gen_options); // compressed code here
	return final_code;
};

uglify.parser = {};
uglify.uglify = {};
uglify.consolidator = {};

(function(exports) {

	/*PARSER*/

})(uglify.parser);

(function(exports) {

	/*UGLIFIER*/

})(uglify.uglify);


// In case we are a worker
if (this.postMessage) {
	var me = this;
	me.onmessage = function(data) {
		var result = uglify(data);
		me.postMessage(result);
	};
}


var fs = require('fs');
var version = '1.2.5';
var template = fs.readFileSync(__dirname + '/lib/files/wrapper.js', 'UTF-8').toString();


// Add the parser
var parser = fs.readFileSync(__dirname + '/lib/UglifyJS/lib/parse-js.js', 'UTF-8').toString();
template = template.replace('/*PARSER*/', parser);

// Add Processor
var proc = fs.readFileSync(__dirname + '/lib/UglifyJS/lib/process.js').toString();


// Replace the require call at the beginning of the processor
proc = proc.replace('require("./parse-js")', 'uglify.parser');

// Do not add the require call
var stopToken = "exports.ast_squeeze_more";
proc = proc.substr(0, proc.indexOf(stopToken) - 1);

template = template.replace('/*UGLIFIER*/', proc);

// Save ...
var readableFile = __dirname + '/build/uglifyjs.' + version + '.js';
var uglifiedFile = __dirname + '/build/uglifyjs.' + version + '.min.js';
fs.writeFileSync(readableFile, template);

proc = null;
parser = null;



// ... and uglify
// This is mostly copied from UglifyJS/bin/uglifyjs

global.sys = require(/^v0\.[012]/.test(process.version) ? "sys" : "util");
var uglify = require("uglify-js"), // symlink ~/.node_libraries/uglify-js.js to ../uglify-js.js
	consolidator = uglify.consolidator,
	jsp = uglify.parser,
	pro = uglify.uglify;
var options = {
	ast: false,
	consolidate: false,
	mangle: true,
	mangle_toplevel: false,
	no_mangle_functions: false,
	squeeze: true,
	make_seqs: true,
	dead_code: true,
	verbose: false,
	show_copyright: true,
	out_same_file: false,
	max_line_length: 32 * 1024,
	unsafe: false,
	reserved_names: null,
	defines: { },
	lift_vars: false,
	codegen_options: {
		ascii_only: false,
		beautify: false,
		indent_level: 4,
		indent_start: 0,
		quote_keys: false,
		space_colon: false,
		inline_script: false
	},
	make: false,
	output: true            // stdout
};


function output(text) {
	fs.writeFileSync(uglifiedFile, text);
};


function show_copyright(comments) {
	var ret = "";
	for (var i = 0; i < comments.length; ++i) {
		var c = comments[i];
		if (c.type == "comment1") {
			ret += "//" + c.value + "\n";
		} else {
			ret += "/*" + c.value + "*/";
		}
	}
	return ret;
};

function squeeze_it(code) {
	var result = "";
	if (options.show_copyright) {
		var tok = jsp.tokenizer(code), c;
		c = tok();
		result += show_copyright(c.comments_before);
	}
	try {
		var ast = time_it("parse", function(){ return jsp.parse(code); });
		if (options.consolidate) ast = time_it("consolidate", function(){
			return consolidator.ast_consolidate(ast);
		});
		if (options.lift_vars) {
			ast = time_it("lift", function(){ return pro.ast_lift_variables(ast); });
		}
		if (options.mangle) ast = time_it("mangle", function(){
			return pro.ast_mangle(ast, {
				toplevel     : options.mangle_toplevel,
				defines      : options.defines,
				except       : options.reserved_names,
				no_functions : options.no_mangle_functions
			});
		});
		if (options.squeeze) ast = time_it("squeeze", function(){
			ast = pro.ast_squeeze(ast, {
				make_seqs  : options.make_seqs,
				dead_code  : options.dead_code,
				keep_comps : !options.unsafe
			});
			if (options.unsafe)
				ast = pro.ast_squeeze_more(ast);
			return ast;
		});
		if (options.ast)
			return sys.inspect(ast, null, null);
		result += time_it("generate", function(){ return pro.gen_code(ast, options.codegen_options) });
		if (!options.codegen_options.beautify && options.max_line_length) {
			result = time_it("split", function(){ return pro.split_lines(result, options.max_line_length) });
		}
		return result;
	} catch(ex) {
		sys.debug(ex.stack);
		sys.debug(sys.inspect(ex));
		sys.debug(JSON.stringify(ex));
		process.exit(1);
	}
};

function time_it(name, cont) {
	if (!options.verbose)
		return cont();
	var t1 = new Date().getTime();
	try { return cont(); }
	finally { sys.debug("// " + name + ": " + ((new Date().getTime() - t1) / 1000).toFixed(3) + " sec."); }
};


output(squeeze_it(template));

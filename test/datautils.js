/*
	Some data utilities for training data.
	
	node datautil.js <operation> [operation arguments]
		combine file1 ... fileN fileOut
			Combines multiple training data files into one
		convert fileIn fileOut
			Convert a training data file into json
		serve [port]
			Quick file server for web test (run in project root directory)
*/

var fs = require("fs");
var path = require("path");
var http = require("http");

if (process.argv.length < 3) {
	console.log("Usage: node datautil.js <operation> [operation arguments]");
	console.log("	combine file1 ... fileN fileOut");
	console.log("		Combines multiple training data files into one");
	console.log("	convert fileIn fileOut");
	console.log("		Convert a training data file into json");
}
else {
	var operation = process.argv[2];
	if (operation == "combine") {
		utilCombine(process.argv);
	}
	else if (operation == "convert") {
		utilConvert(process.argv);
	}
	else if (operation == "server") {
		utilServe(process.argv);
	}
}

function utilCombine(argv) {
	if (argv.length <= 3) {
		return;
	}
	var fout = argv[argv.length - 1];
	var fin = [];
	for (var i = 3; i < argv.length - 1; i++) {
		fin.push(argv[i]);
	}
	
	var traindata = new Map();
	
	var total = fin.length;
	fin.forEach(function(f) {
		fs.readFile(f, "utf8", function(err, data) {
			if (!err) {
				data.split("\n").forEach(function(l) {
					var parts = l.trim().split(":");
					if (parts.length == 3) {
						
						if (traindata.has(parts[0])) {
							var previous = traindata.get(parts[0]);
							traindata.set(parts[0], [ parseInt(parts[1]) + previous[0], parseInt(parts[2]) + previous[1] ]);
						}
						else {
							traindata.set(parts[0], [ parseInt(parts[1]), parseInt(parts[2]) ]);
						}
						
					}
				});
			}
			
			total--;
			if (total <= 0) {
				writeCombine();
			}
		});
	});
	
	function writeCombine() {
		var ws = fs.createWriteStream(fout);
		traindata.forEach(function(v, k) {
			ws.write(k + ":" + v[0] + ":" + v[1] + "\n");
		});
		ws.end();
	}
}

function utilConvert(argv) {
	if (argv.length < 5) {
		return;
	}
	
	var fin = argv[3];
	var fout = argv[4];
	
	var traindata = new Map();
	
	fs.readFile(fin, "utf8", function(err, data) {
		if (!err) {
			data.split("\n").forEach(function(l) {
				var parts = l.trim().split(":");
				if (parts.length == 3) {
					traindata.set(parts[0], [ parseInt(parts[1]), parseInt(parts[2]) ]);
				}
			});
			
			var ws = fs.createWriteStream(fout);
			ws.write("{\"data\":[");
			var first = true;
			traindata.forEach(function(v, k) {
				if (first) first = false;
				else ws.write(",");
				ws.write("\"" + k + "\"," + v[0] + "," + v[1]);
			});
			ws.write("]}");
			ws.end();
		}
	});
}

function utilServe(argv) {
	var port = 26282;
	if (argv.length >= 4) {
		port = parseInt(argv[3]);
	}
	
	var currentPath = path.resolve(".");
	
	var contentTypes = {
		"html": "text/html",
		"json": "application/json",
		"txt": "text/plain"
	};
	function getContentType(url) {
		var ext = url.substring(url.lastIndexOf(".")+1);
		if (contentTypes[ext] !== undefined) {
			return contentTypes[ext];
		}
		else {
			return "text/plain";
		}
	}
	
	var server = http.createServer(function(request, response) {
		console.log(request.url);
		var url = request.url;
		if (url == "/") {
			url = "/index.html";
		}
		var urlPath = path.resolve("." + url);
		if (urlPath.indexOf(currentPath) == 0) {
			fs.readFile(urlPath, function(err, data) {
				if (!err) {
					response.writeHead(200, { "Content-Type": getContentType(urlPath) });
					response.write(data);
				}
				else {
					response.writeHead(404, { "Content-Type": "text/plain" });
					response.write("Not Found\n");
				}
				response.end();
			});
		}
		else {
			response.writeHead(404, { "Content-Type": "text/plain" });
			response.write("Not Found\n");
			response.end();
		}
	});
	
	server.listen(port, function() {
		console.log("Listening on port " + port);
	});
}

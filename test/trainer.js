/*
	Minesweeper training
	
	node trainer.js <training data file> <times> <probability>
	
	Probability is the probability that a square will be opened no matter what,
	possibly allowing for better/faster training. (TODO)
*/

var fs = require("fs")
var Minsweeper = require("../build/Minsweeper.js");

var trainFile = "traindata";
var trainAmount = 1000;
var trainProbability = 0.2;

if (process.argv.length == 5) {
    trainFile = process.argv[2];
    trainAmount = parseInt(process.argv[3]);
    trainProbability = parseFloat(process.argv[4]);
}

fs.readFile(trainFile, "utf8", function(err, data) {
    var traindata = new Map();
    if (!err) {
        data.split("\n").forEach(function(l) {
            var parts = l.trim().split(":");
            if (parts.length == 3) {
                traindata.set(parts[0], [ parseInt(parts[1]), parseInt(parts[2]) ]);
            }
        });
    }
    
    startTraining(traindata);
});

function startTraining(traindata) {
    var width = 16;
    var height = 16;
    var mines = 40;
    var idlist = "BFU012345678";
    for (var i = 0; i < trainAmount; i++) {
        if (i % 20000 == 0) {
            console.log("Running game " + i);
        }
        
        var game = new Minsweeper(width, height, mines);
        game.open(~~(Math.random() * width), ~~(Math.random() * height));
        
        while (game.getState() != Minsweeper.DIED && game.getState() != Minsweeper.COMPLETED) {
            var board = game.getBoard2();
            
            // Find max probability
            var maxr = -1;
            var maxc = -1;
            var maxp = 0;
            var maxi = "";
            var maxd = [ 0, 0 ];
            // For each cell
            for (var r = 0; r < height; r++) {
                for (var c = 0; c < width; c++) {
                    
                    if (board[r][c] == -1) {
                        // Compute id
                        var id = "";
                        for (var dr = -2; dr <= 2; dr++) {
                            for (var dc = -2; dc <= 2; dc++) {
                                if (dr != 0 || dc != 0) {
                                    var nr = r + dr;
                                    var nc = c + dc;
                                    var d = -3;
                                    if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
                                        d = board[nr][nc];
                                    }
                                    id += idlist[d + 3];
                                }
                            }
                        }
                        
                        var probability = [ 0, 0 ];
                        var data = [ 0, 0 ];
                        if (traindata.has(id)) {
                            data = traindata.get(id);
                            probability = [ data[0], data[1] ];
                        }
                        if (maxr < 0 ||
                            (maxp[0] == 0 && probability[1] < maxp[1] ||
                                probability[0] / (probability[0] + probability[1]) > maxp[0] / (maxp[0] + maxp[1]))
                            ) {
                            maxr = r;
                            maxc = c;
                            maxp = probability;
                            maxi = id;
                            maxd = data;
                        }
                    }
                    
                }
            }
            
            //console.log(count + " " + maxr + " " + maxc + " : " + maxi + " : " + maxd);
            
            // Open the cell of max probability
            if (maxr >= 0) {
                var result = game.open(maxr, maxc);
                if (result == Minsweeper.Board.SAFE) {
                    maxd[0]++;
                }
                else if (result == Minsweeper.Board.MINE) {
                    maxd[1]++;
                }
                traindata.set(maxi, maxd);
            }
        }
    }
    
    saveTraining(traindata);
}

function saveTraining(traindata) {
    var ws = fs.createWriteStream(trainFile);
    traindata.forEach(function(v, k) {
        //console.log(k + ":" + v[0] + ":" + v[1]);
        ws.write(k + ":" + v[0] + ":" + v[1] + "\n");
    });
    ws.end();
}

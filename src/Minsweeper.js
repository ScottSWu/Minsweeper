var Minsweeper = function(width, height, mines, params) {
    params = (params === undefined) ? {} : params;
    
    this.width = width;
    this.height = height;
    this.mines = mines;
    if (params.firstSafe) {
        this.firstSafe = params.firstSafe;
    }
    
    this.reset();
}

Minsweeper.prototype.constructor = Minsweeper;

Minsweeper.NOTSTARTED = 0;
Minsweeper.STARTED = 1;
Minsweeper.DIED = 2;
Minsweeper.COMPLETED = 3;

/*
    Reset the game.
*/
Minsweeper.prototype.reset = function() {
    // 0 = beginning, 1 = running, 2 = died, 3 = completed
    this.startTime = -1;
    this.endTime = -1;
    
    this.state = Minsweeper.NOTSTARTED;
    this.started = false;
    
    this.board = new Minsweeper.Board(this.width, this.height, this.mines);
}

/*
    Get the current game time.
*/
Minsweeper.prototype.getTime = function(time) {
    switch (this.state) {
        default:
        case Minsweeper.NOTSTARTED:
            return 0;
        case Minsweeper.STARTED:
            return Date.now() - this.startTime;
        case Minsweeper.DIED:
        case Minsweeper.COMPLETED:
            return this.endTime - this.startTime;
    }
}

/*
    Open a certain coordinate in the game.
*/
Minsweeper.prototype.open = function(r, c) {
    var result = this.board.open(r, c);
    switch (result) {
        case Minsweeper.Board.SAFE:
        case Minsweeper.Board.MINE:
            if (!this.started) {
                this.startTime = Date.now();
                this.started = true;
                this.state = Minsweeper.STARTED;
            }
            break;
        default:
            break;
    }
    switch (result) {
        case Minsweeper.Board.SAFE:
            if (this.board.isCompleted()) {
                this.endTime = Date.now();
                this.state = Minsweeper.COMPLETED;
            }
            break;
        case Minsweeper.Board.MINE:
            this.endTime = Date.now();
            this.state = Minsweeper.DIED;
            break;
        default:
            break;
    }
    return result;
}

/*
    Chord a coordinate in the game.
*/
Minsweeper.prototype.chord = function(r, c) {
    var result = this.board.chord(r, c);
    return result;
}

/*
    Flag a coordinate in the game.
*/
Minsweeper.prototype.flag = function(r, c) {
    var result = this.board.flag(r, c);
    return result;
}

/*
    Get a flattened array of the visible board.
*/
Minsweeper.prototype.getBoard = function() {
    return this.board.getVisible();
}

/*
    Get a 2-d array of the visible board.
*/
Minsweeper.prototype.getBoard2 = function() {
    var array1 = this.board.getVisible();
    var array2 = [];
    var offset = 0;
    for (var r = 0; r < this.height; r++) {
        array2.push([]);
        for (var c = 0; c < this.width; c++) {
            array2[r].push(array1[offset]);
            offset++;
        }
    }
    return array2;
}

/*
    log the board to the console.
*/
Minsweeper.prototype.logBoard = function() {
    var board = this.board.getVisible();
    var output = "";
    var offset = 0;
    for (var r = 0; r < this.height; r++) {
        for (var c = 0; c < this.width; c++) {
            switch (board[offset]) {
                case -2:
                    output += "P";
                    break;
                case -1:
                    output += "O";
                    break;
                default:
                    output += board[offset];
                    break;
            }
            output += " ";
            offset++;
        }
        output += "\n";
    }
    console.log(output);
}

/*
    Check if the game has started.
*/
Minsweeper.prototype.getState = function() {
    return this.state;
}


/**
	If required, add to exports
*/
try {
	module.exports = Minsweeper;
}
catch (e) {
	
}

Minsweeper.Board = function(width, height, mines) {
    this.width = width;
    this.height = height;
    this.maxoffset = width * height;
    this.mines = mines;
    this.opened = 0;
    this.flagged = 0;
    // -1 = mine, 0-8 = number
    this.grid = [];
    // 0 = hidden, 1 = revealed, 2 = flagged
    this.status = [];
    // 0-8 = number, -1 = unknown, -2 = flagged, 9 = mine
    this.visible = [];
    
    // Populate mines and squares
    for (var i = 0; i < width * height && i < mines; i++) {
        this.grid.push(-1);
        this.status.push(0);
        this.visible.push(-1);
    }
    for (var i = mines; i < width * height; i++) {
        this.grid.push(0);
        this.status.push(0);
        this.visible.push(-1);
    }
    
    var instance = this;
    
    // Fisher-Yates shuffle
    for (var i = width * height - 1; i >= 1; i--) {
        var r = ~~(Math.random() * (i + 1));
        var t = this.grid[i];
        this.grid[i] = this.grid[r];
        this.grid[r] = t;
    }
    
    // Compute numbers
    for (var r = 0; r < height; r++) {
        for (var c = 0; c < width; c++) {
            var offset = this.c2o(r, c);
            if (this.grid[offset] == 0) {
                // Count mines
                var count = 0;
                Minsweeper.Board.SURROUNDING.forEach(function(coord) {
                    var nr = r + coord[0];
                    var nc = c + coord[1];
                    var no = instance.c2o(nr, nc);
                    if (instance.inBounds(nr, nc) && instance.grid[no] < 0) {
                        count++;
                    }
                });
                
                this.grid[offset] = count;
            }
        }
    }
}

Minsweeper.Board.prototype.constructor = Minsweeper.Board;

Minsweeper.Board.SURROUNDING = [
    [ -1, -1 ], [ -1, 0 ], [ -1, 1 ],
    [ 0, -1 ], [ 0, 1 ],
    [ 1, -1 ], [ 1, 0 ], [ 1, 1 ]
];
Minsweeper.Board.ALREADYOPENED = 10;
Minsweeper.Board.FLAGGED = 11;
Minsweeper.Board.UNFLAGGED = 12;
Minsweeper.Board.OUTOFBOUNDS = 13;
Minsweeper.Board.INVALID = 14;
Minsweeper.Board.SAFE = 20;
Minsweeper.Board.MINE = 21;

/*
    Check if a coordinate is in bounds.
*/
Minsweeper.Board.prototype.inBounds = function(r, c) {
    return r >= 0 && r < this.height && c >= 0 && c < this.width;
}

/*
    Convert coordinate to array offset.
*/
Minsweeper.Board.prototype.c2o = function(r, c) {
    return r * this.width + c;
}

/*
    Convert array offset to coordinate.
*/
Minsweeper.Board.prototype.o2c = function(x) {
    return { r: ~~(x / this.width), c: x % this.width };
}

/*
    Open a coordinate.
*/
Minsweeper.Board.prototype.open = function(r, c) {
    var instance = this;
    
    if (this.inBounds(r, c)) {
        var offset = this.c2o(r, c);
        if (this.status[offset] == 1) {
            return Minsweeper.Board.ALREADYOPENED;
        }
        if (this.status[offset] == 2) {
            return Minsweeper.Board.FLAGGED;
        }
        if (this.grid[offset] == -1) {
            return Minsweeper.Board.MINE;
        }
        
        if (this.grid[offset] == 0) {
            var openstack = [ [ r, c ] ];
            while (openstack.length > 0) {
                var coords = openstack.pop();
                var offset = this.c2o(coords[0], coords[1]);
                this.status[offset] = 1;
                this.visible[offset] = this.grid[offset];
                this.opened++;
                
                if (this.grid[offset] == 0) {
                    Minsweeper.Board.SURROUNDING.forEach(function(coord) {
                        var nr = coords[0] + coord[0];
                        var nc = coords[1] + coord[1];
                        var no = instance.c2o(nr, nc);
                        if (instance.inBounds(nr, nc) && instance.status[no] == 0) {
                            openstack.push([ nr, nc ]);
                        }
                    });
                }
            }
        }
        else {
            this.status[offset] = 1;
            this.visible[offset] = this.grid[offset];
            this.opened++;
        }
        return Minsweeper.Board.SAFE;
    }
    else {
        return Minsweeper.Board.OUTOFBOUNDS;
    }
}

/*
    Chord a coordinate.
*/
Minsweeper.Board.prototype.chord = function(r, c) {
    var instance = this;
    
    if (this.inBounds(r, c)) {
        var offset = this.c2o(r, c);
        switch (this.status[offset]) {
            case 1:
                var needed = this.grid[offset];
                var flags = 0;
                Minsweeper.Board.SURROUNDING.forEach(function(coord) {
                    var nr = r + coord[0];
                    var nc = c + coord[1];
                    var no = instance.c2o(nr, nc);
                    if (instance.inBounds(nr, nc) && instance.status[no] == 2) {
                        flags++;
                    }
                });
                
                if (flags == needed) {
                    var result = Minsweeper.Board.SAFE;
                    Minsweeper.Board.SURROUNDING.forEach(function(coord) {
                        var nr = r + coord[0];
                        var nc = c + coord[1];
                        var no = instance.c2o(nr, nc);
                        if (instance.inBounds(nr, nc) && instance.status[no] == 0) {
                            if (instance.open(nr, nc) == Minsweeper.Board.MINE) {
                                result = Minsweeper.Board.MINE;
                            }
                        }
                    });
                    return result;
                }
                else {
                    return Minsweeper.Board.INVALID;
                }
            default:
                return Minsweeper.Board.INVALID;
        }
    }
    else {
        return Minsweeper.Board.OUTOFBOUNDS;
    }
}

/*
    Flag a coordinate.
*/
Minsweeper.Board.prototype.flag = function(r, c) {
    if (this.inBounds(r, c)) {
        var offset = this.c2o(r, c);
        switch (this.status[offset]) {
            case 0:
                this.flagged++;
                this.status[offset] = 2;
                this.visible[offset] = -2;
                return Minsweeper.Board.FLAGGED;
            case 2:
                this.flagged--;
                this.status[offset] = 0;
                this.visible[offset] = -1;
                return Minsweeper.Board.UNFLAGGED;
            default:
            case 1:
                return Minsweeper.Board.ALREADYOPENED;
        }
    }
    else {
        return Minsweeper.Board.OUTOFBOUNDS;
    }
}

/*
    Generate the visible board.
*/
Minsweeper.Board.prototype.getVisible = function() {
    return this.visible;
}

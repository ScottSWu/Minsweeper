# Minsweeper
Minimal Javascript Minesweeper implementation

Create a new easy difficulty Minsweeper board:
```
var m = new Minsweeper(9, 9, 10);
```

Create a new expert difficulty Minsweeper board:
```
var m = new Minweeper(16, 30, 99);
```

Open the 5th row and 9th column square on the board:
```
m.open(4, 8);
```

Flag the 5th row and 9th column square on the board:
```
m.flag(4, 8);
```

Chord the 5th row and 9th column square on the board:
```
m.chord(4, 8);
```

Obtain the current visible board (-2 = flag, -1 = unknown):
```
m.getBoard();  // flattened array
m.getBoard2(); // 2-d array
```

Log the board to the console:
```
m.logBoard();
```

Reset the board and timer:
```
m.reset();
```

Get the timer:
```
m.getTime();
```

Check if the game has not started, has started, or has ended (due to mine or completion):
```
m.getState() == Minsweeper.NOTSTARTED
m.getState() == Minsweeper.STARTED
m.getState() == Minsweeper.DIED
m.getState() == Minsweeper.COMPLETED
```

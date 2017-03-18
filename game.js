var freeze = false;
/**
 * Game class
 * @returns {Game}
 */
var Game = function() {
    
    this.grid = document.getElementById('grid');
    this.tileBox = document.getElementById('tile-box');
    
    this.scoreBox = document.getElementById('score-box');
    this.scoreDisplay = document.getElementById('score');
    this.bestDisplay = document.getElementById('best');
    
    this.newGameButton = document.getElementById('new-game');
    this.demoButton = document.getElementById('demo-game');
    this.stopDemoButton = document.getElementById('stop-demo-game');
    
    this.gameOverBox = document.getElementById('game-over-box');
    
    this.demoBox = document.getElementById('demo-box');
    this.demo = null;
    
    // Mapping tiles to cells
    this.tiles;
    // All cells with moved tiles after one swipe/drag
    this.movedCells;
    // Tracks number of each color in the grid
    this.colorPool;
    
    this.score;
    // Every time the score is changed, this gets incremented by 1
    this.scoreHits;
    // The best score ever
    this.best = 0;
    // game-over flag
    this.gameOver;
    // Moving tiles is blocked
    this.blockMove;
    // Cell key and coordinates where a swipe/drag started
    this.touchStartParams = {cell: null, x: null, y: null};
    
    this.demo = new Demo(this);
    
    this.reset();
    this.restoreState();
    this.bindEvents();
};

/**
 * Reset all properties to its default values
 * @returns {undefined}
 */
Game.prototype.reset = function() {
    
    this.gameOverBox.classList.remove('game-over');
    this.demoBox.classList.add('hidden');
    
    while (this.tileBox.firstChild) {
        this.tileBox.removeChild(this.tileBox.firstChild);
    }
    
    this.tiles = {
        a: null, b: null, c: null, d: null,
        e: null, f: null, g: null, h: null,
        i: null, j: null, k: null, l: null,
        m: null, n: null, o: null, p: null
    };
    
    this.score = 0;
    this.colorPool = [10, 10, 10];
    this.updateScoreDisplay();
    this.gameOver = false;
    this.blockMove = false;
    this.scoreHits = 0;
};

/**
 * Restore game state
 * @returns {undefined}
 */
Game.prototype.restoreState = function() {
    
    if (localStorage) {
        
        var tilesJson = localStorage.getItem('tiles');
        if (tilesJson) {
            var tiles = JSON.parse(tilesJson);
            var tile;
            for (var i = 0; i < tiles.length; i++) {
                tile = tiles[i];
                this.tiles[tile.cell] = new Tile(tile.cell, tile.color, this.tileBox);
            }
        }
        
        var best = localStorage.getItem('best');
        if (best) {
            this.best = parseInt(best);
            if (isNaN(this.best)) {
                this.best = 0;
            }
            this.bestDisplay.textContent = this.best;
        }
        
        var score = localStorage.getItem('score');
        if (score) {
            this.score = parseInt(score);
            if (isNaN(this.score)) {
                this.score = 0;
            }
            this.updateScoreDisplay();
        }
        
        var over = localStorage.getItem('gameOver');
        if (over) {
            this.gameOver = over == 'true' ? true : false;
            if (this.gameOver) {
                this.gameOverBox.classList.add('game-over');
            }
        }
        
        var colorPool = localStorage.getItem('colorPool');
        if (colorPool) {
            this.colorPool = JSON.parse(colorPool);
        }
        
        var scoreHits = localStorage.getItem('scoreHits');
        if (scoreHits) {
            this.scoreHits = parseInt(scoreHits);
            if (isNaN(this.scoreHits)) {
                this.scoreHits = 0;
            }
        }
    }
};

/**
 * Restore game state for BEST
 * @returns {undefined}
 */
Game.prototype.restoreStateBest = function() {
    
    if (localStorage) {
        
        var best = localStorage.getItem('best');
        if (best) {
            this.best = parseInt(best);
            if (isNaN(this.best)) {
                this.best = 0;
            }
            this.bestDisplay.textContent = this.best;
        }
    }
}

/**
 * Save game state - state is saved to localStorage
 * @returns {undefined}
 */
Game.prototype.saveState = function() {
    
    if (!this.demo.running && localStorage) {
        
        localStorage.setItem('score', this.score);
        localStorage.setItem('best', this.best);
        
        localStorage.setItem('gameOver', this.gameOver);
        
        localStorage.setItem('scoreHits', this.scoreHits);
        localStorage.setItem('colorPool', JSON.stringify(this.colorPool));
        
        var tiles = [], tile;
        for (var cell in this.tiles) {
            tile = this.tiles[cell];
            if (tile) {
                tiles.push({cell: cell, color: tile.color});
            }
        }
        
        localStorage.setItem('tiles', JSON.stringify(tiles));
    }
};

/**
 * Bind DOM events
 * @returns {undefined}
 */
Game.prototype.bindEvents = function() {
    
    var self = this;
    
    // NEW GAME button
    this.newGameButton.onclick = function() {
        self.newGame();
    };
    
    // DEMO button
    this.demoButton.onclick = function() {
        self.demo.start();
    };
    
    // STOP DEMO button
    this.stopDemoButton.onclick = function() {
        self.demo.stop();
        self.reset();
        self.restoreState();
    };
    
    
    // TOUCH EVENTS
    
    this.ms = window.navigator.msPointerEnabled;
    var touchStartEvent, touchMoveEvent, touchEndEvent;
    
    if (this.ms) {
        touchStartEvent = "MSPointerDown";
        touchMoveEvent = "MSPointerMove";
        touchEndEvent = "MSPointerUp";
    } else {
        touchStartEvent = "touchstart";
        touchMoveEvent = "touchmove";
        touchEndEvent = "touchend";
    }
    
    // Grid
    this.grid.addEventListener(touchStartEvent, function (event) {
        self.touchStartHandler(event, 1);
    });
    this.grid.addEventListener(touchMoveEvent, function (event) {
        event.preventDefault();
    });
    this.grid.addEventListener(touchEndEvent, function (event) {
        self.touchEndHandler(event);
    });
    
    // Tiles
    this.tileBox.addEventListener(touchStartEvent, function (event) {
        self.touchStartHandler(event, 0);
    });
    this.tileBox.addEventListener(touchMoveEvent, function (event) {
        event.preventDefault();
    });
    this.tileBox.addEventListener(touchEndEvent, function (event) {
        self.touchEndHandler(event);
    });
    
    
    // MOUSE EVENTS
    
    document.addEventListener('mousedown', function() {
        self.touchStartParams.cell = null;
    });
    document.addEventListener('mouseup', function() {
        self.touchStartParams.cell = null;
        self.blockMove = false;
    });
    
    // Grid
    this.grid.addEventListener('mousedown', function (event) {
        self.mouseDownHandler(event, 1);
    });
    this.grid.addEventListener('mouseup', function (event) {
        self.mouseUpHandler(event);
    });
    
    // Tiles
    this.tileBox.addEventListener('mousedown', function (event) {
        self.mouseDownHandler(event, 0);
    });
    this.tileBox.addEventListener('mouseup', function (event) {
        self.mouseUpHandler(event);
    });
    
};

/**
 * Start new game
 * @returns {undefined}
 */
Game.prototype.newGame = function() {
    
    if (this.demo.running) {
        this.demo.stop();
        this.reset();
        this.restoreStateBest();
    } else {
        this.reset();
    }
    
    this.saveState();
};

/**
 * Save cell and coordinates where the event occurred
 * @param {Object} event Event object
 * @param {Boolean} targetIsGrid Target of the event is the grid 
 *                               (false if target is a tile)
 * @returns {undefined}
 */
Game.prototype.touchStartHandler = function(event, targetIsGrid) {
    
    if (this.blockMove) {
        this.touchStartParams.cell = null;
    } else {
        
        if (targetIsGrid) {
            this.touchStartParams.cell = event.target.dataset.cell;
        } else {
            this.touchStartParams.cell = event.target.offsetParent.dataset.cell;
        }
        
        if (this.touchStartParams.cell) {
            this.blockMove = true;
            
            if (this.ms) {
                this.touchStartParams.x = event.pageX;
                this.touchStartParams.y = event.pageY;
            } else {
                this.touchStartParams.x = event.changedTouches[0].clientX;
                this.touchStartParams.y = event.changedTouches[0].clientY;
            }
        }
    }
    
    event.preventDefault();
};

/**
 * Get new coordinates, get direction and move tiles
 * @param {Object} event Event object
 * @returns {undefined}
 */
Game.prototype.touchEndHandler = function(event) {
    
    if (!this.touchStartParams.cell) {
        
        if ((!this.ms && event.touches.length == 0) || event.targetTouches.length == 0) {
            this.blockMove = false;
        }
        return;
    }
    
    var x, y;
    
    if (this.ms) {
        x = event.pageX;
        y = event.pageY;
    } else {
        x = event.changedTouches[0].clientX;
        y = event.changedTouches[0].clientY;
    }
    
    var dX = x - this.touchStartParams.x;
    var absX = Math.abs(dX);
    
    var dY = y - this.touchStartParams.y;
    var absY = Math.abs(dY);
    
    if (Math.max(absX, absY) > 10) {
        var direction = absX > absY ? (dX > 0 ? 'r' : 'l') : (dY > 0 ? 'd' : 'u');
        this.moveTiles(this.touchStartParams.cell, direction);
    } else {
        this.blockMove = false;
    }
};

/**
 * Save cell and coordinates where the event occurred
 * @param {Object} event Event object
 * @param {Boolean} targetIsGrid Target of the event is the grid 
 *                               (false if target is a tile)
 * @returns {undefined}
 */
Game.prototype.mouseDownHandler = function(event, targetIsGrid) {
    
    if (this.blockMove) {
        this.touchStartParams.cell = null;
    } else {
        event.stopPropagation();
        
        if (targetIsGrid) {
            this.touchStartParams.cell = event.target.dataset.cell;
        } else {
            this.touchStartParams.cell = event.target.offsetParent.dataset.cell;
        }
        
        if (this.touchStartParams.cell) {
            this.blockMove = true;
        }
        
        this.touchStartParams.x = event.clientX;
        this.touchStartParams.y = event.clientY;
    }
};

/**
 * Get new coordinates, get direction and move tiles
 * @param {Object} event Event object
 * @returns {undefined}
 */
Game.prototype.mouseUpHandler = function(event) {
    
    event.stopPropagation();
    
    if (!this.touchStartParams.cell) {
        return;
    }
    
    var dX = event.clientX - this.touchStartParams.x;
    var absX = Math.abs(dX);
    var dY = event.clientY - this.touchStartParams.y;
    var absY = Math.abs(dY);
    
    if (Math.max(absX, absY) > 10) {
        var direction = absX > absY ? (dX > 0 ? 'r' : 'l') : (dY > 0 ? 'd' : 'u');
        this.moveTiles(this.touchStartParams.cell, direction);
    } else {
        this.blockMove = false;
    }
};

/**
 * Move all tiles in a row/column and add new tile at the row's/column's end
 * @param {String} cell Key of the swiped cell ('a', 'b', ..., 'p')
 * @param {String} direction Key of the direction ('l' | 'r' | 'b' | 'u')
 * @returns {undefined}
 */
Game.prototype.moveTiles = function(cell, direction) {
    
    var cells = Game.cellDirectionMap[cell][direction].slice(0);
    
    this.movedCells = [];
    
    var tile;
    for (var i = 0; i < 4; i++) {
        cell = cells[i];
        tile = this.tiles[cell];
        if (tile) {
            this.moveTile(tile, direction);
        }
    }
    
    if (!this.tiles[cell]) {
        this.addNewTile(cell,direction);
        this.check5plus();
        this.checkGameOver();
    } else {
        this.blockMove = false;
    }
};

/**
 * Move a tile in a direction
 * @param {Tile} tile Tile object
 * @param {String} direction Key of the direction ('l' | 'r' | 'b' | 'u')
 * @returns {undefined}
 */
Game.prototype.moveTile = function(tile, direction) {
    
    var oldCell = tile.cell;
    var newCell = Game.cellDirectionBorderMap[oldCell][direction];
    
    if (newCell && !this.tiles[newCell]) {
        tile.move(newCell);
        this.tiles[oldCell] = null;
        this.tiles[newCell] = tile;
        this.movedCells.push(newCell);
    }
};

/**
 * Add a new tile
 * @param {String} cell Key of the swiped cell ('a', 'b', ..., 'p')
 * @returns {undefined}
 */
Game.prototype.addNewTile = function(cell, direction) {
    
    var color = this.generateRandomColor();
    this.tiles[cell] = new Tile(cell, color, this.tileBox);
    this.movedCells.push(cell);
};

/**
 * Generate random number of these: 0, 1, 2
 * After every 15 score-hits, a game progressively gets harder to play
 * by increasing chance for a color with the least presence in the grid
 * @returns {Number} Color index - 0 for white, 1 for red, 2 for blue
 */
Game.prototype.generateRandomColor = function() {
    
    if (this.demo.running) {
        return this.demo.color;
    }
    
    var levelCoefficient = (4 - Math.floor(this.scoreHits / Game.levelStep)) / 4;
    if (levelCoefficient < 0) {
        levelCoefficient = 0;
    }
    
    var whiteArea = 1 / 3;
    var redArea = 2 / 3;
    
    if (levelCoefficient < 1) {
        var white = this.colorPool[0];
        var red = this.colorPool[1];
        var blue = this.colorPool[2];
        
        var pool = white + red + blue;
        
        whiteArea = (white / pool) * (1 - levelCoefficient) + levelCoefficient / 3;
        redArea = (red / pool) * (1 - levelCoefficient) + levelCoefficient / 3 + whiteArea;
    }
    
    var rnd = Math.random();
    var newColor;
    
    if (rnd < whiteArea) {
        newColor = 0;
    } else if (rnd < redArea) {
        newColor = 1;
    } else {
        newColor = 2;
    }
    
    if (this.colorPool[newColor] > 0) {
        this.colorPool[newColor]--;
    }
    
    return newColor;
};

/**
 * Check if there are 5 or more joined same-color tiles. If yes, score and remove them
 * @returns {undefined}
 */
Game.prototype.check5plus = function() {
    
    var movedCell,
        aggregatedCells, aggregatedCount, aggregatedScore = 0,
        tempCells, tempCell, tempTile,
        borderCells, borderCell, borderTile;
    
    while (this.movedCells.length > 0) {
        
        movedCell = this.movedCells.shift();
        tempCells = [movedCell];
        aggregatedCells = [movedCell];
        
        while (tempCells.length > 0) {
            
            tempCell = tempCells.shift();
            tempTile = this.tiles[tempCell];
            borderCells = Game.cellBorderMap[tempCell];
            
            for (var i = 0; i < borderCells.length; i++) {
                
                borderCell = borderCells[i];
                borderTile = this.tiles[borderCell];
                
                if (borderTile && borderTile.color == tempTile.color && aggregatedCells.indexOf(borderCell) === -1) {
                    aggregatedCells.push(borderCell);
                    tempCells.push(borderCell);
                    
                    var i = this.movedCells.indexOf(borderCell);
                    if (i > -1) {
                        this.movedCells.splice(i, 1);
                    }
                }
            }
        }
        
        aggregatedCount = aggregatedCells.length;
        if (aggregatedCount > 4) {
            this.removeTiles(aggregatedCells, tempTile.color);
            aggregatedScore += this.getScore(aggregatedCount);
        }
    }
    
    if (aggregatedScore) {
        this.score += aggregatedScore;
        this.updateScoreDisplay(aggregatedScore);
        this.scoreHits++;
    } else {
        this.blockMove = false;
        this.saveState();
    }
};

/**
 * Check if a game is over and if yes - show 'GAME OVER' message
 * @returns {undefined}
 */
Game.prototype.checkGameOver = function() {
    
    if (document.getElementsByClassName('tile-joined').length == 0 && document.getElementsByClassName('tile').length == 16) {
        this.gameOver = true;
        this.gameOverBox.classList.add('game-over');
        this.saveState();
    }
};

/**
 * Calculate and return score: 1 for first tile + 2 for second + ...
 * @param {Number} tilesCount Number of joined tiles (5 or more)
 * @returns {Number} Score
 */
Game.prototype.getScore = function(tilesCount) {
    
    var half = tilesCount / 2;
    return Math.ceil(half) * (Math.floor(half) * 2 + 1);
};

/**
 * Remove tiles
 * @param {Array} cells Array of cell keys - tiles from the cells are removed
 * @param {Number} color Color index of the tiles being removed
 * @returns {undefined}
 */
Game.prototype.removeTiles = function(cells, color) {
    
    var self = this;
    var cellsCount = cells.length;
    cells.sort();
    
    for (var i = 0; i < cellsCount; i++) {
        this.tiles[cells[i]] = null;
    }
    
    var selector = '.tile.' + cells.join(', .tile.');
    var tileElements = this.tileBox.querySelectorAll(selector);
    
    var cell, tileScore;
    for (var i = 0; i < cellsCount; i++) {
        cell = tileElements[i].dataset.cell;
        tileScore = cells.indexOf(cell) + 1;
        tileElements[i].firstChild.textContent = tileScore;
        if (freeze) {
            tileElements[i].classList.add('tile-joinedf');
        } else {
            tileElements[i].classList.add('tile-joined');
        }
    }
    
    setTimeout(function() {
        if (!freeze) {
            for (var i = 0; i < cellsCount; i++) {
                self.tileBox.removeChild(tileElements[i]);
            }
        }
        
        self.blockMove = false;
        self.saveState();
    }, 600);
    
    this.colorPool[color] += cellsCount;
};

/**
 * Update Score and Best displays
 * @param {Number} addedScore New score to add
 * @returns {undefined}
 */
Game.prototype.updateScoreDisplay = function(addedScore) {
    
    this.scoreDisplay.textContent = this.score;
    
    if (addedScore) {
        var element = document.createElement('div');
        element.classList.add('new-score');
        if (freeze) {
            element.classList.add('freeze');
        }
        element.textContent = '+' + addedScore;
        this.scoreDisplay.appendChild(element);
    }
    
    if (this.score > this.best) {
        this.best = this.score;
        this.bestDisplay.textContent = this.best;
    }
};


/**
 * Tile class
 * @param {String} cell Cell key - 'a', 'b', ..., 'p'
 * @param {Number} color Color index - 0, 1 or 2
 * @param {DOM} tileBox Tile container div element
 * @returns {Tile}
 */
var Tile = function(cell, color, tileBox) {
    
    this.cell = cell;
    this.color = color;
    
    this.element = document.createElement('div');
    this.element.className = 'tile tile-' + this.color + ' ' + this.cell;
    this.element.dataset.cell = this.cell;
    
    var innerElement = document.createElement('div');
    innerElement.className = 'tile-inner';
    this.element.appendChild(innerElement);
    
    tileBox.appendChild(this.element);
};

/**
 * Move to a new grid cell
 * @param {String} newCell Cell key
 * @returns {undefined}
 */
Tile.prototype.move = function(newCell) {
    
    this.element.classList.remove(this.cell);
    this.element.classList.add(newCell);
    this.element.dataset.cell = newCell;
    this.cell = newCell;
};


/* Object for mapping a cell and a direction to its border cells */
Game.cellDirectionBorderMap = {
    a: {l: null, r: 'b', u: null, d: 'e'}, b: {l: 'a', r: 'c', u: null, d: 'f'}, c: {l: 'b', r: 'd', u: null, d: 'g'}, d: {l: 'c', r: null, u: null, d: 'h'},
    e: {l: null, r: 'f', u: 'a', d: 'i'}, f: {l: 'e', r: 'g', u: 'b', d: 'j'}, g: {l: 'f', r: 'h', u: 'c', d: 'k'}, h: {l: 'g', r: null, u: 'd', d: 'l'},
    i: {l: null, r: 'j', u: 'e', d: 'm'}, j: {l: 'i', r: 'k', u: 'f', d: 'n'}, k: {l: 'j', r: 'l', u: 'g', d: 'o'}, l: {l: 'k', r: null, u: 'h', d: 'p'},
    m: {l: null, r: 'n', u: 'i', d: null}, n: {l: 'm', r: 'o', u: 'j', d: null}, o: {l: 'n', r: 'p', u: 'k', d: null}, p: {l: 'o', r: null, u: 'l', d: null}
};

/* Object for mapping a cell to its border cells */
Game.cellBorderMap = {
    a: ['b', 'e'], b: ['a', 'c', 'f'], c: ['b', 'd', 'g'], d: ['c', 'h'],
    e: ['a', 'f', 'i'], f: ['b', 'e', 'g', 'j'], g: ['c', 'f', 'h', 'k'], h: ['d', 'g', 'l'],
    i: ['e', 'j', 'm'], j: ['f', 'i', 'k', 'n'], k: ['g', 'j', 'l', 'o'], l: ['h', 'k', 'p'],
    m: ['i', 'n'], n: ['j', 'm', 'o'], o: ['k', 'n', 'p'], p: ['l', 'o']
};

/* Object for mapping a cell and a direction to row/column cells */
Game.cellDirectionMap = {
    a: {l: ['a', 'b', 'c', 'd'], r: ['d', 'c', 'b', 'a'], u: ['a', 'e', 'i', 'm'], d: ['m', 'i', 'e', 'a']},
    b: {l: ['a', 'b', 'c', 'd'], r: ['d', 'c', 'b', 'a'], u: ['b', 'f', 'j', 'n'], d: ['n', 'j', 'f', 'b']},
    c: {l: ['a', 'b', 'c', 'd'], r: ['d', 'c', 'b', 'a'], u: ['c', 'g', 'k', 'o'], d: ['o', 'k', 'g', 'c']},
    d: {l: ['a', 'b', 'c', 'd'], r: ['d', 'c', 'b', 'a'], u: ['d', 'h', 'l', 'p'], d: ['p', 'l', 'h', 'd']},
    e: {l: ['e', 'f', 'g', 'h'], r: ['h', 'g', 'f', 'e'], u: ['a', 'e', 'i', 'm'], d: ['m', 'i', 'e', 'a']},
    f: {l: ['e', 'f', 'g', 'h'], r: ['h', 'g', 'f', 'e'], u: ['b', 'f', 'j', 'n'], d: ['n', 'j', 'f', 'b']},
    g: {l: ['e', 'f', 'g', 'h'], r: ['h', 'g', 'f', 'e'], u: ['c', 'g', 'k', 'o'], d: ['o', 'k', 'g', 'c']},
    h: {l: ['e', 'f', 'g', 'h'], r: ['h', 'g', 'f', 'e'], u: ['d', 'h', 'l', 'p'], d: ['p', 'l', 'h', 'd']},
    i: {l: ['i', 'j', 'k', 'l'], r: ['l', 'k', 'j', 'i'], u: ['a', 'e', 'i', 'm'], d: ['m', 'i', 'e', 'a']},
    j: {l: ['i', 'j', 'k', 'l'], r: ['l', 'k', 'j', 'i'], u: ['b', 'f', 'j', 'n'], d: ['n', 'j', 'f', 'b']},
    k: {l: ['i', 'j', 'k', 'l'], r: ['l', 'k', 'j', 'i'], u: ['c', 'g', 'k', 'o'], d: ['o', 'k', 'g', 'c']},
    l: {l: ['i', 'j', 'k', 'l'], r: ['l', 'k', 'j', 'i'], u: ['d', 'h', 'l', 'p'], d: ['p', 'l', 'h', 'd']},
    m: {l: ['m', 'n', 'o', 'p'], r: ['p', 'o', 'n', 'm'], u: ['a', 'e', 'i', 'm'], d: ['m', 'i', 'e', 'a']},
    n: {l: ['m', 'n', 'o', 'p'], r: ['p', 'o', 'n', 'm'], u: ['b', 'f', 'j', 'n'], d: ['n', 'j', 'f', 'b']},
    o: {l: ['m', 'n', 'o', 'p'], r: ['p', 'o', 'n', 'm'], u: ['c', 'g', 'k', 'o'], d: ['o', 'k', 'g', 'c']},
    p: {l: ['m', 'n', 'o', 'p'], r: ['p', 'o', 'n', 'm'], u: ['d', 'h', 'l', 'p'], d: ['p', 'l', 'h', 'd']}
};

/* Every 15 score-hits a game becomes harder to play progressively  */
Game.levelStep = 15;

new Game;
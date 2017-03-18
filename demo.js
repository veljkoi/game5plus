/**
 * Demo class
 */
var Demo = function(game) {
    
    this.game = game;
    
    this.moves = [
        ["a","r",1],["a","r",0],["a","r",1],["a","r",1],["d","d",2],["d","d",1],["d","d",2],["m","l",2],["c","u",2],["c","u",2],["e","l",1],["d","d",0],["a","u",2],["a","u",1],["a","u",1],["a","u",2],["m","r",2],["m","r",2],["a","r",0],["b","d",1],["b","d",1],["e","l",2],["d","d",1],["i","l",1],["d","d",2],["m","l",1],["c","u",0],["m","l",2],["e","l",2],["i","l",1],["i","l",2],["b","u",1],["b","u",2],["m","r",2],["i","l",2],["d","d",1],["d","d",0],["e","l",2],["e","l",2],["c","d",0],["d","d",2],["d","d",2],["e","l",2],["d","d",0],["d","d",0],["m","l",1],["m","l",2],["c","u",2],["a","l",1],["a","l",1],["d","d",1],["c","d",1],["a","r",0],["a","r",1],["b","d",1],["e","r",0],["e","r",0],["e","r",2],["a","d",2],["e","r",2],["d","u",2],["m","l",1],["m","l",0],["m","l",1],["d","u",0],["i","l",2],["c","u",1],["b","d",1],["d","u",0],["e","l",0],["a","u",1],["i","r",2],["b","u",1],["c","d",2],["a","r",1],["a","d",2],["a","d",2],["a","l",1],["a","l",1],["i","r",0],["b","u",0],["m","r",1],["d","d",0],["e","l",1],["i","r",0],["i","r",0],["d","d",2],["a","l",1],["d","d",0],["d","d",2],["e","l",0],["m","r",1],["i","l",2],["c","d",2],["a","r",1],["a","d",1],["a","d",1],["m","l",0],["d","d",1],["e","r",1],["e","r",2],["b","u",2],["e","r",2],["b","u",0],["e","r",0],["a","d",0],["a","d",1],["a","d",0],["e","r",0],["a","l",1],["d","u",1],["d","u",1],["d","u",2],["m","r",1],["i","l",1],["i","l",1],["i","l",0],["c","d",2],["b","d",0],["i","l",2],["e","l",0],["e","l",1],["b","d",1],["e","l",2],["e","l",2],["b","d",2],["a","l",2],["a","l",0],["a","l",0],["b","u",1],["m","r",0],["m","r",2],["b","u",2],["i","r",2],["b","u",0],["a","u",0],["d","d",0],["m","r",2],["c","d",0],["m","l",1],["m","l",1],["c","d",1],["c","d",0],["c","d",1],["a","r",0],["d","d",1],["d","d",2],["d","d",0],["d","d",0],["a","r",1],["a","r",0],["a","d",0],["e","l",2],["d","d",2],["m","r",1],["m","r",1],["d","d",0],["b","d",2],["b","d",0],["e","r",1],["a","d",0],["a","l",2],["d","u",1],["m","l",2],["d","u",1],["d","u",2],["i","l",1],["i","l",1],["i","l",1],["e","r",0],["m","r",0],["b","u",0],["c","u",1],["i","r",2],["i","l",2],["i","r",0],["i","r",2],["a","d",2],["a","d",2],["a","d",2],["m","l",0],["m","l",1],["m","l",2],["d","u",0],["i","l",0],["i","l",0],["b","u",1],["a","r",0],["a","r",2],["b","d",1],["b","d",1],["b","d",2],["m","l",2],["d","u",1],["d","u",1],["e","r",0],["c","d",2],["d","u",2],["d","u",1],["d","u",0],["a","d",1],["a","d",0],["a","r",1],["b","d",2],["b","d",1],["b","d",0],["a","r",2],["c","d",2],["c","d",1],["c","d",2],["e","r",2],["c","d",1],["e","l",1],["a","r",1],["a","r",0],["a","r",0],["b","d",0],["e","l",1],["b","d",1],["a","d",1],["a","r",0],["a","r",2],["a","r",0],["b","d",1],["b","d",1],["b","d",2],["e","r",0],["i","r",2],["m","l",2],["m","l",0],["m","l",2],["b","d",1],["b","d",0],["d","u",2],["e","l",0]
    ];
    this.length = this.moves.length;
    this.index;
    this.color;
    
    this.delay = 1200;
    this.intervalId;
    this.running = 0;
};

/**
 * Start demo
 */
Demo.prototype.start = function() {
    
    this.game.reset();
    this.game.demoBox.classList.remove('hidden');
    this.game.demoButton.classList.add('hidden');
    this.game.stopDemoButton.classList.remove('hidden');
    
    var self = this;
    
    var move = function() {
        
        if (self.index == self.length) {
            self.stop();
            return false;
        }
        
        var move = self.moves[self.index];
        self.index++;
        var cell = move[0];
        var direction = move[1];
        self.color = move[2];
        
        self.showArrow(cell, direction);
        if (freeze) {
            self.stop();
            return false;
        }
        setTimeout(
            function() {
                if (self.running) {
                    self.game.moveTiles(cell, direction);
                }
            },
            300
        );
    };
    
    this.index = 0;
    this.running = 1;
    
    move();
    
    this.intervalId = setInterval(
        move,
        self.delay
    );
};

/**
 * Stop demo
 */
Demo.prototype.stop = function() {
    
    this.running = 0;
    clearInterval(this.intervalId);
    
    this.game.demoButton.classList.remove('hidden');
    this.game.stopDemoButton.classList.add('hidden');
};

/**
 * Show direction arrow
 */
Demo.prototype.showArrow = function(cell, direction) {
    
    var arrow = document.getElementById(direction);
    arrow.classList.add(cell);
    if (!freeze) {
        
    
    setTimeout(
        function() {
            arrow.classList.remove(cell);
        },
        600
    );
    }
};

/**
 * Save moves from Game
 */
Demo.prototype.saveMove = function(cell, direction, color) {
    
    cell = Demo.cellDirectionMap[cell][direction];
    this.moves.push([cell, direction, color]);
};

Demo.cellDirectionMap = {
    'a': {'l': 'a', 'r': 'a', 'u': 'a', 'd': 'a'},
    'b': {'l': 'a', 'r': 'a', 'u': 'b', 'd': 'b'},
    'c': {'l': 'a', 'r': 'a', 'u': 'c', 'd': 'c'},
    'd': {'l': 'a', 'r': 'a', 'u': 'd', 'd': 'd'},
    'e': {'l': 'e', 'r': 'e', 'u': 'a', 'd': 'a'},
    'f': {'l': 'e', 'r': 'e', 'u': 'b', 'd': 'b'},
    'g': {'l': 'e', 'r': 'e', 'u': 'c', 'd': 'c'},
    'h': {'l': 'e', 'r': 'e', 'u': 'd', 'd': 'd'},
    'i': {'l': 'i', 'r': 'i', 'u': 'a', 'd': 'a'},
    'j': {'l': 'i', 'r': 'i', 'u': 'b', 'd': 'b'},
    'k': {'l': 'i', 'r': 'i', 'u': 'c', 'd': 'c'},
    'l': {'l': 'i', 'r': 'i', 'u': 'd', 'd': 'd'},
    'm': {'l': 'm', 'r': 'm', 'u': 'a', 'd': 'a'},
    'n': {'l': 'm', 'r': 'm', 'u': 'b', 'd': 'b'},
    'o': {'l': 'm', 'r': 'm', 'u': 'c', 'd': 'c'},
    'p': {'l': 'm', 'r': 'm', 'u': 'd', 'd': 'd'}
};
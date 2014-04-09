// jquery is used due to IE sucks
// (dataset, classList, addEventListener)

var Lines = function(settings) {
    var app = this,
        defaultSettings = {
            container: document.body,
            score: (function(){
                if (typeof settings.score !== "object") {
                    var score = document.createElement("div");
                    score.className = "score";
                    document.body.appendChild(score);
                    return score;
                }
                return false;
            }()),
            queue: (function(){
                if (typeof settings.queue !== "object") {
                    var queue = document.createElement("div");
                    queue.className = "queue-div";
                    document.body.appendChild(queue);
                    return queue;
                }
                return false;
            }()),
            newGame: (function(){
                if (typeof settings.newGame !== "object") {
                    var newGame = document.createElement("button");
                    newGame.className = "new-game";
                    document.body.appendChild(newGame);
                    return newGame;
                }
                return false;
            }()),
            size: 9,
            ballsPerRound: 3,
            cellClass: "cell",
            cellSelectedClass: "selected",
            ballClass: "ball",
            colorNames: ["red","orange","yellow","green","aqua","blue","purple"]
        },
        params = extend(defaultSettings, settings),
        state = {
            moving: false // true if ball is moving
        },
        html = $("html");

    // total number of cells
    params.cellsCount = (function(){
        return params.size * params.size;
    }());

    params.map = (function(){
        var ar = [];
        for (var i=0; i<params.size; i++) {
            ar[i] = [];
            for (var j=0; j<params.size; j++) {
                ar[i][j] = -2;
            }
        }
        return ar;
    }());

    // get random integer
    app.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max-min+1)) + min;
    };

    // get random color name
    app.getRandomColor = function() {
        return params.colorNames[app.getRandomInt(0, params.colorNames.length-1)];
    };

    // get array of random balls
    app.getRandomBalls = function() {
        var balls = {}, number;
        for (var i = 0; i < params.ballsPerRound; i++) {
            number = (function(){
                var n = app.getRandomInt(1, params.cellsCount);
                if (typeof balls[n]==="undefined") {
                    return n;
                }
                i--;
            }());
            balls[number] = app.getRandomColor();
        }
        return balls;
    };

    // save to localStorage
    app.save = function() {
        switch (arguments.length) {
            case 1:
                localStorage.setItem(arguments[0], "");
                return true;
            case 2:
                localStorage.setItem(arguments[0], JSON.stringify(arguments[1]));
                return true;
            default:
                return false;
                break;
        }
    };

    // load from localStorage
    app.load = function() {
        switch (arguments.length) {
            case 1:
                return JSON.parse(localStorage.getItem(arguments[0])) || false;
            default:
                return false;
                break;
        }
    };

    app.loadFromMap = function() {
        var map = app.load("map");
        if (isEmpty(map)) map = false;
        return map;
    };

    app.saveMap = function(n,color) {
        var map = app.load("map") || {};
        //if (map[n] && typeof map[n]!=="undefined") {
            map[n] = color;
        //}
        app.save("map",map);
    };

    app.clearHistory = function() {
        localStorage.removeItem("map");
    };

    // clear container & fill with cells
    app.initGrid = function(){
        var n=1, balls = app.loadFromMap() || app.load("next") || app.getRandomBalls();
        params.container.innerHTML = "";
        for (var j=params.size-1; j>=0; j--) {
            for (var i=0; i<params.size; i++) {
                $("<div/>")
                    .addClass(params.cellClass)
                    .attr("data-cell",n)
                    .attr("data-x",i)
                    .attr("data-y",j)
                    .html((function(){
                        if (n in balls && balls[n]) {
                            params.map[j][i] = -1;
                            app.saveMap(n,balls[n]);
                            return $("<div/>").addClass(params.ballClass+" "+params.ballClass+"-"+balls[n]).attr("data-color",balls[n]);
                        }
                    }()))
                    .on("click",function(){
                        app.selectCell(this);
                        app.moveBallTo(this);

                    })
                    .appendTo($(params.container));
                n++;
            }
        }
    };

    // append random balls to grid
    app.spawnBalls = function() {
        var balls = app.load("next") || app.getRandomBalls();
        for (var i in balls) {
            var cell = $("[data-cell='"+i+"']")
                .html("")
                .on("click",function(){

                    app.selectCell(this);
                });
            app.saveMap(i,balls[i]);
            $("<div/>").addClass(params.ballClass+" "+params.ballClass+"-"+balls[i]).attr("data-color",balls[i]).appendTo(cell);
            var coordinates = app.getCoordinates(cell);
            params.map[coordinates[1]][coordinates[0]] = -1;
        }
        //console.log(JSON.stringify(params.map));
        return false;
    };

    // get array coordinates by number of ball
    app.getCoordinates = function(cell) {
        return [
            parseInt($(cell).attr("data-x")), // x
            parseInt($(cell).attr("data-y")) // y
        ];
    };

    // select ball on click
    app.selectCell = function(cell) {
        var cells = $("."+params.cellClass), $cell = $(cell);
        if (!$cell.hasClass(params.cellSelectedClass)) {
            if ($cell.children().length) {
                cells.removeClass(params.cellSelectedClass);
                $cell.addClass(params.cellSelectedClass);
            }
        }
        else
            $cell.removeClass(params.cellSelectedClass);
    };

    // try to move ball to target cell
    app.moveBallTo = function(target) {
        var selectedCell = document.querySelectorAll("."+params.cellClass+"."+params.cellSelectedClass),
            $target = $(target);
        if ($target.hasClass(params.cellSelectedClass) || $target.children().length || selectedCell.length==0){
            return false; // return if no need to work
        }

        var testMap = (function(){
                var ar = [];
                for (var i=0; i<params.size; i++) {
                    ar[i] = [];
                    for (var j=0; j<params.size; j++) {
                        ar[i][j] = params.map[i][j];
                    }
                }
                return ar;
            }()),
            //targetCellNumber = $target.attr("data-cell"),
            //selectedCellNumber = $(selectedCell).attr("data-cell"),
            targetCoordinates = app.getCoordinates(target),
            selectedCoordinates = app.getCoordinates(selectedCell),
            trace;

        testMap = testMap.reverse();
        //console.log(JSON.stringify(testMap));
        //console.log(selectedCoordinates[0], selectedCoordinates[1], targetCoordinates[0], targetCoordinates[1]);

        trace = app.pathFind(selectedCoordinates[0], selectedCoordinates[1], targetCoordinates[0], targetCoordinates[1], testMap);
        if (trace) {
            app.pathTrace(trace);
        }
        return false;
    };

    // trace path
    app.pathTrace = function(trace) {
        //console.log(trace);
        var coord, cell, n=0;
        for (var i in trace) {
            coord = trace[i];
            cell = $("[data-x='"+coord[0]+"'][data-y='"+coord[1]+"']");
            cell.addClass("traced");
            setTimeout(function(cell){
                cell.removeClass("traced");
            },150*n,cell);
            n++;
        }
        app.spawnBalls();
        app.prepareNextBalls();
        return false;
    };

    // find path and get coordinates for tracing
    app.pathFind = function(ax, ay, bx, by, map) {
        var size = params.size,
            wall = -1,
            blank = -2,
            wave = 0,
            x, y, d,
            dx = [0, 0, -1, 1],
            dy = [-1, 1, 0, 0],
            path = [],
            pathLength,
            blackList = (function(){
                var ar = [];
                for (var i=0; i<params.size; i++) {
                    ar[i] = [];
                    for (var j=0; j<params.size; j++) {
                        ar[i][j] = -2;
                    }
                }
                return ar;
            }()),
            searchComplete;

        map[by][bx] = 0; // start searching from final point
        blackList[by][bx] = 0; // start searching from final point
        //console.log(ax, ay, bx, by);
        do {
            searchComplete = true;
            for (y=size-1; y>=0; y--) {
                for (x=size-1; x>=0; x--) {
                    if (map[y][x]==wave) {
                        // check neighbours
                        for (d=0; d<4; d++) {
                            // if cell exists & is not wall
                            if (y+dy[d] in map && x+dx[d] in map[y+dy[d]]) {
                                // there was at least one not checked cell
                                // that cell will generate next wave
                                if (map[y+dy[d]][x+dx[d]] == blank) {
                                    searchComplete = false;
                                    map[y+dy[d]][x+dx[d]] = wave + 1;
                                }
                                /*else if (map[y+dy[d]][x+dx[d]] == wall) {
                                    blackList[y+dy[d]][x+dx[d]] = wall;
                                    $("[data-x='"+eval(y+dy[d])+"'][data-y='"+eval(x+dx[d])+"']").css("background","black");
                                }*/
                            }
                        }
                    }
                }
            }
            wave++;
        }
        // there are not checked cells, start cell is not reached and program has not fell in endless recursion :)
        while (!searchComplete && map[ay][ax]==blank);

        // if final cell has not been reached - there is no way
        if (map[ay][ax] == blank) return false;

        pathLength = map[ay][ax];

        x = ax;
        y = ay;
        // go back to start point and get coordinates for tracing
        while (pathLength > 0) {
            path.push([x, y]);
            pathLength--;
            for (d=0; d<4; d++) {
                // if this cell is closer to start
                if (y+dy[d] in map && x+dx[d] in map[y+dy[d]] && blackList[y+dy[d]][x+dx[d]] != -1 && map[y+dy[d]][x+dx[d]] == pathLength) {
                    x = x+dx[d];
                    y = y+dy[d];
                    break;
                }
            }
        }
        path.push([bx,by]); // last point is start
        return path;
    };

    // append random balls to grid
    app.prepareNextBalls = function() {
        var balls = app.getRandomBalls();
        params.queue.innerHTML = "";
        for (var i in balls) {
            $("<div/>")
                .addClass(params.ballClass+"-queue "+params.ballClass+"-"+balls[i])
                .appendTo($(params.queue));
        }
        app.save("next", balls);
    };

    // set ready state
    app.ready = function() {
        if (arguments.length && arguments[0]==false){
            html.removeClass("app-ready");
            html.trigger("app-stop");
        }
        else {
            html.addClass("app-ready");
            html.trigger("app-start");
        }
    };

    // start new game
    app.start = function() {
        app.initGrid();
        //app.spawnBalls();
        app.prepareNextBalls();
        setTimeout(function(){
            app.ready();
        }, 200);
    };

    // restart game
    app.restart = function() {
        app.ready(false);
        app.clearHistory();
        setTimeout(function(){
            app.initGrid();
            //app.spawnBalls();
            app.prepareNextBalls();
            setTimeout(function(){
                app.ready();
            }, 100);
        }, 1400);
    };

    var newGame = $(params.newGame);
    newGame.on("click", function(){
        app.restart();
    });

    return app;
};

// object extension helper
function extend(o, p) {
    for (prop in p) {
        o[prop] = p[prop];
    }
    return o;
}

// check if object is empty
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
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
        var balls = [];
        for (var i = 0; i < params.ballsPerRound; i++) {
            balls.push({
                number: (function(){
                    var num = app.getRandomInt(1, params.cellsCount);
                    for (var n in balls) {
                        while (balls[n]['number']==num) {
                            num = app.getRandomInt(1, params.cellsCount);
                        }
                    }
                    return num;
                }()),
                color: app.getRandomColor()
            });
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

    // clear container & fill with cells
    app.initGrid = function(){
        params.container.innerHTML = "";
        for (var i=1; i<=params.cellsCount; i++) {
            $("<div/>")
                .addClass(params.cellClass)
                .attr("data-cell",i)
                .on("click",function(){
                    app.moveBallTo(this);
                })
                .appendTo($(params.container));
        }
    };

    // append random balls to grid
    app.spawnBalls = function() {
        var ballsData = app.load("next") || app.getRandomBalls();
        for (var i in ballsData) {
            var cell = $("[data-cell='"+ballsData[i]['number']+"']")
                .html("")
                .on("click",function(){
                    app.selectBall(this);
                });
            $("<div/>").addClass(params.ballClass+" "+params.ballClass+"-"+ballsData[i]['color']).appendTo(cell);
            var coordinates = app.getCoordinates(ballsData[i]['number']);
            params.map[coordinates[1]][coordinates[0]] = -1;
        }
    };

    // get array coordinates by number of ball
    app.getCoordinates = function(n) {
        return [
            (function(){
                if (n % params.size!=0) return parseInt((n / params.size).toString().charAt(2))-1;
                else return params.size-1;
            }()), // x
            params.size - Math.ceil(n/params.size-1) - 1 // y
        ];
    };

    // get number
    app.getCellNumber = function(coords) {

    };

    // select ball on click
    app.selectBall = function(cell) {
        var cells = $("."+params.cellClass);
        cells.not($(cell)).removeClass(params.cellSelectedClass);
        if (!$(cell).hasClass(params.cellSelectedClass))
            $(cell).addClass(params.cellSelectedClass);
        else
            $(cell).removeClass(params.cellSelectedClass);
    };

    // try to move ball to target cell
    app.moveBallTo = function(target) {
        var selectedCell = document.querySelectorAll("."+params.cellClass+"."+params.cellSelectedClass);
        if ($(target).hasClass(params.cellSelectedClass) || selectedCell.length==0){
            return false; // return if no need to work
        }

        var testMap = params.map,
            targetCellNumber = $(target).attr("data-cell"),
            selectedCellNumber = $(selectedCell).attr("data-cell"),
            targetCoordinates = app.getCoordinates(parseInt(targetCellNumber)),
            selectedCoordinates = app.getCoordinates(parseInt(selectedCellNumber));

        testMap = testMap.reverse();
        //console.log(JSON.stringify(testMap));
        //console.log(selectedCoordinates[0], selectedCoordinates[1], targetCoordinates[0], targetCoordinates[1]);

        var trace = app.pathFind(selectedCoordinates[0], selectedCoordinates[1], targetCoordinates[0], targetCoordinates[1], testMap);
        if (trace) {
            console.log(trace);
            app.pathTrace(trace);
        }

    };

    // trace path
    app.pathTrace = function(trace) {

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
            //blackList = [],
            path = [],
            pathLength,
            searchComplete;

        map[ay][ax] = 0; // start point
        do {
            searchComplete = true;
            for (y=0; y<size; y++) {
                for (x=0; x<size; x++) {
                    if (map[y][x]==wave/* && map[y][x]!=wall*/) {
                        // check neighbours
                        for (d=0; d<4; d++) {
                            // if cell exists & is not wall & not in blacklist

                            if (y+dy[d] in map && x+dx[d] in map[y+dy[d]] && map[y+dy[d]][x+dx[d]] == blank) {
                                // there was at least one not checked cell
                                // that cell will generate next wave
                                searchComplete = false;
                                map[y+dy[d]][x+dx[d]] = wave++;
                            }
                        }
                    }
                }
            }
            wave++;
            if (by == y+dy[d] && bx ==x+dx[d]) searchComplete = true;
        }
        // there are not checked cells, final cell is not reached and program has not fell in endless recursion :)
        while (!searchComplete && map[by][bx]==blank);

        // if final cell has not been reached - there is no way
        if (map[by][bx] == blank) return false;

        pathLength = map[by][bx];
        x = bx;
        y = by;
        // go back to start point and get coordinates for tracing
        while (pathLength > 0) {
            path.push([x, y]);
            pathLength--;
            for (d=0; d<4; d++) {
                // if this cell is closer to start
                if (y+dy[d] in map && x+dx[d] in map[y+dy[d]] && map[y+dy[d]][x+dx[d]] == pathLength) {
                    x = x+dx[d];
                    y = y+dy[d];
                    break;
                }
            }
        }
        path.push([ax,ay]); // last point is start
        return path.reverse();
    };

    // append random balls to grid
    app.prepareNextBalls = function() {
        var ballsData = app.getRandomBalls();
        params.queue.innerHTML = "";
        for (var i in ballsData) {
            $("<div/>")
                .addClass(params.ballClass+"-queue "+params.ballClass+"-"+ballsData[i]['color'])
                .appendTo($(params.queue));
        }
        app.save("next", ballsData);
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
        app.spawnBalls();
        app.prepareNextBalls();
        setTimeout(function(){
            app.ready();
        }, 200);
    };

    // restart game
    app.restart = function() {
        app.ready(false);
        setTimeout(function(){
            app.initGrid();
            app.spawnBalls();
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
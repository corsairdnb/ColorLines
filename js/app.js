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
            cellClass: "block",
            ballClass: "ball",
            colorNames: ["red","orange","yellow","green","aqua","blue","purple"]
        },
        params = extend(defaultSettings, settings),
        html = $("html");

    // total number of cells
    params.cellsCount = (function(){
        return params.size * params.size;
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
                number: app.getRandomInt(1, params.cellsCount),
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
                // save all
                break;
        }
        return true;
    };

    // load from localStorage
    app.load = function() {
        switch (arguments.length) {
            case 1:
                return JSON.parse(localStorage.getItem(arguments[0])) || false;
            default:
                // save all
                break;
        }
        return true;
    };

    // clear container & fill with cells
    app.initGrid = function(){
        params.container.innerHTML = "";
        for (var i=1; i<=params.cellsCount; i++) {
            $("<div/>").addClass(params.cellClass).attr("data-cell",i).appendTo($(params.container));
        }
    };

    // append random balls to grid
    app.spawnBalls = function() {
        var ballsData = app.load("next") || app.getRandomBalls();
        for (var i in ballsData) {
            var cell = $("[data-cell='"+ballsData[i]['number']+"']").html("");
            $("<div/>").addClass(params.ballClass+" "+params.ballClass+"-"+ballsData[i]['color']).appendTo(cell);
        }
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
        arguments.length && arguments[0]==false ? html.removeClass("app-ready") : html.addClass("app-ready");
    };

    // start new game
    app.start = function() {
        app.initGrid();
        app.spawnBalls();
        app.prepareNextBalls();
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
        app.trigger("restart");
    });

    

    return app;
};

window.onload = function() {

    // For creating the game instance you need to set some initial params.
    // Otherwise default params will be used.
    window.App = new Lines({
        container: document.querySelector(".container"),
        score: document.querySelector(".score"),
        queue: document.querySelector(".queue-div"),
        newGame: document.querySelector(".new-game"),
        size: 9,
        cellClass: "block",
        ballClass: "ball"
    });

    // start game!
    App.start();

    // initialize animations
    setTimeout(function(){
        App.ready();
    }, 300);

};

// object extension helper
function extend(o, p) {
    for (prop in p) {
        o[prop] = p[prop];
    }
    return o;
}
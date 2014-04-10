window.onload = function() {

    // Set some initial params for creating the game instance.
    // Otherwise default params will be used.
   Game = new Lines({
        container: document.querySelector(".container"), // where to create instance of the game
        score: document.querySelector(".score"), // where to print player's score
        queue: document.querySelector(".queue-div"), // where to display next balls
        newGame: document.querySelector(".new-game"), // button for restart game
        size: 9, // size of game field
        cellClass: "cell", // class for grid cells
        ballClass: "ball" // class for balls
    });

    // start game!
    Game.start();

};
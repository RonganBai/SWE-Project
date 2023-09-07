const CANV_WIDTH = 720; 
const CANV_HEIGHT = 400;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////  PLAYER CLASS AND FUNCTIONS  /////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Player {
    constructor(x, y, size) {
        this.x = x; // x position of the player
        this.y = y; // y position of the player
        this.size = size; // size of the player
    }
    display() { //Draws the player
        stroke(0,0,0); //Outline color
        fill(0,0,255); //Color of shape
        square(this.x, this.y, this.size) //Draws the shape
    }
}

function movePlayer(event) {
    if (event.keyCode == 37 || event.keyCode == 65) { // left arrow / a
        player.x -= 10; // move the player left
        if (player.x < 0) { //Don't let the player go off the screen
            player.x = 0;
        }
    } else if (event.keyCode == 39 || event.keyCode == 68) { // right arrow / d
        player.x += 10;
        if (player.x > CANV_WIDTH - player.size) {
            player.x = CANV_WIDTH - player.size;
        }
    } else if (event.keyCode == 38 || event.keyCode == 87) { // up arrow / w
        player.y -= 10;
        if (player.y < (CANV_HEIGHT - (CANV_HEIGHT / 8))) { //Don't let the player go above 1/8 of the screen
            player.y = (CANV_HEIGHT - (CANV_HEIGHT / 8));
        }
    } else if (event.keyCode == 40 || event.keyCode == 83) { // down arrow / s
        player.y += 10;
        if (player.y >= CANV_HEIGHT) {
            player.y = CANV_HEIGHT - player.size;
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////  P5JS MAIN FUNCTIONS  //////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let player; // player object

function setup() {
    createCanvas(CANV_WIDTH, CANV_HEIGHT);
    player = new Player(CANV_WIDTH/2,(CANV_HEIGHT - CANV_HEIGHT/16),10); // create a new player object
    document.addEventListener('keydown', movePlayer); // add event listener for key presses in order to move the player
}

function draw() {
    background(220); // set the background to white
    player.display(); // draw the player
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

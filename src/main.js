const CANV_WIDTH = window.innerWidth; //originally 720
const CANV_HEIGHT = window.innerHeight; //originally 400
const CANV_AREA = CANV_HEIGHT * CANV_WIDTH;
const CANV_SCALAR = CANV_AREA/288000;

const MIN_ENMY_DELAY = 50; // least possible spawn delay for enemies in miliseconds
const STARTING_ENMY_DELAY = 1000;
const DELAY_DECR_MULT = 10; //how fast level progresses //dont use large number

const FPS_ON = true; //flag for toggling fps counter on and off

var mode = 0; // Stores weither the user has left the main menu
let loadTime = 3; // Stores the number of seconds to load
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////  P5JS MAIN FUNCTIONS  //////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let player; // player object
let pressedKeys = {}; // Holding for the pressed keys
let enemies = []; // array to hold enemy objects
let projectiles = []; // array to hold projectile objects
let fpsCounter;
let energiesarray = [];// Array of shield energy cycles
let energies = 0;// Number of energy blocks
let enemyOn = new Boolean(true); // For use in debug. Defaults to true in normal mode. Will turn on or off enemy spawning.
var time = 0; // Playtime
var ShieldCT = 0; // Shield time
let gameOverFlag = false; // flag for being on game over screen

let mySound; // background music
let mainMenu; // main menu gif
let level1; // level 1 gif
let startedAudio = false;

let startButton;
let debugButton;

function preload() {
   mySound = loadSound('./src/BeepBox-Song.wav'); // load music file
   mainMenu = loadImage('./src/mainMenu.gif'); // load main menu gif
   level1 = loadImage('./src/level1.gif'); // load level 1 gif
   gameover = loadImage('./src/gameover.png'); // load gameover file
}


function setup() {
    createCanvas(CANV_WIDTH, CANV_HEIGHT);
    fill(240);
    noStroke();
    player = new Player(CANV_WIDTH/2,(CANV_HEIGHT - CANV_HEIGHT/16),7*CANV_SCALAR); // create a new player object
    enemy1 = new Enemy1()
    fpsCounter = new FpsCounter();

    lastPrint = millis() - 1000;

    if(mousePressed && !startedAudio){
      userStartAudio();  // starts audio based on user mouse click
      startedAudio = true
    }
  }

function draw() {
     // Check if the audio has started and play it
     if (startedAudio && !mySound.isPlaying() && mode != 10 && mode != 0) {
      mySound.play();
    }

    if(mode == 0){ // Main menu
      background(mainMenu) // set the background to white
      textSize(32*CANV_SCALAR);
      textAlign(CENTER);
      //text('Marine Mania', CANV_WIDTH/2, CANV_HEIGHT/3); // Name of game
      startButton = createButton('Start Game'); // set text of button
      startButton.position(CANV_WIDTH*(5/12), CANV_HEIGHT/1.6); // set button position
      startButton.size(CANV_WIDTH/6, CANV_HEIGHT/20); // sets size of button
      startButton.mousePressed(GameInitialization);
      debugButton = createButton('Debug Room');
      debugButton.position(CANV_WIDTH*(5/12), CANV_HEIGHT/1.4); // set button position
      debugButton.size(CANV_WIDTH/6, CANV_HEIGHT/20); // sets size of button
      debugButton.mousePressed(Debug);

      TutorialButton = createButton('Tutorial');
      TutorialButton.position(CANV_WIDTH*(5/12), CANV_HEIGHT/1.8); // set button position
      TutorialButton.size(CANV_WIDTH/6, CANV_HEIGHT/20); // sets size of button
      TutorialButton.mousePressed(Tutorial);
    }
    if(mode == 1 | mode == 5){ // Game has started
      let currentTime = int(millis()/1000) // Converts mil secs into seconds
      let countDown = loadTime - currentTime; // Amount of time passed
      var timeElapsed = millis() - lastPrint;
      if(countDown < 0){
        // Drawing the level
        background(level1); // set the background to the level 1 gif
        fill('rgb(173, 216, 230)');// determines the color of the rectangle
        rect(0,0,CANV_WIDTH*2, CANV_HEIGHT/4.8);// Used to block out the background for the score
        textSize(18*CANV_SCALAR); // determines size of font
        fill(51); // determines color of text

        if(!player.isHit()){ // stops drawing the player if they get hit
          player.display(); // draw the player
          player.update();
        }
        if (timeElapsed > 1000) {
          player.score++;
          lastPrint = millis();
        }

        if(!player.isHit()){ // stops drawing the player if they get hit
          player.display(); // draw the player
          player.update();
        }

        if (player.level == 1 && player.score >= 100) { ++player.level;}

      let calcdDelay = STARTING_ENMY_DELAY - time * DELAY_DECR_MULT; // delay decreases over time
      let enemySpawnDelay = (calcdDelay > MIN_ENMY_DELAY) ? calcdDelay : MIN_ENMY_DELAY;
      enemy1.showcase(enemySpawnDelay); //update, draw, and spawn enemies


      //update and draw any projectiles
      for(let i = 0; i < projectiles.length; ++i){
        projectiles[i].showcase();
      }

      if (energies == 1 && player.shield == false){// Start shield button is displayed when the number of energy blocks is greater than 1
        button3 = createButton('Shield');
        button3.position(CANV_WIDTH*(65/72), CANV_HEIGHT*(21/40)); // set button position
        button3.size(CANV_WIDTH*(55/720), CANV_HEIGHT/10); // sets size of button
        button3.mousePressed(OpenShield);
      }

      if(energies > 0 && keyCode == SHIFT){
        OpenShield();
      }

      gameUI();
      displayShieldInfo();


        if(mode == 5){// Invincible Mode
          for (let enmy of enemies){ // Shield Mode checks each enemy for collision
            if (intersect(player.x, player.y, player.size-5, enmy.posX, enmy.posY, enmy.size))
              player.setHitFalse();
          }
        }else{
          for (let enmy of enemies){ // checks each enemy for collision
            if (intersect(player.x, player.y, player.size-5, enmy.posX, enmy.posY, enmy.size)){
              player.setHitTrue();
              if(energies > 0 && player.shield == false){// Death removes shield button if present
                removeElements(button3);
              }
              changeMode(9);
            }
          }
        }

        //collision between player projectile and enemies
        //create a standalone function for this
        checkProjectileHit();

      }
      else{
        // Draws the countdown
        background(0, 204, 255) // Used to remove text, Title
        textSize(20*CANV_SCALAR);
        fill(0, 0, 0);
        text("The game will start in: " + countDown, CANV_WIDTH/2, CANV_HEIGHT/3);
      }

    }
    if(mode == 2){ // debug room implementation
      DebugDraw();
    }

    if(mode == 9){ // Game Over Screen
      GameOver();
    } 

    if(mode == 10){
      Tutorial();
    }

  //fps counter stuff
  if(FPS_ON){
    if(fpsCounter.readyToUpdate())
      fpsCounter.update();

    fpsCounter.draw();
  }

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////           function          ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function GameInitialization(){ // initialization
        //removeElements(button1,button2); // removes the buttons from the screen
        removeElements(startButton, debugButton, TutorialButton);
        energies = 0;// initialization
        energiesarray = [];// initialization

        //could make retry initializations in a separate function and do them depending on a flag
        player.setHitFalse(); // draws player again when retrying
        currentTime = 0; // resets difficulty on retry
        enemies = []; // resets enemies on retry
        player.score = 0; // resets score on retry
        player.level = 1; // reset level
        time = 0; // resets game time
        ShieldCT = 0;
        calcdDelay = STARTING_ENMY_DELAY; // resets enemy difficulty
        enemySpawnDelay = STARTING_ENMY_DELAY;
        setTimeout("gameOverFlag = false", 2000); // resets flag to false on retry. Timer prevents previous Gametime func from not being stopped
        setTimeout("shieldCounter = 0", 2000);
        player.x = CANV_WIDTH/2;
        player.y = (CANV_HEIGHT - CANV_HEIGHT/16);
        shieldCounter = 0;

        setTimeout(Gametime, 4000); // start counting
        setTimeout(energie, 4000); // start shield charge
        loadTime = 3;
        loadTime =  int(millis()/1000) + loadTime;// Sets the load time to be the loadtime + whenever the button was pressed

        mode = 1;
}

function GameOver(){ // Game over
      background(gameover); // sets the gameover image as the background
      fill(220, 250, 253);
      textSize(32*CANV_SCALAR);
      text('Score: ' + player.score, CANV_WIDTH/2, CANV_HEIGHT/1.5);// determines what is displayed, at what x,y

      gameOverFlag = true;
      
      retryButton = createButton('Try Again?'); // set text of button
      retryButton.position(CANV_WIDTH*(5/12), CANV_HEIGHT/(1.3)); // set button position
      retryButton.size(CANV_WIDTH/6, CANV_HEIGHT/20); // sets size of button
      retryButton.mousePressed(GameInitialization);

      returntoMenuButton = createButton('Return to Main Menu'); // Sets the text of the button
      returntoMenuButton.position(CANV_WIDTH*(5/12), CANV_HEIGHT/(1.2)); // Sets the button position
      returntoMenuButton.size(CANV_WIDTH/6, CANV_HEIGHT/18); // Sets the size of the button
      returntoMenuButton.mousePressed(returntoMenu); // Calls the return to menu function

}

function returntoMenu(){ // used to return to the main menu
  removeElements(retryButton, returntoMenuButton); // removes the buttons from the screen
  changeMode(0);
}

function Gametime(){// Playtime
  time++;
  if(gameOverFlag == true) {return;} 
  setTimeout(Gametime, 1000);
}

function changeMode(i){
  mode = i;
}

function Debug(){
  changeMode(2);
  removeElements(startButton, debugButton, TutorialButton);
}

function DebugDraw(){ //Draw function specifically for Debug menu (AKA Mode 2)
  //removeElements(startButton, debugButton);
  background(145, 240, 243); //White background

  if(!player.isHit()){ // stops drawing the player if they get hit
    player.display(); // draw the player
    player.update();
  }

  //update and draw any projectiles
  for(let i = 0; i < projectiles.length; ++i){
    projectiles[i].showcase();
  }

  enemy1.showcase();

  if (keyCode === 49){
    if (enemyOn)
    {
      enemyOn = false;
    }
    else
    {
      enemyOn = true;
    }
  }
}

function keyPressed(){
    pressedKeys[key] = true;
   if(keyCode === 32 && (mode == 5 || mode == 1)){  // if spacebar is pressed && playing game
      if(!player.isHit()){
        projectiles.push(new Projectile(player.x, player.y+1));
      }
    }
}

function keyReleased(){
    delete pressedKeys[key];
}

//checks if two objects intersect using (x,y) and radius
function intersect(obj1X, obj1Y, obj1R, obj2X, obj2Y, obj2R){
    if (sqrt(pow((obj1X - obj2X),2) + pow((obj1Y - obj2Y),2)) < (obj1R + obj2R)) {return true;}
    else {return false;}
}

function checkProjectileHit() {
  for (let prjctl of projectiles){
    for (let enmy of enemies){
      if (intersect(prjctl.posX, prjctl.posY, prjctl.size, enmy.posX, enmy.posY, enmy.size)){
        enmy.hit = true;
        prjctl.hitEnemy(enmy);
      }
    }
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function gameUI() {
  textSize(10*CANV_SCALAR);
  fill('black');
  stroke(0,0,0);
  text('Gametime: '+time+' sec',CANV_WIDTH/2,CANV_HEIGHT/20);// Show game time
  textAlign(LEFT);
  text('Score: ' + player.score, CANV_WIDTH/20, CANV_HEIGHT/20);// determines what is displayed, at what x,y
  text('Level: ' + player.level, CANV_WIDTH/20, CANV_HEIGHT/10); // ... 
  textAlign(CENTER);
}

function keyReleased(){
    delete pressedKeys[key];
}

//checks if two objects intersect using (x,y) and radius
function intersect(obj1X, obj1Y, obj1R, obj2X, obj2Y, obj2R){
    if (sqrt(pow((obj1X - obj2X),2) + pow((obj1Y - obj2Y),2)) < (obj1R + obj2R)) {return true;}
    else {return false;}
}

function mousePressed(){
  if(!player.isHit() && (mode == 5 || mode == 1)) { // if playing game and not hit
    projectiles.push(new Projectile(mouseX, mouseY));
  }
}

function checkProjectileHit() {
  for (let prjctl of projectiles){
    for (let enmy of enemies){
      if (intersect(prjctl.posX, prjctl.posY, prjctl.size, enmy.posX, enmy.posY, enmy.size)){
        enmy.hit = true;
        prjctl.hitEnemy(enmy);
      }
    }
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

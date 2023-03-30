// Library -------------------------------------------------------------------------------------------------------------
class MotionElement {
    element;

    constructor(element) {
        this.element = element;
    }

    setX(x) {
        this.element.style.left = x + "px";
    }

    setY(y) {
        this.element.style.top = y + "px";
    }

    getX() {
        return this.element.offsetLeft;
    }

    getY() {
        return this.element.offsetTop;
    }

    offsetHeight() {
        return this.element.offsetHeight;
    }

    offsetWidth() {
        return this.element.offsetWidth;
    }

}

class TransformObject {
    bufferX = 0;
    bufferY = 0;
    stepX = 0;
    stepY = 0;
    updateX = 0;
    updateY = 0;
    speed = 1;
    id;
    timer = false;
    motionElement;

    constructor(motionElement, id) {
        this.motionElement = motionElement;
        this.id = id;
    }

    setSpeed(speed, id) {
        if (this.id === id)
            this.speed = speed;
    }

    getID() {
        return this.id;
    }

    frame() {
        this.stepX = this.updateX / 100.0;
        this.stepY = this.updateY / 100.0;


        for (let i = 0; i <= this.speed; i++) {
            if (this.updateX !== 0 || this.updateY !== 0) {

                this.bufferX += this.stepX;
                this.bufferY += this.stepY;


                this.motionElement.setX(this.motionElement.getX() + parseInt(this.bufferX.toString()));
                this.motionElement.setY(this.motionElement.getY() + parseInt(this.bufferY.toString()));


                this.updateX -= parseInt(this.bufferX.toString());
                this.updateY -= parseInt(this.bufferY.toString());

                this.bufferX -= parseInt(this.bufferX.toString());
                this.bufferY -= parseInt(this.bufferY.toString());

            } else {
                this.timer = false;
            }
        }
    }

    getTimer() {
        return this.timer;
    }

    translate(updateX, updateY) {
        this.updateX += updateX;
        this.updateY += updateY;
        this.timer = true;
        this.frame();
    }

    translateBySpeed(updateX, updateY, speed) {
        this.speed = speed;
        this.updateX += updateX;
        this.updateY += updateY;
        this.timer = true;
        this.frame();
    }

}

class Transforms {
    index = 0;
    TransformObjects;

    constructor(maxLength) {
        this.TransformObjects = new Array(maxLength);
    }

    addTransformObject(motionElement, id) {
        if (this.index < this.TransformObjects.length) {
            this.TransformObjects[this.index++] = new TransformObject(motionElement, id);
        }
    }

    setSpeed(speed, id) {
        for (let i = 0; i < this.index; i++) {
            this.TransformObjects[i].setSpeed(speed, id);
        }
    }

    translate(updateX, updateY) {
        for (let i = 0; i < this.index; i++) {
            this.TransformObjects[i].translate(updateX, updateY);
        }
    }

    translateBySpeed(updateX, updateY, speed) {
        for (let i = 0; i < this.index; i++) {
            this.TransformObjects[i].translateBySpeed(updateX, updateY, speed);
        }
    }

    translateByID(updateX, updateY, id) {
        for (let i = 0; i < this.index; i++) {
            if (this.TransformObjects[i].getID() === id)
                this.TransformObjects[i].translate(updateX, updateY);
        }
    }

    translateByIDAndSpeed(updateX, updateY, id, speed) {
        for (let i = 0; i < this.index; i++) {
            if (this.TransformObjects[i].getID() === id)
                this.TransformObjects[i].translateBySpeed(updateX, updateY, speed);
        }
    }


    runPerFrame() {
        for (let i = 0; i < this.index; i++) {
            if (this.TransformObjects[i].getTimer()) {
                this.TransformObjects[i].frame();
            }
        }
    }
}

// Objects definition in game ----------------------------------------------------------------------------
let gameBar = document.getElementById("game");
let car = document.getElementById("car");
let r1 = document.getElementById("r1");
let r2 = document.getElementById("r2");
let e1 = document.getElementById("e1");
let e2 = document.getElementById("e2");
let infoBox = document.getElementById("info-box");
let timeLeft = document.getElementById("time-left");
let level = document.getElementById("level");

// Motion objects definition in game ----------------------------------------------------------------------
let motionCar = new MotionElement(car);
let motionR1 = new MotionElement(r1);
let motionR2 = new MotionElement(r2);
let motionE1 = new MotionElement(e1);
let motionE2 = new MotionElement(e2);

// Transforms object definition ----------------------------------------------------------------------------
let ts = new Transforms(5);
ts.addTransformObject(motionCar, "car");
ts.addTransformObject(motionR1, "r1");
ts.addTransformObject(motionR2, "r2");
ts.addTransformObject(motionE1, "e1");
ts.addTransformObject(motionE2, "e2");

// Add transform object only for left or right moveation.
let carLR = new TransformObject(motionCar, "car");

// step value for move per frame.
let speedStep = 30;
// store step for counter.
let counterStep = 20;
// counter for level design.
let counter = counterStep;
// Game level.
let gameLevel = 1;
// if true game play.
let playGame = true;
// if true collision not work.
let ghost = false;
// For save your leve.
let record = 1;
// For save your most level.
let mostRecord = 1;
// For storing speed of car for left and right movement.
let carLRSpeed = 1;

// play function for play game.
function play() {
    // moving my car.
    ts.translateByIDAndSpeed(0, -speedStep, "car", 5);
    // moving enemy.
    ts.translateByIDAndSpeed(0, -speedStep / 1.2, "e1", 5);
    ts.translateByIDAndSpeed(0, -speedStep / 1.2, "e2", 5);
    // Camera simulation.
    ts.translateBySpeed(0, speedStep, 1);

    // Road simulation.
    if (motionR1.getY() >= window.innerHeight) {
        motionR1.setY(motionR2.getY() - r1.offsetHeight + 10);
    }
    if (motionR2.getY() >= window.innerHeight) {
        motionR2.setY(motionR1.getY() - r2.offsetHeight + 10);
    }

    // Initializing enemy
    enemyInits();

    // Levels
    levelTiming();

    if (playGame)
        setTimeout(play, 50);
}

// enemyInits function for initials enemy.
function enemyInits() {
    let random = Math.floor(Math.random() * 10);
    if (random === 5) {
        if (motionE2.getY() > window.innerHeight / 3) {
            enemyInit(motionE1, "");
        }
    } else if (random === 7) {
        if (motionE1.getY() > window.innerHeight / 3) {
            enemyInit(motionE2, "");
        }

    } else {
        if (motionE2.getY() > window.innerHeight / 3) {
            let result = enemyInit(motionE1, "none");
            enemyInit(motionE2, result);
        }
    }
}

function enemyInit(motionElement, reservedPosition) {
    if (motionElement.getY() > window.innerHeight + 200) {
        let random = Math.floor(Math.random() * 100);
        //center
        if (random === 1 && reservedPosition !== "center") {
            setEnemyPosition(motionElement, "center");
            showInfo("وسط");
            return "center";
        }
        //left
        else if (random === 2 && reservedPosition !== "left") {
            setEnemyPosition(motionElement, "left");
            showInfo("چپ");
            return "left";
        }
        //right
        else if (random === 3 && reservedPosition !== "right") {
            setEnemyPosition(motionElement, "right");
            showInfo("راست");
            return "right";
        }
    }
}

function setEnemyPosition(motionElement, leftCenterRight) {
    if (leftCenterRight === "center") {
        motionElement.setX(getCenterPositionForCar(motionElement));
        motionElement.setY(-motionElement.offsetHeight() - 200);
    } else if (leftCenterRight === "left") {
        motionElement.setX(getLeftPositionForCar(motionElement) - 5);
        motionElement.setY(-motionElement.offsetHeight() - 210);
    } else if (leftCenterRight === "right") {
        motionElement.setX(getRightPositionForCar(motionElement) + 5);
        motionElement.setY(-motionElement.offsetHeight() - 320);
    }
}


function levelTiming() {
    // Showing level on screen.
    level.innerHTML = gameLevel.toString();
    timeLeft.innerHTML = counter.toString();


    if (counter === 0) {
        counterStep += 20;
        counter = counterStep;
        gameLevel++;
        speedStep += 10;
        carLRSpeed = speedStep / 30;
    }


    counter--;
}

function collision(elementA, elementB) {
    let closer = 30;
    // Left top corner
    let xA = elementA.offsetLeft + closer;
    let xB = elementB.offsetLeft + closer;
    let yA = elementA.offsetTop + closer;
    let yB = elementB.offsetTop + closer;

    // Right bottom corner
    let xA2 = xA + elementA.offsetWidth - closer;
    let xB2 = xB + elementB.offsetWidth - closer;
    let yA2 = yA + elementA.offsetHeight - closer;
    let yB2 = yB + elementB.offsetHeight - closer;

    // x axis
    if (xB <= xA2 && xB2 >= xA) {
        // y axis
        if (yB <= yA2 && yB2 >= yA) {
            // moving my car.
            ts.translateByIDAndSpeed(0, 120, "car", 2);
            // collision is true.
            playGame = false;
            gameLoseShow();
            return true;
        }
    }
    return false;
}

function collisionTest() {
    if (playGame && !ghost) {
        if (collision(e1, car) || collision(e2, car)) {
            playGame = false;
        }
    }
}

// Showing message text on top.
function showInfo(messageText) {
    infoBox.style.opacity = "1";
    infoBox.innerHTML = messageText;
    // hiding message box after specified time.
    setTimeout(hideInfo, 2000);
}

// Hiding message text on top.
function hideInfo() {
    infoBox.style.opacity = "0";
}

// Document loaded.
window.addEventListener('DOMContentLoaded', (event) => {
    // when document fully loaded initialises game objects.
    initials();
});

// Initialising objects in game.
function initials() {
    // Setting gameBar (Frame or window) height.
    gameBar.style.height = window.innerHeight + "px";

    // Setting the roads
    r2.style.top = -r2.offsetHeight + 10 + "px";

    // Setting my racing car.
    car.style.width = gameBar.offsetWidth / 5 + "px";
    car.style.top = window.innerHeight - (8 / (100 / window.innerHeight)) - (car.offsetHeight) + "px";
    motionCar.setX(getCenterPositionForCar(motionCar));

    // Setting car width and first position
    e1.style.width = car.offsetWidth.toString() + "px";
    e2.style.width = car.offsetWidth.toString() + "px";
    motionE1.setY(window.innerHeight + 2000);
    motionE2.setY(window.innerHeight + 2000);

    document.getElementById("body").style.opacity = "1";
}


// Getting suitable position for car object.
function getCenterPositionForCar(motionElement) {
    return (window.innerWidth / 2) - motionElement.offsetWidth() / 2 - 5;
}

function getLeftPositionForCar(motionElement) {
    return getCenterPositionForCar(motionElement) - getLeftRightStep() + 5;
}

function getRightPositionForCar(motionElement) {
    return getCenterPositionForCar(motionElement) + getLeftRightStep() + 5;
}

// Getting left or right step space for move object.
function getLeftRightStep() {
    return (window.innerWidth / 5 - 8);
}

// left or right step space
let leftRightStep = getLeftRightStep();
// For store my car position (Left = 1, Middle = 2, Right = 3).
let carPosition = 2;

function goLeft() {
    if (carPosition !== 1 && playGame) {
        carLR.translateBySpeed(-leftRightStep, 0, carLRSpeed);
        carPosition -= 1;
    }
}

function goRight() {
    if (carPosition !== 3 && playGame) {
        carLR.translateBySpeed(leftRightStep, 0, carLRSpeed);
        carPosition += 1;
    }
}

// Play library function  --------------------------------------------------------------------------------
runPerFrame();

function runPerFrame() {
    ts.runPerFrame();
    collisionTest();
    carLR.frame();
    setTimeout(runPerFrame, 1);
}

// ----------------------------------------------------------------------------------------

// initializing settings for play game.
function start() {
    // Setting game objects.
    initials();

    // Hiding start box.
    let startBox = document.getElementById("start-box");
    startBox.style.opacity = "0";
    startBox.style.transform = "scale(1.1)";
    setTimeout(function () {
        startBox.style.display = "none";
    }, 1000);

    gameBar.style.opacity = "1";
    // Run game.
    play();
}


function gameLoseShow() {
    let gameLoseBox = document.getElementById("game-lose");
    gameLoseBox.style.display = "block";
    gameLoseBox.style.transform = "scale(2)";
    // for collision not work.
    ghost = true;

    // Storing records
    record = parseInt(level.innerHTML);
    if (record > mostRecord)
        mostRecord = record;

    // Set records value to element.
    document.getElementById("record").innerHTML = record.toString();
    document.getElementById("most-record").innerHTML = mostRecord.toString();

    setTimeout(function () {
        gameLoseBox.style.opacity = "1";
        gameLoseBox.style.transform = "scale(1)";
    }, 2000);
}

function gameLoseHide() {
    let gameLoseBox = document.getElementById("game-lose");
    gameLoseBox.style.opacity = "0";
    gameLoseBox.style.transform = "scale(2)";

    setTimeout(function () {
        ts.translate(0, -120);
        gameLoseBox.style.display = "none";
        setDefault();
        playGame = true;
        play();

        // ghost is false after three second.
        setTimeout(function () {
            ghost = false;
        }, 3000)
    }, 2000);
}

function setDefault() {
    // step value for move per frame.
    speedStep = 30;
    // Store counter step.
    counterStep = 20;
    // counter for level design.
    counter = counterStep;
    // Game level.
    gameLevel = 1;
    playGame = true;
    carLRSpeed = 1;
}

document.body.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') {
        goRight();
    } else if (e.code === 'ArrowLeft') {
        goLeft();
    }
})
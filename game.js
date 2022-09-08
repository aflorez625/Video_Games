const canvas = document.querySelector(`#game`);
// Siempre se debe crear el contexto para indicar que se quiere renderizar graficos en 2D
const game = canvas.getContext('2d');
const btnUp = document.querySelector("#up");
const btnLeft = document.querySelector("#left");
const btnRight = document.querySelector("#right");
const btnDown = document.querySelector("#down");
const btnReload = document.querySelector("#reload");
const btnDelRecord = document.querySelector("#delRecord");
const livesCount = document.querySelector("#lives");
const timeCount = document.querySelector("#time");
const record = document.querySelector("#record");
const pResult = document.querySelector("#pResult");
const btnreload = document.querySelector("#reload");


let canvasSize;
let elementSize;
let level = 0;
let lives = 3;
let continuar = true;
const playerPosition = {
    x: undefined,
    y: undefined
};
const gifPosition = {
    x: undefined,
    y: undefined
};
let enemyPositions = [];
let timeStart;
let timeInterval;
let timeRecord;
let newRecord;

window.addEventListener('load', setCanvasSize);  //Espera a que el HMML cargue para iniciar el canvas
window.addEventListener('resize', setCanvasSize);  // Hace que el canvas sea responsible al resize de pantalla

function setCanvasSize(){
    if (window.innerWidth < window.innerHeight) canvasSize = window.innerWidth * 0.7;
    else canvasSize = window.innerHeight * 0.7;

    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);
    elementSize = canvasSize / 10;
    //console.log({canvasSize, elementSize});
    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();
}

function startGame() {
    /*canvas.setAttribute('width', window.innerWidth*0.75);
    canvas.setAttribute('height', window.innerHeight*0.75);
    window.innerHeight()          //Espacio HTML disponible en la ventana - Alto
    let canvasSize = window.innerWidth > window.innerHeight ?
                 window.innerHeight * 0.7 : window.innerWidth * 0.9
    //game.fillRect(0,0,100,100);
    //game.clearRect(20,20,50,20);
    //game.font = '25px Verdana';   // SOn atributos, no metodos
    //game.fillStyle = 'purple';
    //game.textAlign = 'center';
    //game.fillText('Juego',50,25);
 
*/
    const map = maps[level];
    if(!map){
        gameWin();
        return;
    }
    if(!timeStart) {
        timeStart = Date.now();
        timeInterval = setInterval(showTime, 100);
        record.innerHTML = localStorage.getItem('record');
    }
    if(!continuar){
        gameLost();
        return
    }
    mapRows = map.trim().split("\n");
    mapCols = mapRows.map(row => row.trim().split(""));  //La funcion map, cambia un string en un array
    //const mapas = maps[0].match(/[IXO\-]+]/g).map(a=>a.split("")) // Revizar este codigo
    //console.log(map, mapRows, mapCols);
    showLives();
    
    game.textAlign = 'end';
    game.font = elementSize + 'px verdana';
    /*Refactor ciclo for anidado
    for (i=1; i<=10; i++) {
        for (j=1; j<=10; j++) {
            emoji = mapCols[i-1][j-1];
            game.fillText(emojis[emoji], elementSize*j, elementSize*i);
        }
    }*/
    game.clearRect(0,0,canvasSize,canvasSize);
    enemyPositions = [];
    mapCols.forEach((row, rowIx) =>{
        row.forEach((col, colIx) =>{
            const emoji = emojis[col];
            const posX = elementSize*(colIx +1)
            const posY = elementSize*(rowIx + 1)

            if (col == 'O') {
                if (!playerPosition.x && !playerPosition.y){
                    playerPosition.x = posX;
                    playerPosition.y = posY;
                }
            } else if (col == 'I'){
                gifPosition.x = posX;
                gifPosition.y = posY;
            } else if (col == 'X'){
                enemyPositions.push({
                    x: posX,
                    y: posY
                })
            }
            //console.log(row, rowIx, col, colIx, emoji);
            game.fillText(emoji, posX, posY );
        })
    });
    movePlayer();
}

function movePlayer(){
    game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y );
    //console.log(gifPosition, playerPosition)
    const gitCollitionX = playerPosition.x.toFixed(3) == gifPosition.x.toFixed(3);
    const gitCollitionY = playerPosition.y.toFixed(3) == gifPosition.y.toFixed(3);
    const gitCollition = gitCollitionX && gitCollitionY; 
    if (gitCollition){
        levelWin(); 
    }
    const enemyCollition = enemyPositions.find( enemy => {
        const enemyCollectionX = enemy.x.toFixed(3) == playerPosition.x.toFixed(3)
        const enemyCollectionY = enemy.y.toFixed(3) == playerPosition.y.toFixed(3)
        return enemyCollectionX && enemyCollectionY
    });
    if (enemyCollition){
        liveLost();
    }
}

function levelWin(){
     level ++;
     startGame();
}

function liveLost(){
    //console.log('Chocaste con enemigo');
    lives --;
    playerPosition.x = undefined;
    playerPosition.y = undefined;
    if (lives == 0){
        continuar = false;
        //lives = 3;
        level = 0;
        gameLost();
    }
    startGame();
}

function gameWin(){
    pResult.innerHTML = "Ganaste, sigue intentando para mejorar tu record";
    clearInterval(timeInterval);
    if(!localStorage.getItem('record') || timeRecord < localStorage.getItem('record')){
        localStorage.setItem('record', timeRecord)
        pResult.innerHTML = "¡¡¡¡TIENES UN NUEVO RECORD!!!!"
        record.innerHTML = timeRecord;   
    }
}

function gameLost(){
    pResult.innerHTML = "PERDISTE EL JUEGO 😢, Intentalo de nuevo";
    clearInterval(timeInterval);
    showLives();
    //setTimeout(showMessage, 2000);
    timeStart = undefined;
}

function showLives(){
    livesCount.innerHTML = emojis['HEART'].repeat(lives);
}

function showTime(){
    timeRecord = Date.now() - timeStart;
    timeCount.innerHTML = timeRecord;
}



btnUp.addEventListener('click', moveUp);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);
btnReload.addEventListener('click', reStart);
btnDelRecord.addEventListener('click', delRecord);
window.addEventListener('keydown', moveByKeys);


function moveByKeys(event){
    //console.log(event)
    if (event.key == "ArrowUp") moveUp();
    else if (event.key == "ArrowDown") moveDown();
    else if (event.key == "ArrowRight") moveRight();
    else if (event.key == "ArrowLeft") moveLeft();
    else if (event.key == "Enter") reStart();
    else if (event.key == "d") delRecord();
}
function moveUp(){
    playerPosition.y = Math.max(elementSize, playerPosition.y - elementSize)
    startGame();
}
function moveDown(){
    playerPosition.y = Math.min(canvasSize, playerPosition.y + elementSize)
    startGame();
}
function moveLeft(){
    playerPosition.x = Math.max(elementSize, playerPosition.x - elementSize)
    startGame();
}
function moveRight(){
    playerPosition.x = Math.min(canvasSize, playerPosition.x + elementSize)
    startGame();
}
function reStart(){
    location.reload();
}
function delRecord(){
    localStorage.removeItem("record");
    record.innerHTML = "";
    pResult.innerHTML = "";
}
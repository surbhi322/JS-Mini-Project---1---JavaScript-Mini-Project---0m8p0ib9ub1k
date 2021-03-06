import { getRandomNumber, getCssProp, detectColision, roundNum } from '/utils/utils.js';
Object.assign( window, {
    getRandomNumber,
    detectColision,
    roundNum
});
let game, block, hole, character, score, gameoverscreen,gravityStopped, isJumping, gameStopped, scoreTotal, gameSpeed;
function getElements() {
    game = document.querySelector( '#game' );
    block = document.querySelector( '#block' );
    hole = document.querySelector( '#hole' );
    character = document.querySelector( '#character' );
    score = document.querySelector( '#score' );
    gameoverscreen = document.querySelector( '#gameoverscreen' );
}
function setInitialValues() {
    isJumping = false;
    gravityStopped = false;
    gameStopped = false;
    scoreTotal = 0;
    gameSpeed = 'slow';
}
function initRandomHoles() {
    hole.addEventListener( 'animationiteration', _ => {
        const randomTop = getRandomNumber( 469, 700 );
        hole.style.top = `-${randomTop}px`;
    });
} 
function beginGravity() {
    setInterval(_ => {
        if ( isJumping || gravityStopped ) return
        changeGameState({ diff: 5, direction: 'down' })
    }, 20);
}
function changeGameState({ diff, direction }) {
    handleGameSpeed();
    handleCharacterAnimation( direction );
    handleCharacterCollisions();
    handleCharacterPosition( diff );
}
function handleGameSpeed() {
    let doReset = false;
    if ( scoreTotal > 5000 ) {
        gameSpeed = 'ridiculous';
        doReset = true;
    }else if ( scoreTotal > 2000 ) {
        gameSpeed = 'superfast';
        doReset = true;
    }else if ( scoreTotal > 750 ) {
        gameSpeed = 'fast';
        doReset = true;
    }else if ( scoreTotal > 250 ) {
        gameSpeed = 'normal';
        doReset = true;
    }
    if ( doReset ) {
        const timeoutLength = gameSpeedConfig[ gameSpeed ] * ( gameSpeedConfig[ gameSpeed ] / 10 );
        setTimeout( _ => {
            if ( gameStopped ) return;
            resetAllAnimations();
        }, timeoutLength );
    }
}
function handleCharacterAnimation( direction ) {
    if ( direction === 'down' ) {
        character.classList.remove('go-up');
        character.classList.add('go-down');
    }
    else if ( direction === 'up' ) {
        character.classList.remove('go-down');
        character.classList.add('go-up');
    }
}
function handleCharacterCollisions() {
    const colisionBlock =  detectColision( character, block );
    const colisionHole =  detectColision( character, hole, { y1: -46, y2: 47 });
    if ( colisionBlock && !colisionHole ) {
        changeScoreUi();
        return gameOver();
    }else if ( colisionHole ) {
        scoreTotal++;
        changeScoreUi();
        if ( gameStopped ) return;
    }
}
function handleCharacterPosition( diff ) {
    const characterTop = parseInt( getCssProp( character, 'top' ) );
    const changeTop = characterTop + diff;
    if ( changeTop < 0 )
        return;
    if ( changeTop > window.innerHeight ) 
        return gameOver();
    character.style.top = `${ changeTop }px`;
}
function characterJump() {
    isJumping = true;
    let jumpCount = 0;
    const jumpInterval = setInterval(_ => {
        changeGameState({ diff: -3, direction: 'up' });
        if ( jumpCount > 20 ) {
            clearInterval( jumpInterval );
            isJumping = false;
            jumpCount = 0;
        }
        jumpCount++;
    }, 10);
}
function setEventListeners() {
    document.body.parentElement.addEventListener( 'click', _ => {
        if ( gameStopped ) return; 
        characterJump();
    });
    window.addEventListener('resize', _ => {
        if ( gameStopped ) return;
        resetAllAnimations();
    });
    gameoverscreen.querySelector( 'button' ).addEventListener( 'click', _ => {
        gameSpeed = 'slow';
        hideGameoverscreen();
        startGravity();
        resetAllAnimations();
        resetCharacterPosition();
        resetScore();
        changeScoreUi();
        startBgAnimation();
        setTimeout(_ => {
            gameStopped = false;
        })
    })
}
function gameOver() {
    gameStopped = true;
    showGameoverscreen();
    stopBlockAnimation();
    stopGravity();
    stopBgAnimation();
}
function resetCharacterPosition() {
    character.style.top = `30vh`;
    character.style.left = `25vw`;
}
function resetScore() {
    scoreTotal = 0;
}
function changeScoreUi() {
    score.innerText = `Score ${ scoreTotal.toString() }`;
    gameoverscreen.querySelector( '.score' ).innerText = score.innerText;
}
const gameSpeedConfig = {
    'slow': 150,
    'normal': 250,
    'fast': 350,
    'superfast': 450,
    'ridiculous': 550
};
function resetAllAnimations() {
    const seconds = roundNum( window.innerWidth / gameSpeedConfig[ gameSpeed ] );
    const blockAnimationCss = `blockAnimation ${ seconds }s infinite linear`;
    block.style.animation = blockAnimationCss ;
    hole.style.animation = blockAnimationCss;
}
function stopBlockAnimation() {
    const blockLeft = block.getBoundingClientRect().x;
    block.style.animation = '';
    hole.style.animation = '';
    block.style.left = `${ blockLeft }px`;
    hole.style.left = `${ blockLeft }px`;
}
function stopBgAnimation() {
    game.style.animation = '';
}
function startBgAnimation() {
    game.style.animation = 'backgroundAnimation 5s infinite linear';
}
function startGravity() {
    gravityStopped = false;
}
function stopGravity() {
    gravityStopped = true;
}
function showGameoverscreen() {
    gameoverscreen.style.display = '';
}
function hideGameoverscreen() {
    gameoverscreen.style.display = 'none';
}
function gameInit() {
    getElements();
    setInitialValues();
    initRandomHoles();
    beginGravity();
    setEventListeners();
    resetCharacterPosition();
    resetScore();
    resetAllAnimations();
    startBgAnimation();
}
gameInit();

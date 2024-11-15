'use strict';

function select(selector, scope = document) {
    return scope.querySelector(selector);
}

function listen(event, element, callback) {
    return element.addEventListener(event, callback);
}

const startLogo = select('.start-logo');
const overlay = select('.overlay');
const startText = select('h4', startLogo);
const main = select('main');
const gameBackground = select('.game-background', main);
const randomWordContainer = select('.random-word-div');
const randomWord = select('.random-word', randomWordContainer);
const game = select(".game");
const inputField = select('.input-field', game);
const beginningCountdown = select('.beginning-countdown');
const countDown = select('.countdown', gameBackground);
const hitDisplay = select('.hit');  

// Audio
const beginningSong = new Audio('./assets/audio/beginning-song.mp3');
const timesUpAudio = new Audio('./assets/audio/alarm.mp3');
const themeSong = new Audio('./assets/audio/Themesong.mp3'); 
const yeehawSound = new Audio('./assets/audio/yeehaw-sound-effect.mp3'); // New sound effect

let time = 32;
let threeSeconds = 3;
let timerInterval;
let restartButton;
let wordBank = [
    'dinosaur', 'love', 'pineapple', 'calendar', 'robot', 'building',
    'population', 'weather', 'bottle', 'history', 'dream', 'character',
    'money', 'absolute', 'discipline', 'machine', 'accurate', 'connection',
    'rainbow', 'bicycle', 'eclipse', 'calculator', 'trouble', 'watermelon',
    'developer', 'philosophy', 'database', 'capitalism', 'abominable', 'phone'
];

class Score {
    constructor(date, hits, percentage) {
        this.date = date;
        this.hits = hits;
        this.percentage = percentage;
    }

    getDate() {
        return this.date;
    }

    getHits() {
        return this.hits;
    }

    getPercentage() {
        return this.percentage;
    }
}

let correctHits = 0;  
let totalWordsTyped = 0;  
let scores = [];  

function randomElement() {
    const index = Math.floor(Math.random() * wordBank.length);
    const randomWordDisplay = wordBank.splice(index, 1)[0];
    randomWord.textContent = randomWordDisplay;
}

listen('click', startText, () => {
    startLogo.classList.add('fade-out');
    setTimeout(() => {
        startLogo.classList.add('hidden');
        overlay.classList.add('hidden');
        beginningCountdownHandler(); 
    }, 1000);
});

function beginningCountdownHandler() {
    beginningCountdown.textContent = threeSeconds;
    let countdownInterval = setInterval(() => {
        threeSeconds--;
        if (threeSeconds >= 0) {
            beginningCountdown.textContent = threeSeconds;
        } else {
            clearInterval(countdownInterval);
            beginningCountdown.textContent = ''; 
            gameStart();
        }
    }, 1000);
}

// Start Game
function gameStart() {
    randomElement(); 
    beginningSong.pause(); 
    beginningSong.currentTime = 0; 
    themeSong.play(); 
    themeSong.loop = true; 
    startTimer(); 
    game.classList.remove('hidden'); 
    displayRestartButton(); 
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (time <= 0) {
            clearInterval(timerInterval);
            endGame();
        } else {
            time--;
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            countDown.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}


listen('input', inputField, (event) => {
    const userInput = inputField.value.trim();
    const currentWord = randomWord.textContent;

    if (userInput === currentWord) {
        inputField.value = ''; 
        correctHits++; 
        hitDisplay.textContent = `Hits: ${correctHits}`;  
        totalWordsTyped++; 
        
        yeehawSound.currentTime = 4; 
        yeehawSound.play();
        
        if (wordBank.length > 0) {
            randomElement(); 
        } else {
            endGame(); 
        }
    }
});



listen('keydown', inputField, (event) => {
    if (event.key === 'Backspace') {
        const userInput = inputField.value.trim();
        const currentWord = randomWord.textContent;

        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] !== currentWord[i]) {
                return; 
            }
        }
        event.preventDefault(); 
    }
});

function displayRestartButton() {
    if (!restartButton) {
        restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';
        restartButton.style.position = 'absolute';
        restartButton.style.top = '20px';
        restartButton.style.right = '20px';
        restartButton.classList.add('restart-button');
        document.body.appendChild(restartButton);

        restartButton.addEventListener('click', () => {
            restartGame();
        });
    }
}

function hideRestartButtonInitially() {
    if (restartButton) {
        restartButton.remove();
        restartButton = null;
    }
}

function restartGame() {
   
    wordBank = [
        'dinosaur', 'love', 'pineapple', 'calendar', 'robot', 'building',
        'population', 'weather', 'bottle', 'history', 'dream', 'character',
        'money', 'absolute', 'discipline', 'machine', 'accurate', 'connection',
        'rainbow', 'bicycle', 'eclipse', 'calculator', 'trouble', 'watermelon',
        'developer', 'philosophy', 'database', 'capitalism', 'abominable', 'phone'
    ];
    randomWord.textContent = ''; 
    inputField.value = ''; 
    time = 32;
    threeSeconds = 3;  

    hideRestartButtonInitially(); 
    game.classList.add('hidden'); 

    correctHits = 0;
    hitDisplay.textContent = 'Hits: 0';  

    inputField.disabled = false; 
    inputField.placeholder = 'Go on, type.'; 

    themeSong.pause(); 
    themeSong.currentTime = 0; 

    
    clearInterval(timerInterval); 
    startTimer();  

    beginningCountdownHandler(); 
}

function stopAllMusic() {
    themeSong.pause(); 
    themeSong.currentTime = 0;
}

// End Game
function endGame() {
    clearInterval(timerInterval);
    countDown.textContent = '00:00';
    timesUpAudio.play(); 
    stopAllMusic();

    setTimeout(() => {
        timesUpAudio.pause();
        timesUpAudio.currentTime = 0;
    }, 3000);

    inputField.disabled = true; 
    inputField.value = ''; 
    inputField.placeholder = 'GAME OVER!!'; 
    const percentage = (correctHits / totalWordsTyped) * 100;
    
    const score = new Score(new Date().toLocaleString(), correctHits, percentage.toFixed(2));
    scores.push(score);

    displayRestartButton(); 
}

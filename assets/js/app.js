'use strict';
import { select, listen, wordBank } from './utils.js';

const startLogo = select('.start-logo');
const overlay = select('.overlay');
const startText = select('h4', startLogo);
const main = select('main');
const gameBackground = select('.game-background', main);
const randomWordContainer = select('.random-word-div');
const randomWord = select('.random-word', randomWordContainer);
const game = select('.game');
const inputField = select('.input-field', game);
const beginningCountdown = select('.beginning-countdown');
const countDown = select('.countdown', gameBackground);
const hitDisplay = select('.hit');
const scoresDiv = document.createElement('div');
scoresDiv.classList.add('scores-div');
document.body.appendChild(scoresDiv);

const beginningSong = new Audio('./assets/audio/beginning-song.mp3');
const timesUpAudio = new Audio('./assets/audio/alarm.mp3');
const themeSong = new Audio('./assets/audio/Themesong.mp3');
const yeehawSound = new Audio('./assets/audio/sound.mp3');

let time = 40;
let threeSeconds = 3;
let timerInterval;
let restartButton;

let correctHits = 0;
let totalWordsTyped = 0;
let scores = JSON.parse(localStorage.getItem('scores')) || [];


function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }
shuffleArray(wordBank);


function randomElement() {
    if (wordBank.length > 0) {
        randomWord.textContent = wordBank.pop();
    } else {
        randomWord.textContent = 'No more words!';
    }
}


listen('input', inputField, (event) => {
    const userInput = inputField.value.trim().toLowerCase();
    const currentWord = randomWord.textContent;

    if (userInput === currentWord) {
        inputField.value = '';
        correctHits++;
        totalWordsTyped++;
        hitDisplay.textContent = `Hits: ${correctHits}`;
        yeehawSound.play();

        if (wordBank.length > 0) {
            randomElement();
        } else {
            endGame();
        }
    }
});


listen('click', startText, () => {
    startLogo.classList.add('fade-out');
    setTimeout(() => {
        startLogo.classList.add('hidden');
        overlay.classList.add('hidden');
        inputField.focus(); 
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

function gameStart() {
    randomElement();
    beginningSong.pause();
    beginningSong.currentTime = 0;
    themeSong.play();
    themeSong.loop = true;
    startTimer();
    game.classList.remove('hidden');
    inputField.focus();
    displayRestartButton();
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (time <= 0) {
            clearInterval(timerInterval);
            endGame();
        } else {
            time--;
            const seconds = time % 60;
            countDown.textContent = `${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function restartGame() {
    shuffleArray(wordBank);
    randomWord.textContent = '';
    inputField.value = '';
    time = 40;
    threeSeconds = 3;
    hideRestartButtonInitially();
    game.classList.add('hidden');
    correctHits = 0;
    totalWordsTyped = 0;
    hitDisplay.textContent = 'Hits: 0';
    inputField.disabled = false;
    inputField.placeholder = 'Go on, type.';
    themeSong.pause();
    themeSong.currentTime = 0;
    clearInterval(timerInterval);
    beginningCountdownHandler();
}

function hideRestartButtonInitially() {
    if (restartButton) {
        restartButton.remove();
        restartButton = null;
    }
}




function stopAllMusic() {
    themeSong.pause();
    themeSong.currentTime = 0;
}


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
            scoresDiv.classList.add('hidden'); 
        });
    }
}

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

    const percentage = totalWordsTyped === 0 ? 0 : (correctHits / totalWordsTyped) * 100;

    scores.push({
        date: new Date().toLocaleString(),
        hits: correctHits,
        percentage: percentage.toFixed(2),
    });

    scores.sort((a, b) => b.hits - a.hits);
    scores.splice(10);
    localStorage.setItem('scores', JSON.stringify(scores));

    correctHits = 0; 
    updateScoreboard();
    scoresDiv.classList.remove('hidden');
    displayRestartButton();
}

function updateScoreboard() {
    scoresDiv.innerHTML = ''; 
    scoresDiv.classList.add('scoreboard');

    if (scores.length > 0) {
        const title = document.createElement('h3');
        title.classList.add('scoreboard-title');
        title.textContent = 'Highest Scores';
        scoresDiv.appendChild(title);

        scores.forEach((score, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.textContent = `#${index + 1}. Hits: ${score.hits}`;
            scoresDiv.appendChild(scoreItem);
        });
    } 
}

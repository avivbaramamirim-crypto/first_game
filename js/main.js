// === מנוע סאונד ===
const sndMove = new Audio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Move.mp3');
const sndCapture = new Audio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Capture.mp3');
function playWoodSound(cap) { try { if (cap) { sndCapture.currentTime = 0; sndCapture.play(); } else { sndMove.currentTime = 0; sndMove.play(); } } catch(e) {} }

let currentGameMode = 'ai', pendingGameToLaunch = '';

function openModeModal(gameName) { pendingGameToLaunch = gameName; document.getElementById('mode-modal-overlay').style.display = 'flex'; }
function closeModeModal() { document.getElementById('mode-modal-overlay').style.display = 'none'; }
function launchGame(mode) {
    currentGameMode = mode; closeModeModal(); showScreen(pendingGameToLaunch + '-screen');
    if (pendingGameToLaunch === 'chess') initChess(); if (pendingGameToLaunch === 'checkers') initCheckers();
    if (pendingGameToLaunch === 'snakes') initSnakes(); if (pendingGameToLaunch === 'memory') initMemory();
    if (pendingGameToLaunch === 'tictactoe') initTicTacToe(); if (pendingGameToLaunch === 'connect4') initConnect4();
}

function showScreen(screenId) {
    document.querySelectorAll('.game-screen').forEach(el => el.style.display = 'none');
    document.getElementById('menu-screen').style.display = 'none';
    if(screenId !== 'menu-screen') document.getElementById(screenId).style.display = 'block';
    else document.getElementById('menu-screen').style.display = 'flex';
}

function triggerEndgameAnim(type, customText = null) {
    const overlay = document.getElementById('endgame-overlay');
    const box = document.getElementById('endgame-box');
    const title = document.getElementById('endgame-title');
    const icon = document.getElementById('endgame-icon');

    box.className = 'modal-box endgame-box ' + type;
    if (type === 'win') { title.innerText = customText || 'ניצחון!'; icon.innerText = '🏆🎉'; playWoodSound(true); } 
    else if (type === 'lose') { title.innerText = customText || 'הפסדת...'; icon.innerText = '💀💔'; } 
    else if (type === 'draw') { title.innerText = 'תיקו!'; icon.innerText = '🤝'; }
    overlay.classList.add('active');
}

function closeEndgameOverlay() { document.getElementById('endgame-overlay').classList.remove('active'); }
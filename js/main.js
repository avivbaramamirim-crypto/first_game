/**
 * ניהול מרכזי - טיפול במעברי מסכים, צלילים ואנימציות סיום
 */
window.currentGameMode = 'ai'; 
window.pendingGameToLaunch = '';
window.pendingGameDisplayName = '';

const sndMove = new Audio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Move.mp3');
const sndCapture = new Audio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Capture.mp3');

window.playWoodSound = function(cap) { 
    try { if (cap) sndCapture.play(); else sndMove.play(); } catch(e) {} 
}

window.showScreen = function(screenId) {
    document.querySelectorAll('.game-screen').forEach(s => s.style.display = 'none');
    document.getElementById('menu-screen').style.display = 'none';
    const target = document.getElementById(screenId);
    if(target) target.style.display = 'block';
};

window.openModeModal = function(gameKey, displayName) { 
    window.pendingGameToLaunch = gameKey; 
    window.pendingGameDisplayName = displayName;
    
    // הגבלת אונליין למשחקים שלא תומכים
    const onlineBtn = document.getElementById('online-mode-btn');
    if (gameKey === 'memory' || gameKey === 'snakes') onlineBtn.style.display = 'none';
    else onlineBtn.style.display = 'block';

    document.getElementById('mode-modal-title').innerText = displayName;
    document.getElementById('mode-modal-overlay').style.display = 'flex'; 
};

window.closeModeModal = function() { 
    document.getElementById('mode-modal-overlay').style.display = 'none'; 
};

window.showOnlineLobby = function() {
    window.closeModeModal();
    document.getElementById('lobby-game-name').innerText = "משחק רשת: " + window.pendingGameDisplayName;
    document.getElementById('active-room-info').style.display = 'none';
    document.getElementById('create-room-btn').style.display = 'inline-block';
    window.showScreen('online-lobby-screen');
};

window.launchGame = function(mode) {
    window.currentGameMode = mode;
    window.closeModeModal();
    window.showScreen(window.pendingGameToLaunch + '-screen');
    
    // אתחול נקי של המשחק הנבחר
    if (window.pendingGameToLaunch === 'chess') initChess();
    if (window.pendingGameToLaunch === 'checkers') initCheckers();
    if (window.pendingGameToLaunch === 'connect4') initConnect4();
    if (window.pendingGameToLaunch === 'tictactoe') initTicTacToe();
    if (window.pendingGameToLaunch === 'snakes') initSnakes();
    if (window.pendingGameToLaunch === 'memory') initMemory();
};

window.triggerEndgameAnim = function(type, customText) {
    const overlay = document.getElementById('endgame-overlay');
    const title = document.getElementById('endgame-title');
    const icon = document.getElementById('endgame-icon');
    
    if (type === 'win') { title.innerText = customText || "ניצחון!"; icon.innerText = "🏆"; }
    else if (type === 'lose') { title.innerText = "הפסד..."; icon.innerText = "😟"; }
    else { title.innerText = "תיקו!"; icon.innerText = "🤝"; }
    
    overlay.style.display = 'flex';
};

window.closeEndgameOverlay = function() {
    document.getElementById('endgame-overlay').style.display = 'none';
};
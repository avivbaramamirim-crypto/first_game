window.currentGameMode = 'ai'; 
window.pendingGameToLaunch = '';
window.pendingGameDisplayName = '';

// צלילים
const sndMove = new Audio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Move.mp3');
const sndCapture = new Audio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Capture.mp3');

window.playWoodSound = function(cap) { 
    try { if (cap) sndCapture.play(); else sndMove.play(); } catch(e) {} 
}

// ניהול מעבר בין מסכים
window.showScreen = function(screenId) {
    document.querySelectorAll('.game-screen').forEach(s => s.style.display = 'none');
    document.getElementById('menu-screen').style.display = 'none';
    const target = document.getElementById(screenId);
    if(target) target.style.display = 'block';
    if(screenId === 'menu-screen') target.style.display = 'block';
};

// פתיחת מודל בחירת מצב
window.openModeModal = function(gameKey, displayName) { 
    window.pendingGameToLaunch = gameKey; 
    window.pendingGameDisplayName = displayName;
    document.getElementById('mode-modal-title').innerText = displayName;
    document.getElementById('mode-modal-overlay').style.display = 'flex'; 
};

window.closeModeModal = function() { 
    document.getElementById('mode-modal-overlay').style.display = 'none'; 
};

// הצגת הלובי לאונליין
window.showOnlineLobby = function() {
    window.closeModeModal();
    document.getElementById('lobby-game-name').innerText = "משחק רשת: " + window.pendingGameDisplayName;
    document.getElementById('active-room-info').style.display = 'none';
    document.getElementById('create-room-btn').style.display = 'inline-block';
    window.showScreen('online-lobby-screen');
};

// הפעלת המשחק
window.launchGame = function(mode) {
    window.currentGameMode = mode;
    window.closeModeModal();
    window.showScreen(window.pendingGameToLaunch + '-screen');
    if (window.pendingGameToLaunch === 'chess') initChess();
};

window.closeEndgameOverlay = function() {
    document.getElementById('endgame-overlay').style.display = 'none';
};
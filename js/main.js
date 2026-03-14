/**
 * main.js - ניהול מעברים בין מסכים ורישום פונקציות גלובליות
 */
window.currentGameMode = 'ai'; 
window.pendingGameToLaunch = '';
window.pendingGameDisplayName = '';

window.showScreen = function(screenId) {
    document.querySelectorAll('.game-screen').forEach(s => s.style.display = 'none');
    document.getElementById('menu-screen').style.display = 'none';
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'block';
    else document.getElementById('menu-screen').style.display = 'block';
};

window.openModeModal = function(gameKey, displayName) { 
    window.pendingGameToLaunch = gameKey; 
    window.pendingGameDisplayName = displayName;
    
    // הגבלת אונליין למשחקים שלא תומכים בו כרגע
    const onlineBtn = document.getElementById('online-mode-btn');
    if (onlineBtn) onlineBtn.style.display = (gameKey === 'memory') ? 'none' : 'block';

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
    
    const initFunctions = {
        'chess': window.initChess,
        'checkers': window.initCheckers,
        'connect4': window.initConnect4,
        'tictactoe': window.initTicTacToe,
        'snakes': window.initSnakes,
        'memory': window.initMemory
    };

    if (typeof initFunctions[window.pendingGameToLaunch] === 'function') {
        initFunctions[window.pendingGameToLaunch]();
    } else {
        console.error("Initialization function not found for:", window.pendingGameToLaunch);
    }
};

window.triggerEndgameAnim = function(type, text) {
    const overlay = document.getElementById('endgame-overlay');
    document.getElementById('endgame-title').innerText = text || (type === 'win' ? "ניצחון!" : "סיום");
    document.getElementById('endgame-icon').innerText = type === 'win' ? "🏆" : "🤝";
    overlay.style.display = 'flex';
};

window.closeEndgameOverlay = function() {
    document.getElementById('endgame-overlay').style.display = 'none';
};
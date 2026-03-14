window.currentGameMode = 'ai'; 
window.pendingGameToLaunch = '';

window.showScreen = function(screenId) {
    document.querySelectorAll('.game-screen').forEach(s => s.style.display = 'none');
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('online-lobby-screen').style.display = 'none';
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'block';
};

window.showMenuScreen = function() {
    document.querySelectorAll('.game-screen').forEach(s => s.style.display = 'none');
    document.getElementById('online-lobby-screen').style.display = 'none';
    document.getElementById('mode-modal-overlay').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'block';
};

window.openModeModal = function(gameKey, displayName) { 
    window.pendingGameToLaunch = gameKey; 
    document.getElementById('mode-modal-title').innerText = displayName;
    document.getElementById('mode-modal-overlay').style.display = 'flex'; 
};

window.closeModeModal = function() { 
    document.getElementById('mode-modal-overlay').style.display = 'none'; 
};

window.showOnlineLobby = function() {
    window.closeModeModal();
    document.getElementById('online-lobby-screen').style.display = 'block';
};

window.launchGame = function(mode) {
    window.currentGameMode = mode;
    window.closeModeModal();
    window.showScreen(window.pendingGameToLaunch + '-screen');
    
    // Debug: log the current mode
    console.log('Launching game with mode:', mode);
    
    const initMap = {
        'chess': window.initChess,
        'checkers': window.initCheckers,
        'connect4': window.initConnect4,
        'tictactoe': window.initTicTacToe,
        'snakes': window.initSnakes,
        'memory': window.initMemory
    };

    if (typeof initMap[window.pendingGameToLaunch] === 'function') {
        initMap[window.pendingGameToLaunch]();
    }
};

window.updateStatus = function(elementId, text, isActive) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerText = text;
    if (isActive) el.classList.add('active');
    else el.classList.remove('active');
};

window.triggerEndgameAnim = function(type, text) {
    const overlay = document.getElementById('endgame-overlay');
    document.getElementById('endgame-title').innerText = text || (type === 'win' ? "ניצחון!" : "תיקו");
    document.getElementById('endgame-icon').innerText = type === 'win' ? "🏆" : "🤝";
    overlay.style.display = 'flex';
};
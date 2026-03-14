/**
 * ניהול מרכזי משופר - תורות ועיצוב
 */
window.currentGameMode = 'ai'; 
window.pendingGameToLaunch = '';
window.pendingGameDisplayName = '';

window.showScreen = function(screenId) {
    document.querySelectorAll('.game-screen').forEach(s => s.style.display = 'none');
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('online-lobby-screen').style.display = 'none';
    
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'block';
};

window.openModeModal = function(gameKey, displayName) { 
    window.pendingGameToLaunch = gameKey; 
    window.pendingGameDisplayName = displayName;
    document.getElementById('mode-modal-title').innerText = displayName;
    document.getElementById('mode-modal-overlay').style.display = 'flex'; 
};

window.closeModeModal = function() { 
    document.getElementById('mode-modal-overlay').style.display = 'none'; 
};

window.launchGame = function(mode) {
    window.currentGameMode = mode;
    window.closeModeModal();
    
    const screenId = window.pendingGameToLaunch + '-screen';
    window.showScreen(screenId);
    
    // קריאה לפונקציית האתחול של המשחק הספציפי
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
    }
};

window.updateTurnUI = function(elementId, text, isActive) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerText = text;
    if (isActive) el.classList.add('active-turn');
    else el.classList.remove('active-turn');
};

window.triggerEndgameAnim = function(type, text) {
    const overlay = document.getElementById('endgame-overlay');
    document.getElementById('endgame-title').innerText = text || (type === 'win' ? "ניצחון!" : "הפסד...");
    document.getElementById('endgame-icon').innerText = type === 'win' ? "🏆" : "🤝";
    overlay.style.display = 'flex';
};

window.closeEndgameOverlay = function() {
    document.getElementById('endgame-overlay').style.display = 'none';
    window.location.reload(); // חזרה לתפריט
};
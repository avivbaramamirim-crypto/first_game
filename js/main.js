window.currentGameMode = 'pvp'; 
window.pendingGameToLaunch = '';
window.aiDifficulty = 'medium'; // easy, medium, hard

window.setAIDifficulty = function(difficulty) {
    window.aiDifficulty = difficulty;
    console.log('AI difficulty set to:', difficulty);
};

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
    document.getElementById('endgame-overlay').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'block';
    
    // Clear all game boards to ensure fresh state on next entry
    const boards = ['chessBoard', 'checkersBoard', 'c4Board', 'memoryBoard', 'snakesBoard', 'tttBoard'];
    boards.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
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
    
    console.log('Launching game with mode:', mode);
    
    const initMap = {
        'chess': window.initChess,
        'checkers': window.initCheckers,
        'connect4': window.initConnect4,
        'tictactoe': window.initTicTacToe,
        'snakes': window.initSnakes,
        'memory': window.initMemory
    };

    const initFn = initMap[window.pendingGameToLaunch];
    if (typeof initFn === 'function') {
        try {
            initFn();
        } catch (err) {
            console.error('Error initializing game:', window.pendingGameToLaunch, err);
            window.updateStatus(window.pendingGameToLaunch + '-status', 'שגיאה בטעינת המשחק', true);
        }
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

// Initialize the menu screen when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.showMenuScreen();
    console.log('Game center initialized');
});
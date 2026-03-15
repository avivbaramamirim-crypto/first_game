window.currentGameMode = 'pvp'; 
window.pendingGameToLaunch = '';
window.aiDifficulty = 'medium'; // easy, medium, hard

window.setAIDifficulty = function(difficulty) {
    window.aiDifficulty = difficulty;
    console.log('AI difficulty set to:', difficulty);
};

window.showScreen = function(screenId) {
    console.log('=== NEW SHOWSCREEN FUNCTION CALLED ===');
    console.log('=== SHOWING SCREEN:', screenId, '===');
    document.querySelectorAll('.game-screen').forEach(s => {
        s.style.display = 'none';
        console.log('Hiding screen:', s.id);
    });
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('online-lobby-screen').style.display = 'none';
    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'block';
        console.log('Showing screen:', screenId);

        // The init function for game should have already been called, 
        // which handles board's specific display properties (e.g., 'grid' or 'block').
        // Here, we just ensure container is visible.
        const boardContainer = target.querySelector('.game-board-container');
        if (boardContainer) {
            boardContainer.style.visibility = 'visible';
            boardContainer.style.opacity = '1';
            // We do not set 'display' here to avoid overriding game-specific styles.
            console.log('Ensured board visibility for:', boardContainer.id);
            
            // Debug: Check actual board elements
            // The boardContainer IS the board element (not a wrapper)
            console.log('DEBUG - Board element found:', boardContainer.id);
            console.log('DEBUG - Board display:', window.getComputedStyle(boardContainer).display);
            console.log('DEBUG - Board visibility:', window.getComputedStyle(boardContainer).visibility);
            console.log('DEBUG - Board opacity:', window.getComputedStyle(boardContainer).opacity);
            console.log('DEBUG - Board width:', window.getComputedStyle(boardContainer).width);
            console.log('DEBUG - Board height:', window.getComputedStyle(boardContainer).height);
        } else {
            console.log('DEBUG - No board container found!');
        }
    } else {
        console.error('Screen not found:', screenId);
    }
    console.log('=== NEW SHOWSCREEN FUNCTION ENDED ===');
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
    console.log('=== LAUNCH GAME STARTED ===');
    console.log('Mode parameter:', mode);
    console.log('Current pendingGameToLaunch before:', window.pendingGameToLaunch);
    
    window.currentGameMode = mode;
    window.closeModeModal();
    
    console.log('Launching game with mode:', mode);
    console.log('Pending game to launch:', window.pendingGameToLaunch);
    
    const initMap = {
        'chess': window.initChess,
        'checkers': window.initCheckers,
        'connect4': window.initConnect4,
        'tictactoe': window.initTicTacToe,
        'snakes': window.initSnakes,
        'memory': window.initMemory
    };
    
    console.log('Available games in initMap:', Object.keys(initMap));

    const initFn = initMap[window.pendingGameToLaunch];
    console.log('Init function found:', typeof initFn, 'for game:', window.pendingGameToLaunch);
    console.log('Init function exists:', !!initFn);
    
    if (typeof initFn === 'function') {
        console.log('=== CALLING INIT FUNCTION ===');
        try {
            // Show screen FIRST so DOM elements have physical dimensions before rendering
            console.log('=== SHOWING SCREEN ===');
            window.showScreen(window.pendingGameToLaunch + '-screen');
            console.log('=== SCREEN SHOWN ===');
            
            setTimeout(() => {
                initFn();
                console.log('=== INIT FUNCTION CALLED SUCCESSFULLY ===');
            }, 50);
        } catch (err) {
            console.error('Error initializing game:', window.pendingGameToLaunch, err);
            window.updateStatus(window.pendingGameToLaunch + '-status', 'שגיאה בטעינת המשחק', true);
        }
    } else {
        console.error('=== NO INIT FUNCTION FOUND ===');
        console.error('Game:', window.pendingGameToLaunch);
        console.error('Function type:', typeof initFn);
    }
    console.log('=== LAUNCH GAME ENDED ===');
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
    console.log('MAIN.JS LOADED - Game center initializing...');
    window.showMenuScreen();
    console.log('Game center initialized');
    console.log('=== NEW VERSION OF MAIN.JS LOADED ===');
});
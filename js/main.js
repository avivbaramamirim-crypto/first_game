window.currentGameMode = 'ai'; 
window.pendingGameToLaunch = '';
window.pendingGameDisplayName = '';

// צלילים
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
    if(screenId === 'menu-screen') document.getElementById('menu-screen').style.display = 'block';
};

window.openModeModal = function(gameKey, displayName) { 
    window.pendingGameToLaunch = gameKey; 
    window.pendingGameDisplayName = displayName;
    const title = document.getElementById('mode-modal-title');
    if (title) title.innerText = displayName;
    const modal = document.getElementById('mode-modal-overlay');
    if (modal) modal.style.display = 'flex'; 
};

window.closeModeModal = function() { 
    const modal = document.getElementById('mode-modal-overlay');
    if (modal) modal.style.display = 'none'; 
};

window.showOnlineLobby = function() {
    window.closeModeModal();
    const lobbyTitle = document.getElementById('lobby-game-name');
    if (lobbyTitle) lobbyTitle.innerText = "משחק רשת: " + window.pendingGameDisplayName;
    
    // איפוס תצוגת חדר
    const roomInfo = document.getElementById('active-room-info');
    if (roomInfo) roomInfo.style.display = 'none';
    const createBtn = document.getElementById('create-room-btn');
    if (createBtn) createBtn.style.display = 'inline-block';
    
    window.showScreen('online-lobby-screen');
};

window.launchGame = function(mode) {
    window.currentGameMode = mode;
    window.closeModeModal();
    window.showScreen(window.pendingGameToLaunch + '-screen');
    
    if (window.pendingGameToLaunch === 'chess') {
        if (typeof initChess === 'function') initChess();
        else console.error("initChess function not found");
    }
};

window.closeEndgameOverlay = function() {
    const overlay = document.getElementById('endgame-overlay');
    if (overlay) overlay.style.display = 'none';
};
window.currentGameMode = 'ai'; 
window.pendingGameToLaunch = '';

// טעינת צלילים
const sndMove = new Audio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Move.mp3');
const sndCapture = new Audio('https://cdn.jsdelivr.net/gh/lichess-org/lila@master/public/sound/standard/Capture.mp3');

window.playWoodSound = function(cap) { 
    try { if (cap) sndCapture.play(); else sndMove.play(); } catch(e) {} 
}

// ניהול מודלים (Modals)
window.openModeModal = function(gameName) { 
    window.pendingGameToLaunch = gameName; 
    document.getElementById('mode-modal-overlay').style.display = 'flex'; 
};

window.closeModeModal = function() { 
    document.getElementById('mode-modal-overlay').style.display = 'none'; 
};

// הפעלת המשחק
window.launchGame = function(mode) {
    window.currentGameMode = mode;
    window.closeModeModal();
    
    // הסתרת כל המסכים והתפריט
    document.querySelectorAll('.game-screen').forEach(s => s.style.display = 'none');
    document.getElementById('menu-screen').style.display = 'none';
    
    // הצגת המסך הנבחר
    const target = window.pendingGameToLaunch + '-screen';
    if(document.getElementById(target)) document.getElementById(target).style.display = 'block';
    
    // אתחול לוגיקת המשחק הספציפית
    if (window.pendingGameToLaunch === 'chess') initChess();
};

window.closeEndgameOverlay = function() {
    document.getElementById('endgame-overlay').style.display = 'none';
};
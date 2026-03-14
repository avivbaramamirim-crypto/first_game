var chessBoard = null;
var chessGame = new Chess();

function initChess() {
    if (chessBoard) chessBoard.destroy();
    
    chessBoard = Chessboard('chessBoard', {
        draggable: true,
        position: 'start',
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: (source, piece) => {
            if (chessGame.game_over()) return false;
            
            // חוקי תורות ומולטיפלייר (אי אפשר להזיז את כלי היריב)
            if (window.currentGameMode === 'online') {
                const myRole = window.getMyRole();
                if (piece.charAt(0) !== myRole || chessGame.turn() !== myRole) return false;
            } else if (window.currentGameMode === 'ai' && piece.search(/^b/) !== -1) {
                return false;
            }
        },
        onDrop: (source, target) => {
            const move = chessGame.move({ from: source, to: target, promotion: 'q' });
            if (move === null) return 'snapback';

            window.playWoodSound(move.captured);
            
            // עדכון הענן או המחשב
            if (window.currentGameMode === 'online') {
                window.broadcastMove(chessGame.fen());
            } else if (window.currentGameMode === 'ai') {
                setTimeout(makeRandomChessMove, 250);
            }
            updateChessStatus();
        }
    });
    updateChessStatus();
}

function updateChessStatus() {
    const turn = chessGame.turn() === 'w' ? 'לבן' : 'שחור';
    document.getElementById('chess-status').innerText = `תור ה${turn}`;
}

function makeRandomChessMove() {
    const moves = chessGame.moves();
    if (moves.length === 0) return;
    chessGame.move(moves[Math.floor(Math.random() * moves.length)]);
    chessBoard.position(chessGame.fen());
    updateChessStatus();
}

// סנכרון מהלכים שמגיעים מהענן
window.syncLocalGame = function(gameType, state) {
    if (gameType === 'chess' && state !== chessGame.fen()) {
        chessGame.load(state);
        chessBoard.position(state);
        updateChessStatus();
        window.playWoodSound(false);
    }
};
/**
 * שחמט - שימוש בספריית Chess.js לחוקים מלאים
 */
var chessBoard = null;
var chessGame = new Chess();

function initChess() {
    if (chessBoard) chessBoard.destroy();
    chessGame = new Chess();
    
    let orientation = 'white';
    if (window.currentGameMode === 'online' && window.getMyRole() === 'b') orientation = 'black';

    chessBoard = Chessboard('chessBoard', {
        draggable: true,
        position: 'start',
        orientation: orientation,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: (source, piece) => {
            if (chessGame.game_over()) return false;
            // חסימת תורות
            if (window.currentGameMode === 'online') {
                const myRole = window.getMyRole();
                if (piece.charAt(0) !== myRole || chessGame.turn() !== myRole) return false;
            } else if (window.currentGameMode === 'ai' && piece.charAt(0) === 'b') {
                return false;
            }
        },
        onDrop: (source, target) => {
            const move = chessGame.move({ from: source, to: target, promotion: 'q' });
            if (move === null) return 'snapback';

            window.playWoodSound(move.captured);
            if (window.currentGameMode === 'online') window.broadcastMove(chessGame.fen());
            else if (window.currentGameMode === 'ai') setTimeout(makeRandomChessMove, 400);
            
            updateChessStatus();
        }
    });
    updateChessStatus();
}

function updateChessStatus() {
    let status = "";
    const moveColor = chessGame.turn() === 'b' ? 'שחור' : 'לבן';

    if (chessGame.in_checkmate()) status = "מט! ה" + (chessGame.turn() === 'w' ? 'שחור' : 'לבן') + " ניצח.";
    else if (chessGame.in_draw()) status = "תיקו!";
    else {
        status = "תור ה" + moveColor;
        if (chessGame.in_check()) status += " (שח!)";
    }
    document.getElementById('chess-status').innerText = status;
}

function makeRandomChessMove() {
    const moves = chessGame.moves();
    if (moves.length === 0) return;
    chessGame.move(moves[Math.floor(Math.random() * moves.length)]);
    chessBoard.position(chessGame.fen());
    updateChessStatus();
}

window.syncLocalGame = function(gameType, state) {
    if (gameType === 'chess') {
        chessGame.load(state);
        chessBoard.position(state);
        updateChessStatus();
    }
};
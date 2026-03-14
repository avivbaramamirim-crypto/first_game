/**
 * chess.js
 */
var chessBoard = null;
var chessGame = new Chess();

window.initChess = function() {
    if (chessBoard) chessBoard.destroy();
    chessGame = new Chess();
    
    let orientation = 'white';
    if (window.currentGameMode === 'online') {
        orientation = (window.getMyRole() === 'b') ? 'black' : 'white';
    }

    chessBoard = Chessboard('chessBoard', {
        draggable: true,
        position: 'start',
        orientation: orientation,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: (source, piece) => {
            if (chessGame.game_over()) return false;
            if (window.currentGameMode === 'online') {
                const myRole = window.getMyRole();
                if (piece.charAt(0) !== myRole || chessGame.turn() !== myRole) return false;
            } else if (window.currentGameMode === 'ai' && piece.charAt(0) === 'b') return false;
        },
        onDrop: (source, target) => {
            const move = chessGame.move({ from: source, to: target, promotion: 'q' });
            if (move === null) return 'snapback';
            if (window.currentGameMode === 'online') window.broadcastMove(chessGame.fen());
            else if (window.currentGameMode === 'ai') setTimeout(makeRandomChessMove, 400);
            updateChessStatus();
        }
    });
    updateChessStatus();
};

function updateChessStatus() {
    let s = chessGame.turn() === 'b' ? 'תור השחור' : 'תור הלבן';
    if (chessGame.in_checkmate()) s = "מט!";
    document.getElementById('chess-status').innerText = s;
}

function makeRandomChessMove() {
    const moves = chessGame.moves();
    if (moves.length === 0) return;
    chessGame.move(moves[Math.floor(Math.random() * moves.length)]);
    chessBoard.position(chessGame.fen());
    updateChessStatus();
}

window.syncLocalGame = function(type, state) {
    if (type === 'chess') { chessGame.load(state); chessBoard.position(state); updateChessStatus(); }
};
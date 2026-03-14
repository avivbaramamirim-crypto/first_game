var chessBoard = null;
var chessGame = new Chess();

window.initChess = function() {
    if (chessBoard) chessBoard.destroy();
    chessGame = new Chess();
    let orient = (window.currentGameMode === 'online' && window.getMyRole() === 'b') ? 'black' : 'white';

    chessBoard = Chessboard('chessBoard', {
        draggable: true, position: 'start', orientation: orient,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: (s, p) => {
            if (chessGame.game_over()) return false;
            if (window.currentGameMode === 'ai' && p.charAt(0) === 'b') return false;
        },
        onDrop: (s, t) => {
            const move = chessGame.move({ from: s, to: t, promotion: 'q' });
            if (move === null) return 'snapback';
            if (window.currentGameMode === 'ai') setTimeout(makeRandomMove, 500);
            updateStatus();
        }
    });
    updateStatus();
};

function updateStatus() {
    const turn = chessGame.turn() === 'w' ? "לבן" : "שחור";
    window.updateStatus('chess-status', `תור ${turn}`, true);
}

function makeRandomMove() {
    const moves = chessGame.moves();
    if (moves.length > 0) {
        chessGame.move(moves[Math.floor(Math.random() * moves.length)]);
        chessBoard.position(chessGame.fen());
        updateStatus();
    }
}
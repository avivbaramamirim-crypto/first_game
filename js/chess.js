var chessBoard = null;
var chessGame = new Chess();

window.initChess = function() {
    // Ensure board element exists and is clean
    const boardEl = document.getElementById('chessBoard');
    if (!boardEl) {
        console.error('Chess board element not found');
        return;
    }
    
    // Force clean DOM state
    boardEl.innerHTML = '';
    
    if (chessBoard) {
        try {
            chessBoard.destroy();
        } catch (e) {
            console.warn('Chess board destroy failed:', e);
        }
    }
    
    chessGame = new Chess();
    let orient = 'white'; // Default orientation
    
    // Only set black orientation in online mode with proper role
    if (window.currentGameMode === 'online' && typeof window.getMyRole === 'function') {
        const role = window.getMyRole();
        orient = role === 'b' ? 'black' : 'white';
    }

    chessBoard = Chessboard('chessBoard', {
        draggable: true, 
        position: 'start', 
        orientation: orient,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: (s, p) => {
            if (chessGame.game_over()) return false;
            if (window.currentGameMode === 'ai' && p.charAt(0) === 'b') return false;
        },
        onDrop: (s, t) => {
            const move = chessGame.move({ from: s, to: t, promotion: 'q' });
            if (move === null) {
                return 'snapback';
            }
            
            // Update position after a short delay to ensure proper rendering
            setTimeout(() => {
                chessBoard.position(chessGame.fen());
                highlightSquare(t);
                updateStatus();
                
                // Trigger AI move after successful player move in AI mode
                if (window.currentGameMode === 'ai' && chessGame.turn() === 'b') {
                    setTimeout(makeRandomMove, 600);
                }
            }, 50);
        }
    });
    updateStatus();
};

function highlightSquare(square) {
    const squareEl = $('#chessBoard .square-' + square);
    squareEl.addClass('highlight-white');
}


function updateStatus() {
    const turn = chessGame.turn() === 'w' ? "לבן" : "שחור";
    window.updateStatus('chess-status', `תור ${turn}`, true);
}


function makeRandomMove() {
    const moves = chessGame.moves({ verbose: true });
    if (moves.length > 0) {
        // AI difficulty-based logic
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            let score = 0;
            
            // Make temporary move to evaluate
            const tempGame = new Chess(chessGame.fen());
            tempGame.move(move.san);
            
            // Check if this move wins the game
            if (tempGame.in_checkmate()) {
                score += 1000;
            }
            
            // Check for pawn promotion
            if (move.piece === 'p' && (move.to.charAt(1) === '8' || move.to.charAt(1) === '1')) {
                score += 50;
            }
            
            // Check if this move puts opponent in check
            if (tempGame.in_check()) {
                score += 50;
            }
            
            // Evaluate piece captures (using standard chess piece values)
            if (move.captured) {
                const pieceValues = { 'p': 10, 'n': 30, 'b': 30, 'r': 50, 'q': 90, 'k': 1000 };
                score += pieceValues[move.captured.toLowerCase()] || 0;
            }
            
            // Prefer center control
            if (move.to && move.to.charAt(0) >= 'd' && move.to.charAt(0) <= 'f') {
                score += 5;
            }
            
            // Prefer developing pieces (knights and bishops off back rank)
            if (move.piece && ['n', 'b'].includes(move.piece.toLowerCase())) {
                if (move.to && move.to.charAt(1) > '2') {
                    score += 8;
                }
            }
            
            // Prefer castling
            if (move.flags && move.flags.includes('k')) {
                score += 20;
            }
            
            // Apply difficulty modifiers
            if (window.aiDifficulty === 'easy') {
                // Easy: Add more randomness, make mistakes
                score += Math.random() * 30 - 15; // -15 to +15 random
                // Sometimes make suboptimal moves
                if (Math.random() < 0.3) {
                    score = Math.random() * 20; // Random low score
                }
            } else if (window.aiDifficulty === 'medium') {
                // Medium: Balanced play
                score += Math.random() * 10 - 5; // -5 to +5 random
            } else if (window.aiDifficulty === 'hard') {
                // Hard: Smart play, minimal randomness
                score += Math.random() * 2 - 1; // -1 to +1 random
                
                // Additional hard mode strategies
                // Look ahead 1 move for opponent threats
                const opponentMoves = tempGame.moves({ verbose: true });
                let opponentThreats = 0;
                for (const oppMove of opponentMoves) {
                    if (oppMove.captured) opponentThreats += 10;
                }
                score -= opponentThreats * 0.5; // Avoid moves that allow captures
                
                // Prefer moves that control key squares
                const keySquares = ['d4', 'e4', 'd5', 'e5', 'c4', 'f4', 'c5', 'f5'];
                if (move.to && keySquares.includes(move.to)) {
                    score += 15;
                }
                
                // Protect king more
                if (tempGame.in_check()) {
                    score += 100; // Prioritize getting out of check
                }
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        // Execute the best move found
        if (bestMove && bestMove.san) {
            chessGame.move(bestMove.san);
            chessBoard.position(chessGame.fen());
            chessBoard.clearHighlights();
            updateStatus();
            
            console.log(`AI (${window.aiDifficulty}) made move:`, bestMove.san, 'with score:', bestScore.toFixed(1));
        } else {
            // Fallback: make a random move if something went wrong
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            chessGame.move(randomMove.san);
            chessBoard.position(chessGame.fen());
            chessBoard.clearHighlights();
            updateStatus();
            console.log(`AI (${window.aiDifficulty}) made fallback move:`, randomMove.san);
        }
        
        // Check for game end
        if (chessGame.game_over()) {
            if (chessGame.in_checkmate()) {
                const winner = chessGame.turn() === 'w' ? 'שחור' : 'לבן';
                window.triggerEndgameAnim('win', `${winner} ניצח בשחמט!`);
            } else if (chessGame.in_draw()) {
                window.triggerEndgameAnim('draw', 'תיקו!');
            }
        }
    }
}

// Add a function to clear board highlights
window.clearChessHighlights = function() {
    if (chessBoard) {
        chessBoard.clearHighlights();
    }
};
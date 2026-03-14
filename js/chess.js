// ==========================================
//  1. שחמט (Drag & Drop חלק, תוקן הדיליי)
// ==========================================
var chessBoard = null, chessGame = new Chess(), pendingPromotionMove = null;
var pieceValues = { 'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000 };

function evaluateChessBoard(game) { var eval = 0, b = game.board(); for (var i=0; i<8; i++) for (var j=0; j<8; j++) if (b[i][j]) eval += (b[i][j].color === 'b' ? pieceValues[b[i][j].type] : -pieceValues[b[i][j].type]); return eval; }

function minimaxAlphaBeta(game, depth, alpha, beta, isMax) {
    if (depth === 0 || game.game_over()) return evaluateChessBoard(game);
    var moves = game.moves();
    if (isMax) { var bestMove = -99999; for (var i = 0; i < moves.length; i++) { game.move(moves[i]); bestMove = Math.max(bestMove, minimaxAlphaBeta(game, depth - 1, alpha, beta, !isMax)); game.undo(); alpha = Math.max(alpha, bestMove); if (beta <= alpha) return bestMove; } return bestMove; } 
    else { var bestMove = 99999; for (var i = 0; i < moves.length; i++) { game.move(moves[i]); bestMove = Math.min(bestMove, minimaxAlphaBeta(game, depth - 1, alpha, beta, !isMax)); game.undo(); beta = Math.min(beta, bestMove); if (beta <= alpha) return bestMove; } return bestMove; }
}

function makeAdvancedChessMove() {
    if (chessGame.game_over()) return;
    var moves = chessGame.moves(); if(moves.length === 0) return;
    var bestVal = -99999, bestMoveFound = moves[0];
    for(var i=0; i<moves.length; i++) { chessGame.move(moves[i]); var val = minimaxAlphaBeta(chessGame, 2, -100000, 100000, false); chessGame.undo(); if(val >= bestVal) { bestVal = val; bestMoveFound = moves[i]; } }
    
    var moveObj = chessGame.move(bestMoveFound);
    playWoodSound(moveObj.captured != null); 
    chessBoard.position(chessGame.fen()); 
    updChessStat();
}

function updChessStat() {
    var colorText = chessGame.turn() === 'b' ? (currentGameMode==='pvp'?'שחקן 2 (שחור)':'המחשב (שחור)') : 'שחקן 1 (לבן)';
    if (chessGame.in_checkmate()) { $('#chess-status').html('המשחק הסתיים במט!'); setTimeout(() => { if(currentGameMode === 'pvp') triggerEndgameAnim('win', 'ניצחון ל' + (chessGame.turn()==='b'?'לבן':'שחור') + '!'); else chessGame.turn() === 'b' ? triggerEndgameAnim('win') : triggerEndgameAnim('lose'); }, 500); } 
    else if (chessGame.in_draw()) { $('#chess-status').html('המשחק הסתיים בתיקו.'); setTimeout(() => triggerEndgameAnim('draw'), 500); } 
    else { var txt = 'תור: ' + colorText; if (chessGame.in_check()) txt += ' - <span style="color:red">שח!</span>'; $('#chess-status').html(txt); }
}

function showPromotionModal(color) {
    const piecesDiv = document.getElementById('promotion-pieces'); piecesDiv.innerHTML = '';
    ['q', 'r', 'b', 'n'].forEach(p => { const img = document.createElement('img'); img.src = `https://chessboardjs.com/img/chesspieces/wikipedia/${color}${p.toUpperCase()}.png`; img.className = 'promotion-piece'; img.onclick = () => selectPromotion(p); piecesDiv.appendChild(img); });
    document.getElementById('promotion-modal').style.display = 'block';
}

function selectPromotion(pieceType) { 
    document.getElementById('promotion-modal').style.display = 'none'; 
    if (pendingPromotionMove) { 
        pendingPromotionMove.promotion = pieceType; 
        var moveObj = chessGame.move(pendingPromotionMove); 
        playWoodSound(moveObj.captured != null); 
        chessBoard.position(chessGame.fen()); 
        pendingPromotionMove = null; 
        updChessStat();
        if(!chessGame.game_over() && currentGameMode === 'ai' && chessGame.turn() === 'b'){
            $('#chess-status').html("המחשב חושב...");
            window.setTimeout(makeAdvancedChessMove, 250); 
        }
    } 
}

function cancelPromotion() { 
    document.getElementById('promotion-modal').style.display = 'none'; 
    pendingPromotionMove = null; 
    chessBoard.position(chessGame.fen()); 
}

function initChess() { 
    document.getElementById('chess-subtitle').innerText = currentGameMode === 'ai' ? 'רמה גבוהה. הרגלי מכתיר לבחירתך!' : 'מצב PvP: שחקו יחד על הלוח'; 
    chessGame.reset(); pendingPromotionMove = null; 
    document.getElementById('promotion-modal').style.display = 'none'; 
    
    if (chessBoard !== null) chessBoard.destroy();
    
    chessBoard = Chessboard('chessBoard', { 
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png', 
        draggable: true, 
        position: 'start',
        onDragStart: function(source, piece) {
            if (chessGame.game_over() || pendingPromotionMove) return false;
            if (currentGameMode === 'ai' && piece.search(/^b/) !== -1) return false;
            if (currentGameMode === 'pvp' && piece.charAt(0) !== chessGame.turn()) return false;
        },
        onDrop: function(source, target) {
            var mvs = chessGame.moves({ verbose: true }).filter(m => m.from === source && m.to === target);
            if (mvs.length === 0) return 'snapback';
            
            if (mvs[0].promotion) {
                pendingPromotionMove = { from: source, to: target };
                showPromotionModal(chessGame.turn());
                return;
            }
            
            var moveObj = chessGame.move({ from: source, to: target });
            if(moveObj) {
                playWoodSound(moveObj.captured != null);
                updChessStat();
                
                if(!chessGame.game_over() && currentGameMode === 'ai' && chessGame.turn() === 'b'){
                    $('#chess-status').html("המחשב חושב...");
                    window.setTimeout(makeAdvancedChessMove, 250);
                }
            }
        },
        onSnapEnd: function() {
            chessBoard.position(chessGame.fen());
        }
    }); 
    updChessStat(); 
}
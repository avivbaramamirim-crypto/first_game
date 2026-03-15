/**
 * checkers.js
 */
let chkB = [], chkT = 'r', chkS = null;

// Local helper – lets AI mode work even without external mode wiring
function getCheckersMode() {
    if (typeof window !== 'undefined' && window.currentGameMode) {
        return window.currentGameMode;
    }
    // Default to AI vs Human when no global mode is defined
    return 'ai';
}

window.initCheckers = function() {
    console.log('Initializing Checkers...');
    
    const boardEl = document.getElementById('checkersBoard');
    if (!boardEl) {
        console.error('Checkers board element not found');
        return;
    }
    
    console.log('Checkers board element found, clearing and drawing...');
    
    // Force clean DOM
    boardEl.innerHTML = '';
    
    chkB = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 !== 0) chkB[r][c] = { color: 'b', king: false };
    for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 !== 0) chkB[r][c] = { color: 'r', king: false };
    chkT = 'r'; chkS = null;
    
    console.log('Checkers board state initialized, drawing board...');
    
    drawCheckers();
    updateChkStatus();
    
    console.log('Checkers initialization completed');
};

function drawCheckers() {
    const board = document.getElementById('checkersBoard');
    if (!board) return;
    board.innerHTML = '';
    board.style.setProperty('display', 'grid', 'important');
    board.style.gridTemplateColumns = 'repeat(8, 1fr)';
    board.style.gap = '2px';
    board.style.width = '400px';
    board.style.height = '400px';
    board.style.margin = '0 auto';
    board.style.border = '2px solid #8b4513';
    board.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    
    const flipped = (typeof window !== 'undefined' &&
        window.currentGameMode === 'online' &&
        window.getMyRole &&
        window.getMyRole() === 'b');

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let dr = flipped ? 7 - r : r;
            let dc = flipped ? 7 - c : c;
            const sq = document.createElement('div');
            sq.style.backgroundColor = (dr + dc) % 2 === 0 ? '#f0d9b5' : '#b58863';
            sq.style.display = 'flex'; 
            sq.style.justifyContent = 'center'; 
            sq.style.alignItems = 'center';
            sq.style.cursor = 'pointer';
            sq.style.borderRadius = '4px';
            sq.style.position = 'relative';
            if (chkS && chkS.r === dr && chkS.c === dc) sq.style.boxShadow = 'inset 0 0 10px yellow';

            const p = chkB[dr][dc];
            if (p) {
                const piece = document.createElement('div');
                piece.style.width = '70%';
                piece.style.height = '70%';
                piece.style.borderRadius = '50%';
                piece.style.backgroundColor = p.color === 'r' ? '#e74c3c' : '#2c3e50';
                piece.style.border = '3px solid ' + (p.color === 'r' ? '#c0392b' : '#1a252f');
                piece.style.display = 'flex';
                piece.style.justifyContent = 'center';
                piece.style.alignItems = 'center';
                piece.style.fontSize = '1.2rem';
                piece.style.color = 'white';
                piece.style.fontWeight = 'bold';
                piece.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                if (p.king) piece.innerHTML = '';
                sq.appendChild(piece);
            }
            sq.onclick = () => handleChk(dr, dc);
            board.appendChild(sq);
        }
    }
}

function handleChk(r, c) {
    console.log('Checkers - Mode:', window.currentGameMode, 'Turn:', chkT, 'Click:', r, c);
    
    // Validate board bounds
    if (r < 0 || r >= 8 || c < 0 || c >= 8) {
        console.error('Invalid board position:', r, c);
        return;
    }
    
    // In AI mode, only allow human to move red pieces (human plays red)
    if (getCheckersMode() === 'ai' && chkT === 'b') {
        console.log('AI turn - blocking human move');
        return;
    }
    
    // In online mode, only allow moving your own pieces
    if (typeof window !== 'undefined' && window.currentGameMode === 'online') {
        const myC = window.getMyRole && window.getMyRole() === 'w' ? 'r' : 'b';
        if (chkT !== myC) {
            console.log('Move blocked - not your turn in online mode');
            return;
        }
    }
    
    const p = chkB[r][c];
    if (p && p.color === chkT) { 
        console.log('Piece selected:', p.color);
        chkS = { r, c }; 
        drawCheckers(); 
    }
    else if (chkS) { 
        // Try to perform a move based on custom rules (no forced capture, long-range king)
        if (!chkB[r][c]) {
            if (tryMovePiece(chkS.r, chkS.c, r, c)) {
                chkS = null;
                drawCheckers();
                updateChkStatus();
                
                // Check for win condition after the move
                if (checkChkWin()) {
                    const winner = chkT === 'r' ? 'שחור' : 'אדום';
                    if (typeof window !== 'undefined' && window.triggerEndgameAnim) {
                        window.triggerEndgameAnim('win', `${winner} ניצח בדמקה!`);
                    }
                    return;
                }
                
                // Trigger AI if relevant
                if (getCheckersMode() === 'ai' && chkT === 'b') {
                    console.log('Checkers - Triggering AI move after player move');
                    setTimeout(makeRandomMove, 800);
                } else {
                    console.log('Checkers - Not triggering AI. Mode:', window.currentGameMode, 'Turn:', chkT);
                }
            } else {
                alert('מהלך לא חוקי');
                chkS = null;
                drawCheckers();
            }
        } else {
            alert('מהלך לא חוקי');
            chkS = null;
            drawCheckers();
        }
    } else {
        console.log('No piece selected and no selected piece to move');
    }
}

// Try to move a piece from (fr,fc) to (tr,tc) according to custom rules:
// - No mandatory capture
// - Normal pieces move/capture 1 or 2 diagonals forward
// - Kings are long-range: can move diagonally multiple squares and capture over distance
function tryMovePiece(fr, fc, tr, tc) {
    const piece = chkB[fr][fc];
    if (!piece) return false;
    
    const dr = tr - fr;
    const dc = tc - fc;
    
    // Must stay on board
    if (tr < 0 || tr >= 8 || tc < 0 || tc >= 8) return false;
    
    // Diagonal move only
    if (Math.abs(dr) !== Math.abs(dc)) return false;
    
    // Long-range king logic
    if (piece.king) {
        const stepR = dr > 0 ? 1 : -1;
        const stepC = dc > 0 ? 1 : -1;
        let r = fr + stepR;
        let c = fc + stepC;
        let encounteredEnemy = null;
        
        while (r !== tr && c !== tc) {
            const mid = chkB[r][c];
            if (mid) {
                if (mid.color === piece.color) {
                    // Blocked by own piece
                    return false;
                }
                if (encounteredEnemy) {
                    // More than one enemy on path – not allowed in single move
                    return false;
                }
                encounteredEnemy = { r, c };
            }
            r += stepR;
            c += stepC;
        }
        
        // Perform move
        chkB[tr][tc] = piece;
        chkB[fr][fc] = null;
        
        if (encounteredEnemy) {
            chkB[encounteredEnemy.r][encounteredEnemy.c] = null;
        }
        
        // Turn switch after one move (even if more captures were possible)
        chkT = chkT === 'r' ? 'b' : 'r';
        return true;
    }
    
    // Normal (non-king) piece
    const forwardDir = piece.color === 'r' ? -1 : 1;
    
    // Simple move – one step forward diagonally
    if (Math.abs(dr) === 1 && dr === forwardDir && Math.abs(dc) === 1) {
        chkB[tr][tc] = piece;
        chkB[fr][fc] = null;
        
        // Promotion to king when reaching opposite side
        if (piece.color === 'r' && tr === 0) piece.king = true;
        if (piece.color === 'b' && tr === 7) piece.king = true;
        
        chkT = chkT === 'r' ? 'b' : 'r';
        return true;
    }
    
    // Capture – two steps diagonally over enemy piece
    if (Math.abs(dr) === 2 && dr === 2 * forwardDir && Math.abs(dc) === 2) {
        const midR = (fr + tr) / 2;
        const midC = (fc + tc) / 2;
        const midP = chkB[midR][midC];
        if (!midP || midP.color === piece.color) return false;
        
        chkB[tr][tc] = piece;
        chkB[fr][fc] = null;
        chkB[midR][midC] = null;
        
        // Promotion to king
        if (piece.color === 'r' && tr === 0) piece.king = true;
        if (piece.color === 'b' && tr === 7) piece.king = true;
        
        chkT = chkT === 'r' ? 'b' : 'r';
        return true;
    }
    
    return false;
}

function checkChkWin() {
    // Check if opponent has any pieces or moves
    const opponentColor = chkT === 'r' ? 'b' : 'r';
    let opponentPieces = 0;
    let opponentHasMoves = false;
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = chkB[r][c];
            if (piece && piece.color === opponentColor) {
                opponentPieces++;
                
                // Check if this piece has any valid moves
                let directions = [];
                if (piece.king) {
                    directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
                } else if (piece.color === 'r') {
                    directions = [[-1, -1], [-1, 1]];
                } else {
                    directions = [[1, -1], [1, 1]];
                }
                
                for (let [dr, dc] of directions) {
                    const newR = r + dr;
                    const newC = c + dc;
                    
                    // Check regular moves
                    if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8 && !chkB[newR][newC]) {
                        opponentHasMoves = true;
                        break;
                    }
                    
                    // Check jumps
                    const jumpR = r + (dr * 2);
                    const jumpC = c + (dc * 2);
                    const midR = r + dr;
                    const midC = c + dc;
                    
                    if (jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8 && 
                        !chkB[jumpR][jumpC] && chkB[midR][midC] && 
                        chkB[midR][midC].color !== opponentColor) {
                        opponentHasMoves = true;
                        break;
                    }
                }
                
                if (opponentHasMoves) break;
            }
        }
        if (opponentHasMoves) break;
    }
    
    // Win if opponent has no pieces or no valid moves
    return opponentPieces === 0 || !opponentHasMoves;
}

function updateChkStatus() {
    const turn = chkT === 'r' ? 'אדום' : 'שחור';
    window.updateStatus('chk-status', `תור ${turn}`, true);
}

window.syncLocalGame = function(type, state) {
if (type === 'checkers') { chkB = state; chkT = (chkT === 'r') ? 'b' : 'r'; drawCheckers(); updateChkStatus(); }
};

function makeRandomMove() {
console.log('Checkers AI making move, current turn:', chkT, 'Mode:', window.currentGameMode);
    
if (chkT !== 'b') {
console.log('Not AI turn - chkT is:', chkT);
return;
}
    
console.log('Current board state before AI move:');
for (let r = 0; r < 8; r++) {
    let rowStr = '';
    for (let c = 0; c < 8; c++) {
        const piece = chkB[r][c];
        if (piece) {
            rowStr += piece.color + (piece.king ? 'K' : ' ');
        } else {
            rowStr += '. ';
        }
    }
    console.log(`Row ${r}: ${rowStr}`);
}
    
const availableJumps = [];
const availableMoves = [];
    
// Find all possible moves and jumps for AI (black)
for (let r = 0; r < 8; r++) {
for (let c = 0; c < 8; c++) {
const piece = chkB[r][c];
if (piece && piece.color === 'b') {
let directions = [];
if (piece.king) {
directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
} else {
directions = [[1, -1], [1, 1]]; // Black moves down
}
                
for (let [dr, dc] of directions) {
const newR = r + dr;
const newC = c + dc;
                    
// Regular moves
if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8 && !chkB[newR][newC]) {
availableMoves.push({ from: { r, c }, to: { r: newR, c: newC } });
}
                    
// Jumps
const jumpR = r + (dr * 2);
const jumpC = c + (dc * 2);
const midR = r + dr;
const midC = c + dc;
                    
if (jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8 && 
!chkB[jumpR][jumpC] && chkB[midR][midC] && 
chkB[midR][midC].color === 'r') {
availableJumps.push({ 
from: { r, c }, 
to: { r: jumpR, c: jumpC }, 
jump: { r: midR, c: midC }
});
}
}
}
}
}
    
console.log('Available jumps:', availableJumps.length, 'Available moves:', availableMoves.length);
    
let move;
    
// Must take jumps if available
if (availableJumps.length > 0) {
move = availableJumps[Math.floor(Math.random() * availableJumps.length)];
console.log('AI taking jump:', move);
} else if (availableMoves.length > 0) {
move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
console.log('AI making regular move:', move);
} else {
console.log('AI has no moves available');
return;
}
    
console.log('Executing AI move:', move);
    
// Execute the move
if (move.jump) {
console.log('AI executing jump:', move);
chkB[move.jump.r][move.jump.c] = null;
}
chkB[move.to.r][move.to.c] = chkB[move.from.r][move.from.c];
chkB[move.from.r][move.from.c] = null;
    
console.log('AI move executed - new board state:');
for (let r = 0; r < 8; r++) {
let rowStr = '';
for (let c = 0; c < 8; c++) {
const piece = chkB[r][c];
if (piece) {
rowStr += piece.color + (piece.king ? 'K' : ' ');
} else {
rowStr += '. ';
}
}
console.log(`Row ${r}: ${rowStr}`);
}
    
// King promotion
if (chkB[move.to.r][move.to.c].color === 'b' && move.to.r === 7) {
chkB[move.to.r][move.to.c].king = true;
console.log('AI piece promoted to king!');
}
    
// Switch turn back to human
chkT = 'r';
drawCheckers();
updateChkStatus();
console.log('AI move completed, turn switched to:', chkT);
}
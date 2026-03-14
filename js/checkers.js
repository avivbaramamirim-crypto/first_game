/**
 * checkers.js
 */
let chkB = [], chkT = 'r', chkS = null;

window.initCheckers = function() {
    chkB = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 !== 0) chkB[r][c] = { color: 'b', king: false };
    for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 !== 0) chkB[r][c] = { color: 'r', king: false };
    chkT = 'r'; chkS = null;
    drawCheckers();
    updateChkStatus();
};

function drawCheckers() {
    const board = document.getElementById('checkersBoard');
    if (!board) return;
    board.innerHTML = '';
    board.style.display = 'grid';
    board.style.gridTemplateColumns = 'repeat(8, 1fr)';
    board.style.gap = '2px';
    board.style.width = '400px';
    board.style.height = '400px';
    board.style.margin = '0 auto';
    board.style.border = '2px solid #8b4513';
    board.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    
    const flipped = (window.currentGameMode === 'online' && window.getMyRole && window.getMyRole() === 'b');

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
    
    // In AI mode, only allow human to move red pieces (human plays red)
    if (window.currentGameMode === 'ai' && chkT === 'b') {
        console.log('AI turn - blocking human move');
        return;
    }
    
    // In online mode, only allow moving your own pieces
    if (window.currentGameMode === 'online') {
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
        const isJump = Math.abs(r - chkS.r) === 2 && Math.abs(c - chkS.c) === 2;
        const isMove = Math.abs(r - chkS.r) === 1 && Math.abs(c - chkS.c) === 1;

        if (isMove && !chkB[r][c]) {
            // Check for mandatory jumps
            if (hasMandatoryJumps(chkT)) {
                alert('חייב לבצע אכילה!');
                chkS = null;
                drawCheckers();
                return;
            }
            
            chkB[r][c] = chkB[chkS.r][chkS.c]; 
            chkB[chkS.r][chkS.c] = null;
            
            // King promotion
            if (chkB[r][c].color === 'r' && r === 0) chkB[r][c].king = true;
            if (chkB[r][c].color === 'b' && r === 7) chkB[r][c].king = true;
            
            chkT = chkT === 'r' ? 'b' : 'r'; 
            chkS = null; 
            if (window.currentGameMode === 'online' && window.broadcastMove) window.broadcastMove(chkB);
            drawCheckers();
            updateChkStatus();
            if (window.currentGameMode === 'ai' && chkT === 'b') setTimeout(makeRandomMove, 800);
        } else if (isJump && !chkB[r][c]) {
            const midR = Math.floor((r + chkS.r) / 2);
            const midC = Math.floor((c + chkS.c) / 2);
            const midP = chkB[midR][midC];
            if (midP && midP.color !== chkT) {
                chkB[r][c] = chkB[chkS.r][chkS.c];
                chkB[chkS.r][chkS.c] = null;
                chkB[midR][midC] = null;
                
                // King promotion
                if (chkB[r][c].color === 'r' && r === 0) chkB[r][c].king = true;
                if (chkB[r][c].color === 'b' && r === 7) chkB[r][c].king = true;
                
                chkT = chkT === 'r' ? 'b' : 'r';
                chkS = null;
                if (window.currentGameMode === 'online' && window.broadcastMove) window.broadcastMove(chkB);
                drawCheckers();
                updateChkStatus();
                if (window.currentGameMode === 'ai' && chkT === 'b') setTimeout(makeRandomMove, 800);
            } else {
                alert('אכילה לא חוקית - אין כלי לאכול');
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

function hasMandatoryJumps(color) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = chkB[r][c];
            if (piece && piece.color === color) {
                let directions = [];
                if (piece.king) {
                    directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
                } else if (piece.color === 'r') {
                    directions = [[-1, -1], [-1, 1]];
                } else {
                    directions = [[1, -1], [1, 1]];
                }
                
                for (let [dr, dc] of directions) {
                    const jumpR = r + (dr * 2);
                    const jumpC = c + (dc * 2);
                    const midR = r + dr;
                    const midC = c + dc;
                    
                    if (jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8 && 
                        !chkB[jumpR][jumpC] && chkB[midR][midC] && 
                        chkB[midR][midC].color !== color) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function updateChkStatus() {
    const turn = chkT === 'r' ? 'אדום' : 'שחור';
    window.updateStatus('chk-status', `תור ${turn}`, true);
}

window.syncLocalGame = function(type, state) {
    if (type === 'checkers') { chkB = state; chkT = (chkT === 'r') ? 'b' : 'r'; drawCheckers(); updateChkStatus(); }
};

function makeRandomMove() {
    console.log('AI making move, current turn:', chkT);
    
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
    
    // Execute the move
    if (move.jump) {
        chkB[move.jump.r][move.jump.c] = null;
    }
    chkB[move.to.r][move.to.c] = chkB[move.from.r][move.from.c];
    chkB[move.from.r][move.from.c] = null;
    
    // King promotion
    if (chkB[move.to.r][move.to.c].color === 'b' && move.to.r === 7) {
        chkB[move.to.r][move.to.c].king = true;
        console.log('AI piece promoted to king!');
    }
    
    // Switch turn back to human
    chkT = 'r';
    drawCheckers();
    updateChkStatus();
}
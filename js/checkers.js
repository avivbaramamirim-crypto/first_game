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
    board.innerHTML = '';
    const flipped = (window.currentGameMode === 'online' && window.getMyRole() === 'b');

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let dr = flipped ? 7 - r : r;
            let dc = flipped ? 7 - c : c;
            const sq = document.createElement('div');
            sq.style.backgroundColor = (dr + dc) % 2 === 0 ? '#f0d9b5' : '#b58863';
            sq.style.display = 'flex'; sq.style.justifyContent = 'center'; sq.style.alignItems = 'center';
            if (chkS && chkS.r === dr && chkS.c === dc) sq.style.boxShadow = 'inset 0 0 10px yellow';

            const p = chkB[dr][dc];
            if (p) {
                const div = document.createElement('div');
                div.style.width = '80%'; div.style.height = '80%'; div.style.borderRadius = '50%';
                div.style.backgroundColor = p.color === 'r' ? '#e74c3c' : '#2c3e50';
                if (p.king) div.innerHTML = '👑';
                sq.appendChild(div);
            }
            sq.onclick = () => handleChk(dr, dc);
            board.appendChild(sq);
        }
    }
}

function handleChk(r, c) {
    // Debug: log current mode and turn
    console.log('Checkers - Mode:', window.currentGameMode, 'Turn:', chkT, 'Click:', r, c);
    
    // In AI mode, only allow human to move red pieces
    if (window.currentGameMode === 'ai' && chkT === 'b') {
        console.log('AI turn - blocking human move');
        return;
    }
    
    // Only restrict moves in online mode
    if (window.currentGameMode === 'online') {
        const myC = window.getMyRole() === 'w' ? 'r' : 'b';
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
            chkB[r][c] = chkB[chkS.r][chkS.c]; 
            chkB[chkS.r][chkS.c] = null;
            chkT = chkT === 'r' ? 'b' : 'r'; 
            chkS = null; 
            if (window.currentGameMode === 'online') window.broadcastMove(chkB);
            if (window.currentGameMode === 'ai' && chkT === 'b') setTimeout(makeRandomMove, 1000);
        } else if (isJump && !chkB[r][c]) {
            const midR = Math.floor((r + chkS.r) / 2);
            const midC = Math.floor((c + chkS.c) / 2);
            const midP = chkB[midR][midC];
            if (midP && midP.color !== chkT) {
                chkB[r][c] = chkB[chkS.r][chkS.c];
                chkB[chkS.r][chkS.c] = null;
                chkB[midR][midC] = null;
                chkT = chkT === 'r' ? 'b' : 'r';
                chkS = null;
                if (window.currentGameMode === 'online') window.broadcastMove(chkB);
                if (window.currentGameMode === 'ai' && chkT === 'b') setTimeout(makeRandomMove, 1000);
            } else {
                alert('Invalid jump - no piece to capture');
                chkS = null;
            }
        } else {
            alert('Invalid move');
            chkS = null;
        }
        drawCheckers();
        updateChkStatus();
    } else {
        console.log('No piece selected and no selected piece to move');
    }
}

function updateChkStatus() {
    const turn = chkT === 'r' ? 'אדום' : 'שחור';
    window.updateStatus('chk-status', `תור ${turn}`, true);
}

window.syncLocalGame = function(type, state) {
    if (type === 'checkers') { chkB = state; chkT = (chkT === 'r') ? 'b' : 'r'; drawCheckers(); updateChkStatus(); }
};

function makeRandomMove() {
    const availableMoves = [];
    const availableJumps = [];
    
    // Find all possible moves and jumps for current player
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = chkB[r][c];
            if (piece && piece.color === chkT) {
                // Determine move directions based on piece type and color
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
                        availableMoves.push({ from: { r, c }, to: { r: newR, c: newC }, priority: 0 });
                    }
                    
                    // Check for jumps
                    const jumpR = r + (dr * 2);
                    const jumpC = c + (dc * 2);
                    const middleR = r + dr;
                    const middleC = c + dc;
                    
                    if (jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8 && 
                        !chkB[jumpR][jumpC] && chkB[middleR][middleC] && 
                        chkB[middleR][middleC].color !== chkT) {
                        
                        // Calculate jump priority
                        let priority = 10; // Base priority for jumps
                        
                        // Higher priority for jumping kings
                        if (chkB[middleR][middleC].king) priority += 5;
                        
                        // Higher priority for getting closer to king row
                        if (piece.color === 'r' && jumpR === 0) priority += 8;
                        if (piece.color === 'b' && jumpR === 7) priority += 8;
                        
                        availableJumps.push({ 
                            from: { r, c }, 
                            to: { r: jumpR, c: jumpC }, 
                            jump: { r: middleR, c: middleC }, 
                            priority 
                        });
                    }
                }
            }
        }
    }
    
    // Strategy: Always take jumps if available (forced in checkers)
    let move;
    if (availableJumps.length > 0) {
        // Choose jump based on difficulty
        if (window.aiDifficulty === 'easy') {
            // Easy: Random jump selection
            move = availableJumps[Math.floor(Math.random() * availableJumps.length)];
            console.log('Easy AI making random jump');
        } else if (window.aiDifficulty === 'medium') {
            // Medium: Choose jump with highest priority
            availableJumps.sort((a, b) => b.priority - a.priority);
            move = availableJumps[0];
            console.log('Medium AI making best jump with priority:', move.priority);
        } else {
            // Hard: Advanced jump strategy
            // Look for multiple jump sequences
            let bestJump = null;
            let bestScore = -Infinity;
            
            for (const jump of availableJumps) {
                let score = jump.priority;
                
                // Simulate the jump to see if it enables more jumps
                const tempBoard = JSON.parse(JSON.stringify(chkB));
                tempBoard[jump.to.r][jump.to.c] = tempBoard[jump.from.r][jump.from.c];
                tempBoard[jump.from.r][jump.from.c] = null;
                tempBoard[jump.jump.r][jump.jump.c] = null;
                
                // Check for additional jumps from this position
                let additionalJumps = countPotentialJumps(tempBoard, chkT, jump.to.r, jump.to.c);
                score += additionalJumps * 15; // Bonus for chain jumps
                
                // Prefer jumps that protect back row
                if (jump.to.r === 0 || jump.to.r === 7) score += 10;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestJump = jump;
                }
            }
            
            move = bestJump;
            console.log('Hard AI making strategic jump with score:', bestScore);
        }
    } else if (availableMoves.length > 0) {
        // Evaluate regular moves with strategy based on difficulty
        availableMoves.forEach(move => {
            let priority = 0;
            
            if (window.aiDifficulty === 'easy') {
                // Easy: Mostly random, slight preference for forward movement
                if (chkT === 'r' && move.to.r < move.from.r) priority += 1;
                if (chkT === 'b' && move.to.r > move.from.r) priority += 1;
                priority += Math.random() * 3; // Add randomness
            } else if (window.aiDifficulty === 'medium') {
                // Medium: Balanced strategy
                if (chkT === 'r' && move.to.r < move.from.r) priority += 2;
                if (chkT === 'b' && move.to.r > move.from.r) priority += 2;
                if (move.to.c === 0 || move.to.c === 7) priority += 1; // Edge safety
                if (move.to.c >= 2 && move.to.c <= 5) priority += 1; // Center control
                priority += Math.random() * 2; // Some randomness
            } else {
                // Hard: Advanced strategy
                if (chkT === 'r' && move.to.r < move.from.r) priority += 3;
                if (chkT === 'b' && move.to.r > move.from.r) priority += 3;
                
                // Positional advantages
                if (move.to.c === 0 || move.to.c === 7) priority += 2; // Edge safety
                if (move.to.c >= 2 && move.to.c <= 5) priority += 2; // Center control
                
                // Avoid moving pieces that are already advanced (protect investment)
                if (chkT === 'r' && move.from.r <= 2) priority -= 1;
                if (chkT === 'b' && move.from.r >= 5) priority -= 1;
                
                // Look ahead: check if this move exposes pieces to jumps
                if (!isMoveSafe(move.from, move.to)) priority -= 5;
                
                // Minimal randomness for hard mode
                priority += Math.random() * 0.5;
            }
            
            move.priority = priority;
        });
        
        // Choose move based on difficulty
        if (window.aiDifficulty === 'easy') {
            // Easy: Random move with slight preference for better moves
            const weightedMoves = availableMoves.map(m => ({
                move: m,
                weight: Math.max(1, m.priority)
            }));
            const totalWeight = weightedMoves.reduce((sum, wm) => sum + wm.weight, 0);
            let random = Math.random() * totalWeight;
            for (const wm of weightedMoves) {
                random -= wm.weight;
                if (random <= 0) {
                    move = wm.move;
                    break;
                }
            }
            if (!move) move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        } else {
            // Medium/Hard: Choose best move with some randomness
            availableMoves.sort((a, b) => b.priority - a.priority);
            const topMoves = availableMoves.filter(m => m.priority >= availableMoves[0].priority - (window.aiDifficulty === 'medium' ? 2 : 1));
            move = topMoves[Math.floor(Math.random() * topMoves.length)];
        }
        
        console.log(`AI (${window.aiDifficulty}) making regular move with priority:`, move.priority);
    }
    
    if (move) {
        // Execute the move
        if (move.jump) {
            chkB[move.jump.r][move.jump.c] = null; // Remove jumped piece
        }
        chkB[move.to.r][move.to.c] = chkB[move.from.r][move.from.c];
        chkB[move.from.r][move.from.c] = null;
        
        // Check for king promotion
        if ((chkT === 'r' && move.to.r === 0) || (chkT === 'b' && move.to.r === 7)) {
            chkB[move.to.r][move.to.c].king = true;
            console.log('AI promoted a piece to king!');
        }
        
        chkT = chkT === 'r' ? 'b' : 'r';
        drawCheckers();
        updateChkStatus();
        
        // Continue AI vs AI or trigger next AI move
        if (window.currentGameMode === 'ai') {
            setTimeout(() => {
                if (chkT === 'b') { // AI plays black pieces
                    makeRandomMove();
                }
            }, window.aiDifficulty === 'easy' ? 1200 : (window.aiDifficulty === 'medium' ? 800 : 600));
        }
    } else {
        console.log('AI has no available moves');
    }
}

function countPotentialJumps(board, color, fromR, fromC) {
    const piece = board[fromR][fromC];
    if (!piece || piece.color !== color) return 0;
    
    let directions = [];
    if (piece.king) {
        directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    } else if (piece.color === 'r') {
        directions = [[-1, -1], [-1, 1]];
    } else {
        directions = [[1, -1], [1, 1]];
    }
    
    let jumps = 0;
    for (let [dr, dc] of directions) {
        const jumpR = fromR + (dr * 2);
        const jumpC = fromC + (dc * 2);
        const middleR = fromR + dr;
        const middleC = fromC + dc;
        
        if (jumpR >= 0 && jumpR < 8 && jumpC >= 0 && jumpC < 8 && 
            !board[jumpR][jumpC] && board[middleR][middleC] && 
            board[middleR][middleC].color !== color) {
            jumps++;
        }
    }
    
    return jumps;
}

function isMoveSafe(fromR, fromC, toR, toC) {
    // Check if moving from fromR,fromC to toR,toC exposes pieces to opponent jumps
    const tempBoard = JSON.parse(JSON.stringify(chkB));
    tempBoard[toR][toC] = tempBoard[fromR][fromC];
    tempBoard[fromR][fromC] = null;
    
    const opponentColor = chkT === 'r' ? 'b' : 'r';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = tempBoard[r][c];
            if (piece && piece.color === opponentColor) {
                const jumps = countPotentialJumps(tempBoard, opponentColor, r, c);
                if (jumps > 0) return false; // Move is unsafe
            }
        }
    }
    return true; // Move is safe
}
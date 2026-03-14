let c4B = [], c4T = 'red', c4Act = true;

window.initConnect4 = function() {
    c4B = Array(6).fill(null).map(() => Array(7).fill(null));
    c4T = 'red'; c4Act = true;
    updateC4UI(); drawC4();
};

function drawC4() {
    const board = document.getElementById('c4Board');
    board.innerHTML = '';
    board.style.display = 'grid'; board.style.gridTemplateColumns = 'repeat(7, 1fr)';
    board.style.background = 'var(--dark-wood)'; board.style.padding = '10px';

    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            const cell = document.createElement('div');
            cell.style.aspectRatio = '1/1'; cell.style.borderRadius = '50%'; cell.style.margin = '4px';
            cell.style.background = c4B[r][c] === 'red' ? '#e53935' : (c4B[r][c] === 'yellow' ? '#fdd835' : '#263238');
            cell.style.boxShadow = 'inset 0 4px 6px rgba(0,0,0,0.5)';
            cell.onclick = () => handleC4(c);
            board.appendChild(cell);
        }
    }
}

function handleC4(c) {
    if (!c4Act || (c4T === 'yellow' && window.currentGameMode === 'ai')) return;
    let r = -1;
    for (let i = 5; i >= 0; i--) if (!c4B[i][c]) { r = i; break; }
    if (r === -1) return;

    c4B[r][c] = c4T;
    if (checkC4Win(r, c)) {
        drawC4(); c4Act = false;
        window.triggerEndgameAnim('win', (c4T === 'red' ? 'אדום' : 'צהוב') + " ניצח!");
    } else {
        c4T = c4T === 'red' ? 'yellow' : 'red';
        drawC4(); updateC4UI();
        if (c4T === 'yellow' && window.currentGameMode === 'ai') setTimeout(aiC4, 800);
    }
}

function checkC4Win(r, c) {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let [dr, dc] of dirs) {
        let n = 1;
        for (let i=1; i<4; i++) { let nr=r+dr*i, nc=c+dc*i; if (nr>=0&&nr<6&&nc>=0&&nc<7&&c4B[nr][nc]===c4T) n++; else break; }
        for (let i=1; i<4; i++) { let nr=r-dr*i, nc=c-dc*i; if (nr>=0&&nr<6&&nc>=0&&nc<7&&c4B[nr][nc]===c4T) n++; else break; }
        if (n >= 4) return true;
    }
    return false;
}

function aiC4() {
    // AI difficulty-based strategy
    let move = null;
    let bestScore = -Infinity;
    
    // Try each column and evaluate
    for (let c = 0; c < 7; c++) {
        const r = getR(c);
        if (r === -1) continue;
        
        // Simulate move
        const tempBoard = c4B.map(row => [...row]);
        tempBoard[r][c] = c4T;
        
        let score = 0;
        
        // Check if this move wins
        if (checkC4WinOnBoard(tempBoard, r, c, c4T)) {
            score += 1000;
        }
        
        // Check if this blocks opponent win
        const opponentColor = c4T === 'red' ? 'yellow' : 'red';
        tempBoard[r][c] = opponentColor;
        if (checkC4WinOnBoard(tempBoard, r, c, opponentColor)) {
            score += 500;
        }
        
        // Reset to our move
        tempBoard[r][c] = c4T;
        
        // Apply difficulty modifiers
        if (window.aiDifficulty === 'easy') {
            // Easy: Basic strategy with randomness
            score += Math.random() * 100 - 50; // -50 to +50 random
            // Prefer center columns slightly
            if (c >= 2 && c <= 4) score += 10;
        } else if (window.aiDifficulty === 'medium') {
            // Medium: Balanced strategy
            score += Math.random() * 30 - 15; // -15 to +15 random
            // Prefer center columns
            if (c >= 2 && c <= 4) score += 20;
            // Prefer columns that build vertical stacks
            let stackHeight = 0;
            for (let row = 0; row < 6; row++) {
                if (tempBoard[row][c]) stackHeight++;
            }
            score += stackHeight * 5;
        } else {
            // Hard: Advanced strategy
            score += Math.random() * 10 - 5; // -5 to +5 random
            // Strong center preference
            if (c >= 2 && c <= 4) score += 30;
            
            // Look for future winning opportunities
            for (let futureCol = 0; futureCol < 7; futureCol++) {
                const futureRow = getROnBoard(tempBoard, futureCol);
                if (futureRow === -1) continue;
                
                tempBoard[futureRow][futureCol] = opponentColor;
                if (checkC4WinOnBoard(tempBoard, futureRow, futureCol, opponentColor)) {
                    // This column allows opponent to win, block it
                    if (futureCol === c) score += 200;
                }
                tempBoard[futureRow][futureCol] = null;
            }
            
            // Prefer building multiple threats
            let threats = countThreats(tempBoard, r, c, c4T);
            score += threats * 50;
        }
        
        if (score > bestScore) {
            bestScore = score;
            move = c;
        }
    }
    
    // Make the best move found
    if (move !== null) {
        const r = getR(move);
        if (r !== -1) {
            c4B[r][move] = c4T;
            if (checkC4Win(r, move)) {
                finishAI(move);
                return;
            }
            c4T = (c4T === 'red') ? 'yellow' : 'red';
            finishAI(move);
        }
    } else {
        // Fallback: random move
        const availableCols = [];
        for (let c = 0; c < 7; c++) {
            if (getR(c) !== -1) availableCols.push(c);
        }
        if (availableCols.length > 0) {
            const randomCol = availableCols[Math.floor(Math.random() * availableCols.length)];
            const r = getR(randomCol);
            if (r !== -1) {
                c4B[r][randomCol] = c4T;
                if (checkC4Win(r, randomCol)) {
                    finishAI(randomCol);
                    return;
                }
                c4T = (c4T === 'red') ? 'yellow' : 'red';
                finishAI(randomCol);
            }
        }
    }
}

function checkC4WinOnBoard(board, row, col, player) {
    // Check win on temporary board
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1] // horizontal, vertical, diagonal
    ];
    
    for (let [dr, dc] of directions) {
        let count = 1;
        let positions = [[row, col]];
        
        // Check positive direction
        for (let i = 1; i < 4; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
                board[newRow][newCol] === player) {
                count++;
                positions.push([newRow, newCol]);
            } else {
                break;
            }
        }
        
        // Check negative direction
        for (let i = 1; i < 4; i++) {
            const newRow = row - dr * i;
            const newCol = col - dc * i;
            if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
                board[newRow][newCol] === player) {
                count++;
                positions.push([newRow, newCol]);
            } else {
                break;
            }
        }
        
        if (count >= 4) return true;
    }
    
    return false;
}

function getROnBoard(board, c) {
    for (let i = 5; i >= 0; i--) {
        if (!board[i][c]) return i;
    }
    return -1;
}

function countThreats(board, row, col, player) {
    let threats = 0;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    
    for (let [dr, dc] of directions) {
        let count = 1;
        
        // Count in positive direction
        for (let i = 1; i < 4; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
                board[newRow][newCol] === player) {
                count++;
            } else {
                break;
            }
        }
        
        // Count in negative direction
        for (let i = 1; i < 4; i++) {
            const newRow = row - dr * i;
            const newCol = col - dc * i;
            if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
                board[newRow][newCol] === player) {
                count++;
            } else {
                break;
            }
        }
        
        if (count >= 3) threats++; // Potential winning threat
    }
    
    return threats;
}

function getR(c) { for(let i=5; i>=0; i--) if(!c4B[i][c]) return i; return -1; }
function finishAI(c) { c4T = 'yellow'; handleC4(c); }
function updateC4UI() { window.updateStatus('c4-status', c4T==='red'?"תור אדום":"תור צהוב", true); }
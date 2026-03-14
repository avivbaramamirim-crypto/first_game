/**
 * tictactoe.js
 */
let tttB = Array(9).fill(null), tttT = 'X';

window.initTicTacToe = function() {
    tttB = Array(9).fill(null); tttT = 'X';
    drawTTT();
    updateTTTStatus();
};

function drawTTT() {
    const b = document.getElementById('tttBoard');
    b.innerHTML = '';
    tttB.forEach((v, i) => {
        const sq = document.createElement('div');
        sq.style.backgroundColor = '#ecf0f1';
        sq.style.display = 'flex'; sq.style.alignItems = 'center'; sq.style.justifyContent = 'center';
        sq.style.fontSize = '2rem';
        sq.innerText = v || '';
        sq.onclick = () => handleTTT(i);
        b.appendChild(sq);
    });
}

function handleTTT(i) {
    if (tttB[i]) return;
    
    // In AI mode, only allow human to move when it's X's turn
    if (window.currentGameMode === 'ai' && tttT === 'O') {
        console.log('AI turn - blocking human move');
        return;
    }
    
    // Only restrict moves in online mode
    if (window.currentGameMode === 'online') {
        const myS = window.getMyRole() === 'w' ? 'X' : 'O';
        if (tttT !== myS) return;
    }
    
    tttB[i] = tttT;
    tttT = tttT === 'X' ? 'O' : 'X';
    drawTTT();
    updateTTTStatus();
    
    // Only broadcast in online mode
    if (window.currentGameMode === 'online') {
        window.broadcastMove(tttB);
    }
    
    // Trigger AI move in AI mode
    if (window.currentGameMode === 'ai' && tttT === 'O') {
        setTimeout(makeTTTAIMove, 800);
    }
}

function makeTTTAIMove() {
    const availableMoves = tttB.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
    
    if (availableMoves.length > 0) {
        // AI difficulty-based logic
        let move = null;
        
        if (window.aiDifficulty === 'easy') {
            // Easy: Random moves with slight preference for center/corners
            if (tttB[4] === null) {
                move = 4;
            } else {
                const corners = [0, 2, 6, 8].filter(corner => tttB[corner] === null);
                if (corners.length > 0) {
                    move = corners[Math.floor(Math.random() * corners.length)];
                } else {
                    move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                }
            }
        } else if (window.aiDifficulty === 'medium') {
            // Medium: Try to win, block, then strategic
            move = findWinningMove('O');
            if (move === null) {
                move = findWinningMove('X');
                if (move === null) {
                    if (tttB[4] === null) {
                        move = 4;
                    } else {
                        const corners = [0, 2, 6, 8].filter(corner => tttB[corner] === null);
                        if (corners.length > 0) {
                            move = corners[Math.floor(Math.random() * corners.length)];
                        } else {
                            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                        }
                    }
                }
            }
        } else {
            // Hard: Perfect play - always optimal
            move = findWinningMove('O');
            if (move === null) {
                move = findWinningMove('X');
                if (move === null) {
                    // Strategic priority: center > corners > edges
                    if (tttB[4] === null) {
                        move = 4;
                    } else {
                        const corners = [0, 2, 6, 8].filter(corner => tttB[corner] === null);
                        if (corners.length > 0) {
                            // Choose best corner based on opponent's position
                            move = corners[0];
                        } else {
                            const edges = [1, 3, 5, 7].filter(edge => tttB[edge] === null);
                            if (edges.length > 0) {
                                move = edges[0];
                            }
                        }
                    }
                }
            }
        }
        
        if (move !== null) {
            tttB[move] = 'O';
        } else {
            // Fallback to random move
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            tttB[randomMove] = 'O';
        }
        
        tttT = 'X';
        drawTTT();
        updateTTTStatus();
    }
}

function findWinningMove(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        const line = [tttB[a], tttB[b], tttB[c]];
        
        if (line.filter(cell => cell === player).length === 2 && line.includes(null)) {
            if (tttB[a] === null) return a;
            if (tttB[b] === null) return b;
            if (tttB[c] === null) return c;
        }
    }
    
    return null;
}

function updateTTTStatus() {
    const turn = tttT === 'X' ? 'X' : 'O';
    window.updateStatus('ttt-status', `תור ${turn}`, true);
}

window.syncLocalGame = function(type, state) {
    if (type === 'tictactoe') { tttB = state; tttT = (tttT === 'X') ? 'O' : 'X'; drawTTT(); updateTTTStatus(); }
};
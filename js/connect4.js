let c4B = [], c4T = 'red', c4Act = true;

window.initConnect4 = function() {
    const boardEl = document.getElementById('c4Board');
    if (!boardEl) {
        console.error('Connect4 board element not found');
        return;
    }
    
    // Force clean DOM
    boardEl.innerHTML = '';
    
    c4B = Array(6).fill(null).map(() => Array(7).fill(null));
    c4T = 'red'; c4Act = true;
    updateC4UI(); drawC4();
};

function drawC4() {
    const board = document.getElementById('c4Board');
    board.innerHTML = '';
    board.style.display = 'grid'; 
    board.style.gridTemplateColumns = 'repeat(7, 1fr)';
    board.style.gap = '8px';
    board.style.background = '#1e3a8a'; 
    board.style.padding = '15px';
    board.style.borderRadius = '10px';
    board.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    board.style.width = '420px';
    board.style.margin = '0 auto';

    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            const cell = document.createElement('div');
            cell.style.aspectRatio = '1/1'; 
            cell.style.borderRadius = '50%'; 
            cell.style.border = '3px solid #1e293b';
            cell.style.cursor = 'pointer';
            cell.style.transition = 'all 0.3s ease';
            
            if (c4B[r][c] === 'red') {
                cell.style.background = 'radial-gradient(circle at 30% 30%, #ef4444, #dc2626)';
                cell.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)';
            } else if (c4B[r][c] === 'yellow') {
                cell.style.background = 'radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b)';
                cell.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)';
            } else {
                cell.style.background = 'radial-gradient(circle at 30% 30%, #475569, #334155)';
                cell.style.boxShadow = 'inset 0 4px 6px rgba(0,0,0,0.5)';
            }
            
            cell.onmouseover = () => {
                if (!c4B[r][c]) cell.style.transform = 'scale(1.05)';
            };
            cell.onmouseout = () => {
                if (!c4B[r][c]) cell.style.transform = 'scale(1)';
            };
            
            cell.onclick = () => handleC4(c);
            board.appendChild(cell);
        }
    }
}

function handleC4(c) {
    console.log('Connect4 - Column clicked:', c, 'Current turn:', c4T, 'Mode:', window.currentGameMode, 'Active:', c4Act);
    
    if (!c4Act || (c4T === 'yellow' && window.currentGameMode === 'ai')) {
        console.log('Move blocked - Not active or AI turn');
        return;
    }
    
    let r = -1;
    for (let i = 5; i >= 0; i--) if (!c4B[i][c]) { r = i; break; }
    if (r === -1) {
        console.log('Column is full');
        return;
    }

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
    console.log('Connect4 AI called, current turn:', c4T, 'mode:', window.currentGameMode);
    
    // Simple AI for now - can be enhanced later
    const availableCols = [];
    for (let c = 0; c < 7; c++) {
        let r = -1;
        for (let i = 5; i >= 0; i--) if (!c4B[i][c]) { r = i; break; }
        if (r !== -1) availableCols.push(c);
    }
    
    console.log('Available columns for AI:', availableCols);
    
    if (availableCols.length > 0) {
        // Try center columns first
        const preferredCols = [3, 2, 4, 1, 5, 0, 6];
        for (let col of preferredCols) {
            if (availableCols.includes(col)) {
                handleC4(col);
                return;
            }
        }
    }
}

function updateC4UI() { 
    window.updateStatus('c4-status', c4T==='red'?"תור אדום":"תור צהוב", true); 
}

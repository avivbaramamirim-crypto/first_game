/**
 * ארבע בשורה - חוקי נפילה וניצחון ב-4 כיוונים
 */
let c4B = [], c4T = 'red', c4Act = true;

function initConnect4() {
    c4B = Array(6).fill(null).map(() => Array(7).fill(null));
    c4T = 'red'; c4Act = true;
    drawConnect4();
}

function drawConnect4() {
    const board = document.getElementById('c4Board');
    board.innerHTML = '';
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            const sq = document.createElement('div');
            sq.className = 'c4-sq';
            sq.style.width = '45px'; sq.style.height = '45px';
            sq.style.borderRadius = '50%';
            sq.style.margin = '2px';
            sq.style.backgroundColor = c4B[r][c] === 'red' ? '#e74c3c' : (c4B[r][c] === 'yellow' ? '#f1c40f' : '#ecf0f1');
            sq.onclick = () => handleC4Click(c);
            board.appendChild(sq);
        }
    }
    document.getElementById('c4-status').innerText = "תור: " + (c4T === 'red' ? 'אדום' : 'צהוב');
}

function handleC4Click(c) {
    if (!c4Act) return;
    if (window.currentGameMode === 'online') {
        const myColor = window.getMyRole() === 'w' ? 'red' : 'yellow';
        if (c4T !== myColor) return;
    }

    let r = -1;
    for (let i = 5; i >= 0; i--) {
        if (c4B[i][c] === null) { r = i; break; }
    }
    if (r === -1) return;

    c4B[r][c] = c4T;
    window.playWoodSound(false);
    
    if (checkC4Win(r, c)) {
        drawConnect4();
        c4Act = false;
        triggerEndgameAnim('win', (c4T === 'red' ? 'האדום' : 'הצהוב') + " ניצח!");
    } else {
        c4T = c4T === 'red' ? 'yellow' : 'red';
        drawConnect4();
        if (window.currentGameMode === 'online') window.broadcastMove(JSON.stringify(c4B));
        else if (window.currentGameMode === 'ai' && c4T === 'yellow') setTimeout(aiConnect4, 500);
    }
}

function checkC4Win(r, c) {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let [dr, dc] of dirs) {
        let count = 1;
        for (let i=1; i<4; i++) {
            let nr = r+dr*i, nc = c+dc*i;
            if (nr>=0 && nr<6 && nc>=0 && nc<7 && c4B[nr][nc] === c4T) count++; else break;
        }
        for (let i=1; i<4; i++) {
            let nr = r-dr*i, nc = c-dc*i;
            if (nr>=0 && nr<6 && nc>=0 && nc<7 && c4B[nr][nc] === c4T) count++; else break;
        }
        if (count >= 4) return true;
    }
    return false;
}

function aiConnect4() {
    const validCols = [];
    for (let c=0; c<7; c++) if(c4B[0][c] === null) validCols.push(c);
    if (validCols.length > 0) handleC4Click(validCols[Math.floor(Math.random() * validCols.length)]);
}
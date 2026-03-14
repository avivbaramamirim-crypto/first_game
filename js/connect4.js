/**
 * ארבע בשורה - AI משופר ומראה עץ
 */
let c4B = [], c4T = 'red', c4Act = true;

window.initConnect4 = function() {
    c4B = Array(6).fill(null).map(() => Array(7).fill(null));
    c4T = 'red';
    c4Act = true;
    updateC4UI();
    drawC4();
};

function drawC4() {
    const board = document.getElementById('c4Board');
    if (!board) return;
    board.innerHTML = '';
    board.style.display = 'grid';
    board.style.gridTemplateColumns = 'repeat(7, 1fr)';
    board.style.background = 'var(--wood-dark)';
    board.style.padding = '10px';

    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            const cell = document.createElement('div');
            cell.style.aspectRatio = '1/1';
            cell.style.borderRadius = '50%';
            cell.style.margin = '3px';
            cell.style.background = c4B[r][c] === 'red' ? 'var(--danger)' : (c4B[r][c] === 'yellow' ? 'var(--gold)' : '#34495e');
            cell.style.boxShadow = 'inset 0 4px 8px rgba(0,0,0,0.4)';
            cell.onclick = () => handleC4Click(c);
            board.appendChild(cell);
        }
    }
}

function handleC4Click(c) {
    if (!c4Act) return;
    if (window.currentGameMode === 'ai' && c4T === 'yellow') return;

    let r = -1;
    for (let i = 5; i >= 0; i--) {
        if (c4B[i][c] === null) { r = i; break; }
    }
    if (r === -1) return;

    c4B[r][c] = c4T;
    
    if (checkC4Win(r, c)) {
        drawC4();
        c4Act = false;
        window.triggerEndgameAnim('win', (c4T === 'red' ? 'אדום' : 'צהוב') + " ניצח!");
    } else {
        c4T = c4T === 'red' ? 'yellow' : 'red';
        drawC4();
        updateC4UI();
        if (window.currentGameMode === 'ai' && c4T === 'yellow') {
            setTimeout(aiC4Move, 800);
        }
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

function aiC4Move() {
    // AI חכם יותר - מחפש ניצחון או חסימה
    let bestCol = -1;
    
    // 1. האם המחשב יכול לנצח?
    for(let c=0; c<7; c++) {
        let r = getAvailableRow(c);
        if(r!==-1) {
            c4B[r][c] = 'yellow';
            if(checkC4Win(r, c)) { c4B[r][c] = null; handleC4Click(c); return; }
            c4B[r][c] = null;
        }
    }
    
    // 2. האם צריך לחסום את השחקן?
    let originalTurn = c4T;
    c4T = 'red';
    for(let c=0; c<7; c++) {
        let r = getAvailableRow(c);
        if(r!==-1) {
            c4B[r][c] = 'red';
            if(checkC4Win(r, c)) { c4B[r][c] = null; c4T = 'yellow'; handleC4Click(c); return; }
            c4B[r][c] = null;
        }
    }
    c4T = 'yellow';

    // 3. סתם מהלך רנדומלי
    const valid = [];
    for (let c=0; c<7; c++) if(c4B[0][c] === null) valid.push(c);
    handleC4Click(valid[Math.floor(Math.random() * valid.length)]);
}

function getAvailableRow(c) {
    for (let i = 5; i >= 0; i--) if (c4B[i][c] === null) return i;
    return -1;
}

function updateC4UI() {
    const text = c4T === 'red' ? "תור אדום" : "תור צהוב (מחשב)";
    window.updateTurnUI('c4-status', text, true);
}
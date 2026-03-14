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
    // מחפש ניצחון
    for(let c=0; c<7; c++) {
        let r = getR(c); if(r===-1) continue;
        c4B[r][c] = 'yellow'; if(checkC4Win(r,c)) { c4B[r][c]=null; finishAI(c); return; } c4B[r][c]=null;
    }
    // מחפש לחסום שחקן
    let oldT = c4T; c4T = 'red';
    for(let c=0; c<7; c++) {
        let r = getR(c); if(r===-1) continue;
        c4B[r][c] = 'red'; if(checkC4Win(r,c)) { c4B[r][c]=null; c4T=oldT; finishAI(c); return; } c4B[r][c]=null;
    }
    c4T = oldT;
    const v = []; for(let c=0; c<7; c++) if(!c4B[0][c]) v.push(c);
    finishAI(v[Math.floor(Math.random()*v.length)]);
}

function getR(c) { for(let i=5; i>=0; i--) if(!c4B[i][c]) return i; return -1; }
function finishAI(c) { c4T = 'yellow'; handleC4(c); }
function updateC4UI() { window.updateStatus('c4-status', c4T==='red'?"תור אדום":"תור צהוב", true); }